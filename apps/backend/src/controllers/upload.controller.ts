import express from "express";
import { randomUUID } from "crypto";
import { AUDIO_EXTENSIONS, type UploadSchema } from "@speako/common/common"; 
import { createUploadUrl } from "../lib/s3";

export async function uploadFile(req: express.Request, res: express.Response) {
    
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { contentType, size } = req.body as UploadSchema;
    const ext = AUDIO_EXTENSIONS[contentType]; 

    try {
      const key = `tmp/${req.userId}/${randomUUID()}.${ext}`;  
      const uploadUrl = await createUploadUrl(key,contentType,size )
      res.json({ uploadUrl, key });
    }catch (err) {
    console.error("presign error:", err);
    res.status(500).json({ error: "Could not create upload URL" });
  }
}
