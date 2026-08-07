import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!accountId || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
    throw new Error('Cloudflare R2 is not configured. Set the R2_* environment variables.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });
}

function bucket() {
  if (!process.env.R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is not configured.');
  return process.env.R2_BUCKET_NAME;
}

export async function uploadResourceFile(key: string, file: File) {
  const client = r2Client();
  await client.send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type }));
}

export async function deleteResourceFile(key: string) {
  await r2Client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

export async function signedDownloadUrl(key: string, filename: string) {
  return getSignedUrl(r2Client(), new GetObjectCommand({
    Bucket: bucket(),
    Key: key,
    ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
  }), { expiresIn: 60 });
}
