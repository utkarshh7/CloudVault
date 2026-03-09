// backend/handlers/renameFile.js
const { S3Client, CopyObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { ok, err, parseBody, getUserSub } = require('../utils/response');

const s3 = new S3Client({ region: process.env.AWS_REGION });
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const BUCKET = process.env.S3_BUCKET;
const TABLE = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({});

  const userSub = getUserSub(event);
  if (!userSub) return err(401, 'Unauthorized');

  const { fileKey, newName, uploadedAt } = parseBody(event);
  if (!fileKey || !newName || !uploadedAt) {
    return err(400, 'fileKey, newName, and uploadedAt are required');
  }

  // Enforce user isolation
  if (!fileKey.startsWith(`users/${userSub}/`)) {
    return err(403, 'Access denied');
  }

  // Build new key preserving timestamp prefix
  const parts = fileKey.split('/');
  const oldFileNamePart = parts[parts.length - 1]; // e.g. "1234567890_oldname.pdf"
  const timestampPrefix = oldFileNamePart.match(/^(\d+_)/)?.[1] || '';
  const sanitizedNewName = newName.replace(/[/\\]/g, '_').slice(0, 200);
  const newFileKey = `users/${userSub}/files/${timestampPrefix}${sanitizedNewName}`;

  try {
    // 1. Copy S3 object to new key
    await s3.send(
      new CopyObjectCommand({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/${fileKey}`,
        Key: newFileKey,
      })
    );

    // 2. Delete old S3 object
    await s3.send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: fileKey })
    );

    // 3. Update DynamoDB item
    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { userSub, uploadedAt },
        UpdateExpression: 'SET #nm = :newName, fileKey = :newKey',
        ExpressionAttributeNames: { '#nm': 'name' },
        ExpressionAttributeValues: {
          ':newName': sanitizedNewName,
          ':newKey': newFileKey,
        },
      })
    );

    console.log(`Renamed ${fileKey} → ${newFileKey}`);
    return ok({ message: 'File renamed', newFileKey, newName: sanitizedNewName });
  } catch (e) {
    console.error('renameFile error:', e);
    return err(500, 'Failed to rename file');
  }
};
