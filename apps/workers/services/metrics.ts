import type { TranscribedWord } from "./transcribe";

export type FillerEvent = { word: string; start_ms: number };

export type SpeechMetrics = {
  wordsPerMinute: number;
  pauseCount: number;
  longestPauseMs: number;
  fillerCount: number;
  repetitionCount: number;
  fillerEvents: FillerEvent[];
};

const PAUSE_THRESHOLD_MS = 1000;

const HESITATION = /^(?:u+m+|u+h+m*|e+r+m*|h+m+)$/;

const FILLER_PHRASES = new Set(["you know", "i mean"]);

function normalize(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, "");
}

export function computeMetrics(
  words: TranscribedWord[],
  durationSec: number
): SpeechMetrics {
  const tokens = words.map((w) => normalize(w.word));
  const fillerEvents: FillerEvent[] = [];
  let repetitionCount = 0;

  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];
    const token = tokens[i];
    const next = tokens[i + 1];

    if (currentWord === undefined || token === undefined) {
      continue;
    }

    if (HESITATION.test(token)) {
      fillerEvents.push({
        word: token,
        start_ms: currentWord.startMs,
      });
      continue;
    }

    if (next !== undefined && FILLER_PHRASES.has(`${token} ${next}`)) {
      fillerEvents.push({
        word: `${token} ${next}`,
        start_ms: currentWord.startMs,
      });
      i++;
      continue;
    }

    if (token && token === next) {
      repetitionCount++;
    }
  }

  let pauseCount = 0;
  let longestPauseMs = 0;

  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];

    if (currentWord === undefined || nextWord === undefined) {
      continue;
    }

    const gap = nextWord.startMs - currentWord.endMs;

    if (gap > PAUSE_THRESHOLD_MS) {
      pauseCount++;
      longestPauseMs = Math.max(longestPauseMs, gap);
    }
  }

  const wordsPerMinute =
    durationSec > 0
      ? Math.round(words.length / (durationSec / 60))
      : 0;

  return {
    wordsPerMinute,
    pauseCount,
    longestPauseMs,
    fillerCount: fillerEvents.length,
    repetitionCount,
    fillerEvents,
  };
}