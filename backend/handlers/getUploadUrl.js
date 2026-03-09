// backend/handlers/getUploadUrl.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { ok, err, parseBody, getUserSub } = require('../utils/response');

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({});

  const userSub = getUserSub(event);
  if (!userSub) return err(401, 'Unauthorized');

  const { fileName, mimeType } = parseBody(event);
  if (!fileName) return err(400, 'fileName is required');

  // Sanitize filename: strip path separators, limit length
  const sanitized = fileName.replace(/[/\\]/g, '_').slice(0, 200);
  const timestamp = Date.now();
  const fileKey = `users/${userSub}/files/${timestamp}_${sanitized}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      ContentType: mimeType || 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min
    console.log(`Generated upload URL for ${fileKey}`);

    return ok({ uploadUrl, fileKey });
  } catch (e) {
    console.error('getUploadUrl error:', e);
    return err(500, 'Failed to generate upload URL');
  }
};
