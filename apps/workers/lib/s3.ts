import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { Readable } from "node:stream";
import { env } from "./env";
import { PermanentJobError } from "../services/consumer";

const s3 = new S3Client({ region: env.AWS_REGION });

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; 

export async function downloadAudio(audioKey: string): Promise<string> {
  let response;
  try {
    response = await s3.send(
      new GetObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: audioKey })
    );
  } catch (err) {
    if ((err as { name?: string }).name === "NoSuchKey") {
      throw new PermanentJobError(`Audio not found: ${audioKey}`, { cause: err });
    }
    throw err; // anything else (network, throttling) is retryable
  }

  if (!response.Body) {
    throw new PermanentJobError(`Empty S3 object: ${audioKey}`);
  }
  if (response.ContentLength && response.ContentLength > MAX_AUDIO_BYTES) {
    throw new PermanentJobError(`Audio too large: ${response.ContentLength} bytes`);
  }

  const filePath = join(tmpdir(), `${randomUUID()}${extname(audioKey)}`);

  try {
    await pipeline(
      response.Body as Readable,
      createWriteStream(filePath, { flags: "wx", mode: 0o600 }) // owner-only: it's voice data
    );
  } catch (err) {
    await unlink(filePath).catch(() => {}); // don't leave a partial file behind
    throw err;
  }

  return filePath;
}

export async function deleteTempFile(filePath: string): Promise<void> {
  await unlink(filePath).catch(() => {});
}