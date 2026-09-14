import z from 'zod';

const envSchema = z.object({
  PORT: z.string().default('8080'),
});

const env = envSchema.parse(process.env);

export default env;