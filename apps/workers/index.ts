
import { startConsumer, stopConsumer } from "./services/consumer";
import type { JobHandlers } from "./services/consumer";

const handlers: JobHandlers = {
  async process(message, { attempt }) {
    console.log("🎯 Processing job:", {
      jobId: message.jobId,
      drillId: message.drillId,
      audioKey: message.audioKey,
      attempt,
    });

    // TODO: Download the audio from S3,
    // transcribe it, calculate scores, and save the results.
    //
    // For now, this log only confirms that the worker
    // received and started handling the job.
  },

  async onFailed(message, error, { attempt }) {
    console.error("❌ Job failed permanently:", {
      jobId: message.jobId,
      drillId: message.drillId,
      attempt,
      error,
    });

    // TODO: Update the job status in your database.
  },
};

async function main() {
  console.log("🚀 Starting speech worker...");

  await startConsumer(handlers);

  console.log("✅ Worker consumer started");
}

main().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exitCode = 1;
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down worker...`);

  try {
    await stopConsumer();
    process.exitCode = 0;
  } catch (error) {
    console.error("Error shutting down worker:", error);
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
