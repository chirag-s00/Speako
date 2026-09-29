import z from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);