// backend/handlers/listFiles.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { ok, err, getUserSub } = require('../utils/response');

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const TABLE = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({});

  const userSub = getUserSub(event);
  if (!userSub) return err(401, 'Unauthorized');

  const limit = parseInt(event.queryStringParameters?.limit || '100');
  const lastKey = event.queryStringParameters?.lastKey
    ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey))
    : undefined;

  try {
    const res = await dynamo.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'userSub = :sub',
        ExpressionAttributeValues: { ':sub': userSub },
        ScanIndexForward: false, // newest first
        Limit: Math.min(limit, 200),
        ExclusiveStartKey: lastKey,
      })
    );

    console.log(`Listed ${res.Items.length} files for ${userSub}`);

    return ok({
      files: res.Items,
      nextKey: res.LastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(res.LastEvaluatedKey))
        : null,
    });
  } catch (e) {
    console.error('listFiles error:', e);
    return err(500, 'Failed to list files');
  }
};
