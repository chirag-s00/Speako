import { env } from "./lib/env"; // first: crashes at startup if env vars are missing
import { prisma } from "@speako/db/client"
import { startConsumer, stopConsumer } from "./services/consumer";
import { processDrill, markJobFailed } from "./jobs/processDrill.ts";

async function main() {
  await startConsumer({
    process: processDrill,
    onFailed: markJobFailed,
  });
  console.log(`Worker started, queue: ${env.QUEUE_NAME}`);
}

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return; // a second Ctrl+C shouldn't run this twice
  shuttingDown = true;
  console.log(`${signal} received, shutting down`);

  try{
  await stopConsumer();        // stop taking jobs, let running ones finish
  await prisma.$disconnect();  // then close the DB connection
  process.exitCode = 0;
}catch(e){
  console.error("Error during shutdown:",e);
  process.exitCode = 1
}
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

main().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});