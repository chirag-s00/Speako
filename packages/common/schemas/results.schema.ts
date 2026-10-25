import z from "zod";

const LIMIT_MESSAGE = "Limit must be between 1 and 50.";

export const listQuerySchema = z.object({
  // Digits only: rejects "0x10", "1e1", "2.5", "", and repeated params.
  limit: z
    .string()
    .regex(/^\d{1,2}$/, LIMIT_MESSAGE)
    .transform(Number)
    .pipe(z.number().int().min(1, LIMIT_MESSAGE).max(50, LIMIT_MESSAGE))
    .optional(),
  cursor: z.uuid("Cursor is invalid.").optional(),
});

export const idParamSchema = z.object({
  id: z.uuid(),
});
