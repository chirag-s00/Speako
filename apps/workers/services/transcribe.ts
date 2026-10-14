import { GoogleGenAI } from "@google/genai";
import { extname } from "node:path";
import { env } from "../lib/env";
import { PermanentJobError } from "../services/consumer";
import { AUDIO_EXTENSIONS } from "../../../packages/common/schemas/upload.schema";

const LANGUAGE_CODES = ["en-IN"];
const REQUEST_TIMEOUT_MS = 120_000; // a hung call becomes a retryable error instead of blocking a worker slot

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_KEY,
  httpOptions: { timeout: REQUEST_TIMEOUT_MS },
});

export type TranscribedWord = { word: string; startMs: number; endMs: number };

export type TranscriptResult = {
  text: string;
  words: TranscribedWord[];
  durationSec: number;
};

export async function transcribe(filepath: string): Promise<TranscriptResult> {
  const extension = extname(filepath).slice(1).toLowerCase();
  const mimeType = Object.entries(AUDIO_EXTENSIONS).find(
    ([, ext]) => ext === extension
  )?.[0];

  if (!mimeType) {
    // Retrying can't fix an unsupported file type
    throw new PermanentJobError(`Unsupported audio extension: ${extension}`);
  }

  const audioFile = await ai.files.upload({
    file: filepath,
    config: { mimeType },
  });

  try {
    const response = await ai.interactions.create({
      model: "gemini-3.5-transcribe",
      input: [
        {
          type: "audio",
          uri: audioFile.uri,
          mime_type: audioFile.mimeType,
        },
      ],
      generation_config: {
        transcription_config: {
          language_codes: LANGUAGE_CODES,
          mode: {
            type: "verbatim", // keeps "um", "uh" and repeats, which filler-word detection needs
            timestamp_granularities: ["word"],
          },
        },
      },
    });

    const text = (response.output_text ?? "").trim();
    const words = toWords(extractWordAnnotations(response));

    // Text without timestamps is an API problem, not silence: let the job retry.
    if (text && words.length === 0) {
      throw new Error("Transcript returned without word timestamps");
    }

    // Length of the speech itself (first word to last word end)
    const durationSec = words.length > 0 ? words[words.length - 1]!.endMs / 1000 : 0;

    // Never log the transcript or words: it's the user's private speech.
    console.log(`Transcribed ${words.length} words (${durationSec.toFixed(1)}s)`);

    return { text, words, durationSec };
  } finally {
    // Don't leave the user's voice recording stored in the Gemini Files API
    if (audioFile.name) {
      await ai.files.delete({ name: audioFile.name }).catch(() => {});
    }
  }
}

function parseOffsetMs(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  // Offsets look like "1.23s" in the API responses I found; numbers are assumed to be seconds.
  const seconds =
    typeof value === "number" ? value : Number.parseFloat(value.replace(/s$/, ""));
  return Number.isFinite(seconds) ? Math.round(seconds * 1000) : null;
}

function toWords(annotations: WordAnnotation[]): TranscribedWord[] {
  const words: TranscribedWord[] = [];
  for (const a of annotations) {
    const word = a.text?.trim();
    const startMs = parseOffsetMs(a.start_offset);
    const endMs = parseOffsetMs(a.end_offset);
    if (!word || startMs === null || endMs === null) continue;
    words.push({ word, startMs, endMs });
  }
  return words;
}

type WordAnnotation = {
  type: "word_info";
  text?: string;
  speaker?: string;
  start_offset?: string | number | null;
  end_offset?: string | number | null;
};

function extractWordAnnotations(response: unknown): WordAnnotation[] {
  const words: WordAnnotation[] = [];

  if (typeof response !== "object" || response === null) {
    return words;
  }

  if (!("steps" in response) || !Array.isArray(response.steps)) {
    return words;
  }

  for (const step of response.steps) {
    if (
      typeof step !== "object" ||
      step === null ||
      !("type" in step) ||
      step.type !== "model_output" ||
      !("content" in step) ||
      !Array.isArray(step.content)
    ) {
      continue;
    }

    for (const content of step.content) {
      if (
        typeof content !== "object" ||
        content === null ||
        !("annotations" in content) ||
        !Array.isArray(content.annotations)
      ) {
        continue;
      }

      for (const annotation of content.annotations) {
        if (
          typeof annotation === "object" &&
          annotation !== null &&
          "type" in annotation &&
          annotation.type === "word_info"
        ) {
          words.push(annotation as WordAnnotation);
        }
      }
    }
  }

  return words;
}