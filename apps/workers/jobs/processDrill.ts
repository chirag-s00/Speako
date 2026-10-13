import { prisma } from "@speako/db/client";
import { type JobMessage } from "../../../packages/common/schemas/drill.schema";
import { PermanentJobError } from "../services/consumer";
import { downloadAudio, deleteTempFile } from "../lib/s3"
import { transcribe } from "../services/transcribe";
import { computeMetrics } from "../services/metrics";
import { analyze } from "../services/analyze";

const MAX_ERROR_LENGTH = 500;

function errorText(err: unknown): string {
  const text = err instanceof Error ? err.message : String(err);
  return text.slice(0, MAX_ERROR_LENGTH);
}

/**
 * Passed to startConsumer as `process`.
 * Throw a normal Error for retryable failures, PermanentJobError when retrying can't help.
 */
export async function processDrill(
  message: JobMessage,
  ctx: { attempt: number }
): Promise<void> {
  const { jobId } = message;

  // 1. Idempotent claim. A job that is already success/failed (or deleted) is skipped,
  //    so a redelivered message is acked without redoing paid STT/LLM work.
  const claimed = await prisma.job.updateMany({
    where: { id: jobId, status: { in: ["pending", "processing"] } },
    data: {
      status: "processing",
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  if (claimed.count === 0) {
    console.log(`Job ${jobId} is already finished or gone, skipping`);
    return;
  }

  console.log(`Job ${jobId} started (attempt ${ctx.attempt})`);

  try {
    await runPipeline(message);
    console.log(`Job ${jobId} succeeded`);
  } catch (err) {
    // Keep the latest error on the row for debugging; the status stays "processing"
    // while retries are pending, and onFailed flips it to "failed" if they run out.
    await prisma.job
      .updateMany({
        where: { id: jobId, status: "processing" },
        data: { error: errorText(err) },
      })
      .catch(() => {});
    throw err;
  }
}

async function runPipeline(message: JobMessage): Promise<void> {
  const { jobId, drillId, audioKey } = message;

  // 2. If a previous attempt saved the result but crashed before acking, just finish up.
  const existing = await prisma.result.findUnique({
    where: { drillId },
    select: { id: true },
  });
  if (existing) {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "success", finishedAt: new Date(), error: null },
    });
    return;
  }

  // 3. Load what the analysis needs from the drill.
  const drill = await prisma.drill.findUnique({
    where: { id: drillId },
    select: { mode: true, prompt: true },
  });
  if (!drill) {
    throw new PermanentJobError(`Drill ${drillId} no longer exists`);
  }

  // 4. Download the audio to a temp file; always clean it up.
  const filePath = await downloadAudio(audioKey);
  try {
    // TODO: validate format and duration with ffprobe before paying for STT.

    // 5. Speech-to-text with word-level timestamps.
    const transcript = await transcribe(filePath);
    if (!transcript.text.trim() || transcript.words.length === 0) {
      throw new PermanentJobError("No speech detected in recording");
    }


    // 6. Objective numbers computed in code (pace, pauses, filler words).
    const { fillerEvents, ...metricsSummary } = computeMetrics(
      transcript.words,
      transcript.durationSec
    );

    // 7. LLM judgment: scores + coaching tips (already validated against feedbackSchema).
    const feedback = await analyze({
      transcript: transcript.text,
      metrics: { ...metricsSummary, fillerEvents },
      mode: drill.mode,
      prompt: drill.prompt,
    });

    // 8. Save the result and mark the job done in one transaction.
    const resultData = {
      transcript: transcript.text,
      scores: { ...feedback.scores, metrics: metricsSummary },
      tips: feedback.tips,
      fillerEvents,
    };

    await prisma.$transaction([
      prisma.result.upsert({
        where: { drillId },
        create: { drillId, ...resultData },
        update: resultData,
      }),
      prisma.job.update({
        where: { id: jobId },
        data: { status: "success", finishedAt: new Date(), error: null },
      }),
    ]);

  } finally {
    await deleteTempFile(filePath);
  }
}

/**
 * Passed to startConsumer as `onFailed`. Runs once, when retries are used up
 * or a PermanentJobError was thrown.
 */

export async function markJobFailed(
  message: JobMessage,
  error: unknown
): Promise<void> {
  await prisma.job.updateMany({
    where: { id: message.jobId, status: { not: "success" } },
    data: {
      status: "failed",
      error: errorText(error),
      finishedAt: new Date(),
    },
  });
}