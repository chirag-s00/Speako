import express from "express";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AUDIO_EXTENSIONS, type UploadSchema } from "@speako/common/common"; 
import { s3 } from "../lib/s3";
import { env } from "../lib/env";

export async function uploadFile(req: express.Request, res: express.Response) {
    
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { contentType, size } = req.body as UploadSchema;
    const ext = AUDIO_EXTENSIONS[contentType]; 

    try {
        const key = `audio/${req.userId}/${randomUUID()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            ContentLength: size,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.json({ uploadUrl, key });

  } catch (err) {
    console.error("presign error:", err);
    res.status(500).json({ error: "Could not create upload URL" });
  }
}