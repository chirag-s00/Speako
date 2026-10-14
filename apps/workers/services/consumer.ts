import amqp from "amqplib";
import {
  jobMessageSchema,
  assertJobTopology,
  queueNames,
  MAX_ATTEMPTS,
  type JobMessage,
} from "@speako/common/common";
import { env } from "../lib/env";

/** Throw this from a handler when retrying can't help (bad audio file, missing drill, ...). */
export class PermanentJobError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PermanentJobError";
  }
}

export interface JobHandlers {
  /**
   * Do the work. Throw to fail; throw PermanentJobError to skip the retries.
   * Pass ctx.signal to your fetch/ASR/storage calls so a timed-out job actually stops.
   */
  process(
    message: JobMessage,
    ctx: { attempt: number; signal: AbortSignal }
  ): Promise<void>;
  /** Called once when a job has failed for good (permanent error or retries used up). */
  onFailed(message: JobMessage, error: unknown, ctx: { attempt: number }): Promise<void>;
}

const PREFETCH = 2; // jobs processed at the same time by this worker
const RECONNECT_DELAY_MS = 5_000;
const SHUTDOWN_GRACE_MS = 30_000;
// Must stay well below RabbitMQ's consumer_timeout (30 min by default), otherwise the broker
// closes the channel before we get to time the job out ourselves.
const JOB_TIMEOUT_MS = 10 * 60_000;
const RETRY_PUBLISH_TIMEOUT_MS = 5_000;

const names = queueNames(env.QUEUE_NAME);

let stopping = false;
let connection: amqp.ChannelModel | null = null;
let channel: amqp.ConfirmChannel | null = null;
let consumerTag: string | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let inFlight = 0;
let idleWaiters: Array<() => void> = [];

export async function startConsumer(handlers: JobHandlers): Promise<void> {
  // Fail loudly at boot instead of hot-looping on a config mistake later
  if (names.retry.length < MAX_ATTEMPTS - 1) {
    throw new Error(
      `Misconfigured retry queues: need at least ${MAX_ATTEMPTS - 1} for MAX_ATTEMPTS=${MAX_ATTEMPTS}, got ${names.retry.length}`
    );
  }

  stopping = false;
  await connectAndConsume(handlers);
}

// One scheduler for every reconnect path, so we never end up with two consumers
function scheduleReconnect(handlers: JobHandlers): void {
  if (stopping || reconnectTimer) return;
  console.warn(`Reconnecting to RabbitMQ in ${RECONNECT_DELAY_MS}ms`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void connectAndConsume(handlers);
  }, RECONNECT_DELAY_MS);
}

async function connectAndConsume(handlers: JobHandlers): Promise<void> {
  if (stopping) return;

  let conn: amqp.ChannelModel | undefined;
  try {
    conn = await amqp.connect(env.RABBITMQ_URL);
    const current = conn;
    connection = current;

    current.on("error", (err) => console.error("RabbitMQ connection error:", err));
    current.on("close", () => {
      if (connection !== current) return; // already replaced or shut down on purpose
      connection = null;
      channel = null;
      consumerTag = null;
      scheduleReconnect(handlers);
    });

    const ch = await current.createConfirmChannel();
    ch.on("error", (err) => console.error("RabbitMQ channel error:", err));
    // A channel can die while the connection stays healthy (consumer_timeout, bad ack, ...).
    // Recycle the whole connection so the close handler above reconnects us.
    ch.on("close", () => {
      if (connection === current) {
        console.warn("RabbitMQ channel closed, recycling connection");
        current.close().catch(() => {});
      }
    });
    channel = ch;

    await assertJobTopology(ch, env.QUEUE_NAME);
    await ch.prefetch(PREFETCH);

    const { consumerTag: tag } = await ch.consume(names.main, (msg) => {
      if (!msg) {
        // Broker cancelled our consumer (queue deleted, node failover, ...)
        console.warn("Consumer cancelled by broker, recycling connection");
        if (connection === current) current.close().catch(() => {});
        return;
      }
      void handleMessage(ch, msg, handlers).catch((err) =>
        console.error("Unexpected handleMessage failure:", err)
      );
    });
    consumerTag = tag;

    console.log(`Consuming from ${names.main}`);
  } catch (err) {
    console.error("Failed to start consumer:", err);

    // Clear state first so the connection's close handler doesn't schedule a second reconnect
    const failed = conn;
    connection = null;
    channel = null;
    consumerTag = null;
    if (failed) await failed.close().catch(() => {});

    scheduleReconnect(handlers);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function runJob(
  handlers: JobHandlers,
  message: JobMessage,
  attempt: number
): Promise<void> {
  const ac = new AbortController();
  let timer: NodeJS.Timeout | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`Job timed out after ${JOB_TIMEOUT_MS}ms`);
      ac.abort(err); // tell the handler to stop
      reject(err); // and stop waiting even if it ignores the signal
    }, JOB_TIMEOUT_MS);
  });

  try {
    await Promise.race([
      handlers.process(message, { attempt, signal: ac.signal }),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function handleMessage(
  ch: amqp.ConfirmChannel,
  msg: amqp.ConsumeMessage,
  handlers: JobHandlers
): Promise<void> {
  inFlight++;
  try {
    let message: JobMessage;
    try {
      message = jobMessageSchema.parse(JSON.parse(msg.content.toString()));
    } catch (err) {
      // A message we can never parse will never succeed: send it to the dead-letter queue
      console.error("Invalid job message, dead-lettering:", err);
      safeNack(ch, msg);
      return;
    }

    const rawRetryCount = Number(msg.properties.headers?.["x-retry-count"] ?? 0);
    const retryCount =
      Number.isInteger(rawRetryCount) && rawRetryCount >= 0 ? rawRetryCount : 0;
    const attempt = retryCount + 1;

    console.log(`Job ${message.jobId} started (attempt ${attempt})`);

    try {
      await runJob(handlers, message, attempt);
      safeAck(ch, msg);
    } catch (err) {
      await handleFailure(ch, msg, message, err, attempt, handlers);
    }
  } finally {
    inFlight--;
    if (inFlight === 0) {
      const waiters = idleWaiters;
      idleWaiters = [];
      waiters.forEach((resolve) => resolve());
    }
  }
}

async function handleFailure(
  ch: amqp.ConfirmChannel,
  msg: amqp.ConsumeMessage,
  message: JobMessage,
  error: unknown,
  attempt: number,
  handlers: JobHandlers
): Promise<void> {
  const permanent = error instanceof PermanentJobError;
  const exhausted = attempt >= MAX_ATTEMPTS;

  if (permanent || exhausted) {
    console.error(
      `Job ${message.jobId} failed for good (attempt ${attempt}, ${permanent ? "permanent error" : "retries used up"}):`,
      error
    );
    try {
      await handlers.onFailed(message, error, { attempt });
    } catch (hookError) {
      console.error(`onFailed hook threw for job ${message.jobId}:`, hookError);
    }
    safeNack(ch, msg); // no requeue: goes to the dead-letter queue
    return;
  }

  console.warn(`Job ${message.jobId} failed on attempt ${attempt}, scheduling retry:`, error);

  try {
    // Attempt 1 -> retry queue 0, attempt 2 -> retry queue 1, ...
    const retryQueue = names.retry[attempt - 1];
    if (!retryQueue) {
      throw new Error(`Retry queue not found for attempt ${attempt}`);
    }
    await withTimeout(
      publishToRetryQueue(ch, retryQueue, msg, attempt),
      RETRY_PUBLISH_TIMEOUT_MS,
      "Retry publish"
    );
    safeAck(ch, msg); // only ack the original once the retry copy is safely queued
  } catch (publishError) {
    console.error(`Could not schedule retry for job ${message.jobId}:`, publishError);
    safeNack(ch, msg, true); // put it back so the job isn't lost
  }
}

function publishToRetryQueue(
  ch: amqp.ConfirmChannel,
  retryQueue: string,
  msg: amqp.ConsumeMessage,
  attempt: number
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    ch.sendToQueue(
      retryQueue,
      msg.content,
      {
        persistent: true,
        contentType: "application/json",
        messageId: msg.properties.messageId,
        headers: { "x-retry-count": attempt }, // deliberately not copying x-death headers
      },
      (err) => (err ? reject(err) : resolve())
    );
  });
}

// If the channel closed while a job was running, ack/nack throws. The broker then redelivers
// the message, which is why the job handler must be idempotent.
function safeAck(ch: amqp.Channel, msg: amqp.ConsumeMessage) {
  try {
    ch.ack(msg);
  } catch (err) {
    console.warn("Could not ack (channel closed), message will be redelivered:", err);
  }
}

function safeNack(ch: amqp.Channel, msg: amqp.ConsumeMessage, requeue = false) {
  try {
    ch.nack(msg, false, requeue);
  } catch (err) {
    console.warn("Could not nack (channel closed), message will be redelivered:", err);
  }
}

export async function stopConsumer(): Promise<void> {
  stopping = true;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  const ch = channel;
  const conn = connection;
  const tag = consumerTag;

  // Stop receiving new jobs
  if (ch && tag) {
    try {
      await ch.cancel(tag);
    } catch {
      // channel may already be closed
    }
  }

  // Let running jobs finish, but not forever
  if (inFlight > 0) {
    let graceTimer: NodeJS.Timeout | undefined;
    await Promise.race([
      new Promise<void>((resolve) => idleWaiters.push(resolve)),
      new Promise<void>((resolve) => {
        graceTimer = setTimeout(resolve, SHUTDOWN_GRACE_MS);
      }),
    ]);
    clearTimeout(graceTimer);
  }

  connection = null; // so the close handlers don't try to reconnect or recycle
  channel = null;
  consumerTag = null;

  try {
    await ch?.close();
  } catch {
    // already closed
  }
  try {
    await conn?.close();
  } catch {
    // already closed
  }
}