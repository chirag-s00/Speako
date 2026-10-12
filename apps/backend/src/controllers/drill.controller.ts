import express from "express";
import { objectExists, promoteUpload } from "../lib/s3";
import { prisma } from "@speako/db/client";
import { publishJob } from "../services/publisher";

export async function drills(
  req: express.Request,
  res: express.Response
) {
  try {
    const { key, mode, prompt, durationSec } = req.body;
    const userId = req.userId!;
    if (
      typeof key !== "string" ||
      !key.startsWith(`tmp/${userId}/`)
    ) {
      return res.status(403).json({ error: "Invalid audio key" });
    }

    if (!(await objectExists(key))) {
      return res.status(400).json({ error: "Upload not found" });
    }

    const audioKey = await promoteUpload(key);

    const drill = await prisma.drill.create({
      data: {
        userId,
        mode,
        prompt,
        audioKey,
        durationSec,
      },
    });

    const job = await prisma.job.create({
      data: {
        drillId: drill.id,
      },
    });

    await publishJob({
      jobId: job.id,
      drillId: drill.id,
      audioKey,
    });

    return res.status(201).json({
      drillId: drill.id,
      jobId: job.id,
    });
  } catch (error) {
    console.error("Failed to submit drill:", error);

    return res.status(500).json({
      error: "Failed to submit drill",
    });
  }
}
