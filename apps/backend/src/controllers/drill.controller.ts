import express from "express";
import { objectExists, promoteUpload } from "../lib/s3";
import { prisma } from "@speako/db/client";
import { publishJob } from "../services/publisher";
import { jobIdSchema } from "@speako/common/common";

export async function drills( req: express.Request,res: express.Response) {
  try {
    const { key, mode, prompt, durationSec } = req.body;
    const userId = req.userId;
    if(!userId){
      return res.status(404).json({ error: "Invalid User"})
    }
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



const POLL_INTERVAL_MS = 1_000;
const HEARTBEAT_MS = 20_000; // keeps proxies and load balancers from closing an idle connection
const MAX_STREAM_MS = 5 * 60_000; // the browser reconnects on its own if the job is still running


type JobSnapshot = {
  jobId: string;
  drillId: string;
  status: "pending" | "processing" | "success" | "failed";
  error?: string;
  result?: {
    transcript: string;
    scores: unknown;
    tips: unknown;
    fillerEvents: unknown;
    metrics: unknown;
  };
};

// Only a few failure reasons are meant for users; never leak raw provider errors
function publicError(error: string | null): string {
  if (error?.startsWith("No speech detected")) return "No speech was detected in your recording.";
  if (error?.startsWith("Unsupported audio")) return "This audio format isn't supported.";
  return "We couldn't analyze this recording. Please try again.";
}

async function getSnapshot(jobId: string, userId: string): Promise<JobSnapshot | null> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      status: true,
      error: true,
      drillId: true,
      drill: {
        select: {
          userId: true,
          result: {
            select: { transcript: true, scores: true, tips: true, metrics: true, fillerEvents: true},
          },
        },
      },
    },
  });

  // Treat "not yours" exactly like "doesn't exist"
  if (!job || job.drill.userId !== userId) return null;

  const snapshot: JobSnapshot = { jobId, drillId: job.drillId, status: job.status };

  if (job.status === "failed") {
    snapshot.error = publicError(job.error);
  }
  if (job.status === "success" && job.drill.result) {
    snapshot.result = job.drill.result;
  }
  return snapshot;
}

// GET /jobs/:jobId  (plain polling fallback)
export async function jobStatus(req: express.Request, res: express.Response) {
  const id = jobIdSchema.safeParse(req.params.jobId);
  const userid = req.userId
  if(!userid){
    return res.status(404).json({ error: "Invalid User"})
  }
  if (!id.success){
    return res.status(404).json({ error: "Job not found" });
  } 

  const snapshot = await getSnapshot(id.data, userid);
  if (!snapshot) return res.status(404).json({ error: "Job not found" });

  return res.json(snapshot);
}

// GET /jobs/:jobId/events  (Server-Sent Events)
export async function jobEvents(req: express.Request, res: express.Response) {
  const id = jobIdSchema.safeParse(req.params.jobId);
  if (!id.success) return res.status(404).json({ error: "Job not found" });
  
  const jobId = id.data;
  const userid = req.userId
  if(!userid){
    return res.status(404).json({ error: "Invalid User"})
  }const userId = req.userId;

  // Check access before switching the response into streaming mode
  const first = await getSnapshot(jobId, userid);
  if (!first) return res.status(404).json({ error: "Job not found" });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // tells nginx not to buffer the stream
  });
  res.flushHeaders();

  let closed = false;
  let busy = false;
  let lastStatus: string | null = null;

  const poll = setInterval(() => void tick(), POLL_INTERVAL_MS);
  const heartbeat = setInterval(() => res.write(": ping\n\n"), HEARTBEAT_MS);
  const maxTimer = setTimeout(() => cleanup(), MAX_STREAM_MS);

  function cleanup() {
    if (closed) return;
    closed = true;
    clearInterval(poll);
    clearInterval(heartbeat);
    clearTimeout(maxTimer);
    res.end();
  }

  async function tick() {
  const userid = req.userId
  if(!userid){
    return res.status(404).json({ error: "Invalid User"})
  }
    if (closed || busy) return; // skip if the previous check is still running
    busy = true;
    try {
      const snapshot = await getSnapshot(jobId, userid);
      if (closed) return;
      if (!snapshot) return cleanup();

      // Only send when something changed (the first tick always sends the current state)
      if (snapshot.status !== lastStatus) {
        lastStatus = snapshot.status;
        res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
      }

      if (snapshot.status === "success" || snapshot.status === "failed") cleanup();
    } catch (err) {
      console.error(`SSE poll failed for job ${jobId}:`, err); // transient DB errors: try again next tick
    } finally {
      busy = false;
    }
  }

  req.on("close", cleanup); // the browser went away

  void tick(); // send the current state immediately
}