// backend/handlers/getDownloadUrl.js
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { ok, err, parseBody, getUserSub } = require('../utils/response');

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({});

  const userSub = getUserSub(event);
  if (!userSub) return err(401, 'Unauthorized');

  const { fileKey } = parseBody(event);
  if (!fileKey) return err(400, 'fileKey is required');

  // Enforce user isolation
  if (!fileKey.startsWith(`users/${userSub}/`)) {
    return err(403, 'Access denied: File does not belong to this user');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
    console.log(`Generated download URL for ${fileKey}`);

    return ok({ url });
  } catch (e) {
    console.error('getDownloadUrl error:', e);
    return err(500, 'Failed to generate download URL');
  }
};
