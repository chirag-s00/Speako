import zod from "zod";

export const registerSchema = zod.object({
  email: zod.email().trim().toLowerCase().max(254),
  password: zod.string().min(6).max(20),
  username: zod.string().trim().min(1).max(10),
});

export type RegisterSchema = zod.infer<typeof registerSchema>;

export const loginSchema = zod.object({
  email: zod.email().trim().toLowerCase().max(254),
  password: zod.string().min(6).max(20),
});

export type LoginSchema = zod.infer<typeof loginSchema>;
