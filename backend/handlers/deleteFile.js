// backend/handlers/deleteFile.js
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { ok, err, parseBody, getUserSub } = require('../utils/response');

const s3 = new S3Client({ region: process.env.AWS_REGION });
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const BUCKET = process.env.S3_BUCKET;
const TABLE = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({});

  const userSub = getUserSub(event);
  if (!userSub) return err(401, 'Unauthorized');

  const { fileKey, uploadedAt } = parseBody(event);
  if (!fileKey || !uploadedAt) {
    return err(400, 'fileKey and uploadedAt are required');
  }

  // Enforce user isolation
  if (!fileKey.startsWith(`users/${userSub}/`)) {
    return err(403, 'Access denied: File does not belong to this user');
  }

  try {
    // Delete from S3
    await s3.send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: fileKey })
    );

    // Delete from DynamoDB
    await dynamo.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { userSub, uploadedAt },
      })
    );

    console.log(`Deleted: ${fileKey}`);
    return ok({ message: 'File deleted' });
  } catch (e) {
    console.error('deleteFile error:', e);
    return err(500, 'Failed to delete file');
  }
};
