// backend/handlers/searchFiles.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { ok, err, getUserSub } = require('../utils/response');

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const TABLE = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({});

  const userSub = getUserSub(event);
  if (!userSub) return err(401, 'Unauthorized');

  const query = (event.queryStringParameters?.q || '').toLowerCase().trim();
  if (!query) return ok({ files: [] });

  try {
    // Query all user files, then filter by name/tags
    // For larger datasets, consider a GSI or OpenSearch
    const res = await dynamo.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'userSub = :sub',
        FilterExpression:
          'contains(#nm, :q) OR contains(#mk, :q)',
        ExpressionAttributeNames: {
          '#nm': 'name',
          '#mk': 'mimeType',
        },
        ExpressionAttributeValues: {
          ':sub': userSub,
          ':q': query,
        },
        ScanIndexForward: false,
        Limit: 500, // scan up to 500 to filter
      })
    );

    // Client-side filter for case-insensitive match
    const files = (res.Items || []).filter(
      (f) =>
        f.name?.toLowerCase().includes(query) ||
        f.mimeType?.toLowerCase().includes(query) ||
        (f.tags || []).some((t) => t.toLowerCase().includes(query))
    );

    console.log(`Search '${query}' returned ${files.length} files for ${userSub}`);
    return ok({ files });
  } catch (e) {
    console.error('searchFiles error:', e);
    return err(500, 'Search failed');
  }
};
