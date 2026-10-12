import amqp from "amqplib";
import { jobMessageSchema, assertJobTopology, type JobMessage } from "@speako/common/common";
import { env } from "../lib/env";

const CONFIRM_TIMEOUT_MS = 5_000;

let closing = false;
let currentConnection: amqp.ChannelModel | null = null;
let channelPromise: Promise<amqp.ConfirmChannel> | null = null;

async function createChannel(): Promise<amqp.ConfirmChannel> {
  const connection = await amqp.connect(env.RABBITMQ_URL);
  currentConnection = connection;

  // Attach handlers immediately: an unhandled "error" event would crash the process
  connection.on("error", (err) => {
    console.error("RabbitMQ connection error:", err);
  });

  connection.on("close", () => {
    // Ignore late events from an old connection that was already replaced
    if (currentConnection === connection) {
      currentConnection = null;
      channelPromise = null;
      console.warn("RabbitMQ connection closed");
    }
  });

  try {
    const channel = await connection.createConfirmChannel();

    channel.on("error", (err) => {
      console.error("RabbitMQ channel error:", err);
    });

    channel.on("close", () => {
      if (currentConnection === connection) {
        currentConnection = null;
        channelPromise = null;
        console.warn("RabbitMQ channel closed");
      }
      // Don't leak the connection when only the channel dies
      connection.close().catch(() => {});
    });

    // Same topology function the worker uses, so the queue options always match
    await assertJobTopology(channel, env.QUEUE_NAME);

    return channel;
  } catch (error) {
    if (currentConnection === connection) currentConnection = null;
    await connection.close().catch(() => {});
    throw error;
  }
}

function getChannel(): Promise<amqp.ConfirmChannel> {
  if (!channelPromise) {
    channelPromise = createChannel().catch((error) => {
      channelPromise = null;
      throw error;
    });
  }
  return channelPromise;
}

/**
 * Throws if RabbitMQ does not confirm the message in time. Treat that as "unknown":
 * the message may still have been queued. Re-publish the SAME jobId (never create a
 * new job), and let the worker's idempotent claim ignore any duplicate.
 */
export async function publishJob(message: JobMessage): Promise<void> {
  if (closing) throw new Error("Publisher is shutting down");

  const payload = jobMessageSchema.parse(message);
  const channel = await getChannel();

  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        channel.sendToQueue(
          env.QUEUE_NAME,
          Buffer.from(JSON.stringify(payload)),
          {
            persistent: true,
            contentType: "application/json",
            messageId: payload.jobId,
          },
          (err) => (err ? reject(err) : resolve())
        );
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Publish confirm timed out")),
          CONFIRM_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function closePublisher(): Promise<void> {
  closing = true;

  const pendingChannel = channelPromise;
  const connection = currentConnection;

  channelPromise = null;
  currentConnection = null;

  if (pendingChannel) {
    try {
      const channel = await pendingChannel;
      await channel.close();
    } catch {
      // Channel may already be closed or its connection may be down.
    }
  }

  if (connection) {
    try {
      await connection.close();
    } catch {
      // Connection may already be closed.
    }
  }
}