import "dotenv/config";
import z from "zod";

const envSchema = z.object({
    AWS_REGION: z.string().min(1),
    AWS_BUCKET_NAME: z.string().min(1),
    RABBITMQ_URL: z.string().url().min(1),
    QUEUE_NAME: z.string().min(1),
})

export const env = envSchema.parse(process.env)