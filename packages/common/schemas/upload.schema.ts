import zod from "zod"

export const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

export const AUDIO_EXTENSIONS = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
} as const;

export type AllowedAudioType = keyof typeof AUDIO_EXTENSIONS;

const ALLOWED_AUDIO_TYPES = Object.keys(AUDIO_EXTENSIONS) as [
  AllowedAudioType,
  ...AllowedAudioType[],
];

export const uploadSchema = zod.object({
  contentType: zod
    .string()
    .transform((v) => v.split(";")[0]!.trim()) // strip ";codecs=opus"
    .pipe(zod.enum(ALLOWED_AUDIO_TYPES)),
  size: zod.number().int().positive().max(MAX_AUDIO_SIZE), // 25 MB
});
export type UploadSchema = zod.infer<typeof uploadSchema>;

export const authResponseSchema = zod.object({
  message: zod.string(),
  user: zod
    .object({
      id: zod.string(),
      username: zod.string(),
    })
});

export type AuthResponse = zod.infer<typeof authResponseSchema>;
