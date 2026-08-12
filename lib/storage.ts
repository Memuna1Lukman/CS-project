import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function env(name: string) {
  return process.env[name]?.trim() || undefined;
}

function r2Client() {
  const accountId = env('R2_ACCOUNT_ID');
  const accessKeyId = env('R2_ACCESS_KEY_ID');
  const secretAccessKey = env('R2_SECRET_ACCESS_KEY');
  if (!accountId || !accessKeyId || !secretAccessKey || !env('R2_BUCKET')) {
    throw new Error('Cloudflare R2 is not configured. Set the R2_* environment variables.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function bucket() {
  const value = env('R2_BUCKET');
  if (!value) throw new Error('R2_BUCKET is not configured.');
  return value;
}

export async function uploadResourceFile(key: string, file: File) {
  const client = r2Client();
  await client.send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type }));
}

export async function deleteResourceFile(key: string) {
  await r2Client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

export async function signedDownloadUrl(key: string, filename: string, mimeType?: string) {
  return getSignedUrl(r2Client(), new GetObjectCommand({
    Bucket: bucket(),
    Key: key,
    ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    ...(mimeType ? { ResponseContentType: mimeType } : {}),
  }), { expiresIn: 60 });
}
