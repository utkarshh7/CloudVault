// backend/handlers/addMetadata.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ok, err, parseBody, getUserSub } = require('../utils/response');

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const TABLE = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({});

  const userSub = getUserSub(event);
  if (!userSub) return err(401, 'Unauthorized');

  const { fileKey, name, size, mimeType, tags } = parseBody(event);
  if (!fileKey || !name) return err(400, 'fileKey and name are required');

  // Security: Ensure fileKey belongs to this user
  if (!fileKey.startsWith(`users/${userSub}/`)) {
    return err(403, 'File key does not belong to this user');
  }

  const uploadedAt = new Date().toISOString();

  try {
    await dynamo.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          userSub,           // PK
          uploadedAt,        // SK
          fileKey,
          name,
          size: size || 0,
          mimeType: mimeType || 'application/octet-stream',
          tags: tags || [],
          createdAt: uploadedAt,
        },
      })
    );

    console.log(`Metadata saved: ${fileKey}`);
    return ok({ message: 'Metadata saved', uploadedAt });
  } catch (e) {
    console.error('addMetadata error:', e);
    return err(500, 'Failed to save file metadata');
  }
};
