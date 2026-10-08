import zod from "zod";

export const registerSchema = zod.object({
  email: zod.string().trim().toLowerCase().email().max(254),
  password: zod.string().min(6).max(20),
  username: zod.string().trim().min(1).max(10),
});

export const loginSchema = zod.object({
  email: zod.string().trim().toLowerCase().email().max(254),
  password: zod.string().min(6).max(20),
});

