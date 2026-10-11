import { S3Client,PutObjectCommand, GetObjectCommand,HeadObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: env.AWS_REGION!,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function createUploadUrl(key: string, contentType: string, size: number) {
  return getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: key, ContentType: contentType, ContentLength: size }),
    { expiresIn: 300 }
  );
}

export function createPlaybackUrl(key: string) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: key }), { expiresIn: 300 });
}

export async function objectExists(key: string) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function promoteUpload(tmpKey: string) {
  const finalKey = tmpKey.replace(/^tmp\//, "audio/");
  await s3.send(new CopyObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    CopySource: `${env.AWS_BUCKET_NAME}/${tmpKey}`,
    Key: finalKey,
  }));
  await s3.send(new DeleteObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: tmpKey }));
  return finalKey;
}