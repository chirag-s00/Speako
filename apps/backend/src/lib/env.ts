import z from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number<number>().default(8080),
});

export const env = envSchema.parse(process.env);