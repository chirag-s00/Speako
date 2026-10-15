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
