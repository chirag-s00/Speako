import zod from "zod"

export const drillSchema = zod.object({
  key: zod.string().min(1),
  mode: zod.string().min(1),
  prompt: zod.string().optional(),
  durationSec: zod.number().int().positive().max(300),
});

export const jobMessageSchema = zod.object({
  jobId: zod.string().uuid().min(1),
  drillId: zod.string().uuid().min(1),
  audioKey: zod.string().min(1), 
})

export type JobMessage = zod.infer<typeof jobMessageSchema>;