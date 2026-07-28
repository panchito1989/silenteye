/**
 * SilentEye — Object storage service (S3-compatible: AWS S3 or Cloudflare R2).
 *
 * Offloads large incident photos from Postgres to a PRIVATE bucket, served via
 * short-lived presigned URLs (incident media is sensitive — never public).
 *
 * Fully optional: if the S3_* env vars are absent, isStorageEnabled() is false
 * and callers fall back to storing base64 in the DB exactly as before. Set the
 * bucket up later and new uploads "just work" — no code change, no migration.
 *
 * Config:
 *   S3_BUCKET             (required to enable)
 *   S3_ACCESS_KEY_ID      (required to enable)
 *   S3_SECRET_ACCESS_KEY  (required to enable)
 *   S3_ENDPOINT           (R2: https://<account>.r2.cloudflarestorage.com; omit for AWS S3)
 *   S3_REGION             (default 'auto' for R2; use the AWS region for S3)
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../utils/logger.js';

const bucket = process.env.S3_BUCKET;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || 'auto';

let client: S3Client | null = null;

export function isStorageEnabled(): boolean {
  return !!(bucket && accessKeyId && secretAccessKey);
}

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
      // R2 and most S3-compatible stores want path-style addressing.
      forcePathStyle: !!endpoint,
    });
  }
  return client;
}

/**
 * Upload a base64 JPEG under keyPrefix. Returns the object key, or null on
 * failure / when storage is disabled — callers treat null as "keep it in the DB".
 */
export async function uploadJpegBase64(base64: string, keyPrefix: string): Promise<string | null> {
  if (!isStorageEnabled()) return null;
  try {
    const body = Buffer.from(base64, 'base64');
    const key = `${keyPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
    await getClient().send(new PutObjectCommand({
      Bucket: bucket!,
      Key: key,
      Body: body,
      ContentType: 'image/jpeg',
    }));
    return key;
  } catch (err) {
    logger.warn('[storage] upload failed, falling back to DB:', err);
    return null;
  }
}

/** Short-lived presigned GET URL for a stored object. Null on failure. */
export async function getReadUrl(key: string, expiresSeconds = 3600): Promise<string | null> {
  if (!isStorageEnabled()) return null;
  try {
    return await getSignedUrl(getClient(), new GetObjectCommand({ Bucket: bucket!, Key: key }), { expiresIn: expiresSeconds });
  } catch (err) {
    logger.warn('[storage] presign failed:', err);
    return null;
  }
}
