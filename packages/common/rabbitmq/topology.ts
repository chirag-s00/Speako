import type { Channel } from "amqplib";

// Delay before each retry. Attempt 1 failing waits 5s, attempt 2 waits 30s, attempt 3 waits 2min.
export const RETRY_DELAYS_MS = [5_000, 30_000, 120_000] as const;

// First try + one try per retry delay
export const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1;

export function queueNames(queue: string) {
  return {
    main: queue,
    dlx: `${queue}.dlx`,
    dead: `${queue}.dead`,
    retry: RETRY_DELAYS_MS.map((_, i) => `${queue}.retry.${i}`),
  };
}

export type QueueNames = ReturnType<typeof queueNames>;

/**
 * Declares every exchange and queue. Both the publisher and the consumer call this,
 * so the options can never drift apart (RabbitMQ rejects a mismatched redeclaration).
 */
export async function assertJobTopology(channel: Channel, queue: string): Promise<QueueNames> {
  const names = queueNames(queue);

  // Dead letters: jobs that failed for good
  await channel.assertExchange(names.dlx, "fanout", { durable: true });
  await channel.assertQueue(names.dead, { durable: true });
  await channel.bindQueue(names.dead, names.dlx, "");

  // Main queue: a nack without requeue sends the message to the dead-letter queue
  await channel.assertQueue(names.main, {
    durable: true,
    arguments: { "x-dead-letter-exchange": names.dlx },
  });

  // Retry queues: messages wait out the TTL, then are routed back to the main queue
  // through the default exchange ("") using the main queue's name as routing key.
  for (let i = 0; i < RETRY_DELAYS_MS.length; i++) {
    await channel.assertQueue(names.retry[i], {
      durable: true,
      arguments: {
        "x-message-ttl": RETRY_DELAYS_MS[i],
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": names.main,
      },
    });
  }

  return names;
}