import zod from "zod";

export const registerSchema = zod.object({
  email: zod.email(),
  password: zod.string().min(6).max(20),
  username: zod.string().min(1).max(10),
});

export const loginSchema = zod.object({
  email: zod.email(),
  password: zod.string().min(1).max(20),
});

