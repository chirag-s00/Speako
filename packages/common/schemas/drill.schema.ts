import zod from "zod"

export const drillSchema = zod.object({
  key: zod.string().min(1),
  mode: zod.string().min(1),
  prompt: zod.string().optional(),
  durationSec: zod.number().int().positive().max(300),
});

export const jobMessageSchema = zod.object({
  jobId: zod.uuid().min(1),
  drillId: zod.uuid().min(1),
  audioKey: zod.string().min(1), 
})

export type JobMessage = zod.infer<typeof jobMessageSchema>;

export const drillResponse = zod.object({
  drillId: zod.uuid().min(1),
  jobId: zod.uuid().min(1)
})

export type drillResponse = zod.infer<typeof drillResponse>


const scoreSchema = zod.number().int().min(0).max(100);

export const feedbackSchema = zod.object({
  scores: zod.object({
    pacing: scoreSchema,
    fluency: scoreSchema,
    clarity: scoreSchema,
    coherence: scoreSchema,
    vocabulary: scoreSchema,
  }),
  tips: zod.array(zod.string().min(1)).min(3).max(5),
});

export type Feedback = zod.infer<typeof feedbackSchema>;


export const jobIdSchema = zod.string().uuid();

export type jobIdType = zod.infer<typeof jobIdSchema>

import { z } from "zod";

export const profileSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string(),
});

export const profileResponseSchema = z.object({
  user: profileSchema,
});

export type Profile = z.infer<typeof profileSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;