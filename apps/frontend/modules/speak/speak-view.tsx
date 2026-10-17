"use client";

import { useState } from "react";
import {
  Mic,
  Square,
  RotateCcw,
  CloudUpload,
  AudioLines,
  Clock3,
  CheckCircle2,
  LoaderCircle,
  Upload,
} from "lucide-react";

import { Button } from "@speako/ui/components/button";
import { Card, CardContent } from "@speako/ui/components/card";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { submitDrill} from "@/modules/speak/lib/uploadAudio";

const [isUploading, setIsUploading] = useState(false);
const [uploadedKey, setUploadedKey] = useState<string | null>(null);
import { useRouter } from "next/navigation";

const MAX_DURATION = 90;

function formatTime(seconds: number) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function SpeakView() {

  const router = useRouter();

  const {
    isRecording,
    elapsed,
    audioBlob,
    audioUrl,
    error: recorderError,
    start,
    stop,
    reset,
  } = useAudioRecorder(MAX_DURATION);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);

  const error = uploadError ?? recorderError;
  const progress = Math.min(100, (elapsed / MAX_DURATION) * 100);

  function handleReset() {
    setUploadError(null);
    setUploadedKey(null);
    reset();
  }

  async function handleUpload() {
    if (!audioBlob || isUploading) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadedKey(null);

      const response = await submitDrill(audioBlob,"practice","Describe a skill you want to learn",90)
      router.push(`/jobs/${response.jobId}`)
  } catch (error) {
      console.error("Drill submission failed:", error);
      setUploadError("Failed to submit drill. Please try again.");
  } finally {
      setIsUploading(false);
  }
}

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F7F5] px-4 py-10 text-zinc-900 sm:px-6">
      {/* Subtle decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-white blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm">
              <AudioLines className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold tracking-tight">speako</h2>
              <p className="text-xs text-zinc-500">Your speaking studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-2 text-xs font-medium text-zinc-600">
            <Clock3 className="size-3.5" />
            90 sec max
          </div>
        </header>

        {/* Main card */}
        <Card className="overflow-hidden rounded-[2rem] border-zinc-200/80 bg-white shadow-[0_16px_60px_-24px_rgba(0,0,0,0.16)]">
          <CardContent className="p-6 sm:p-10">
            {/* Title */}
            <div className="text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Speaking drill · 01
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {isRecording
                  ? "You're on the mic."
                  : audioBlob
                    ? "Nice work."
                    : "Find your voice."}
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                {isRecording
                  ? "Keep going. Speak naturally and let your thoughts flow."
                  : audioBlob
                    ? "Your recording is ready. Give it a listen or upload it."
                    : "Pick a thought. Speak freely. Get a little better every day."}
              </p>
            </div>

            {/* Timer */}
            <div className="mt-10 text-center">
              <div
                className={`font-mono text-6xl font-medium tracking-[-0.06em] tabular-nums sm:text-7xl ${
                  isRecording ? "text-zinc-950" : "text-zinc-800"
                }`}
                aria-live="off"
              >
                {formatTime(elapsed)}
              </div>

              <p
                className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400"
                aria-live="polite"
              >
                {isRecording
                  ? "Recording in progress"
                  : audioBlob
                    ? "Recording complete"
                    : "Ready when you are"}
              </p>
            </div>

            {/* Progress */}
            <div className="mt-8">
              <div className="mb-2.5 flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-500">
                  Recording progress
                </span>
                <span className="font-mono tabular-nums text-zinc-400">
                  {elapsed} / {MAX_DURATION}s
                </span>
              </div>

              <div
                role="progressbar"
                aria-label="Recording time used"
                aria-valuemin={0}
                aria-valuemax={MAX_DURATION}
                aria-valuenow={elapsed}
                className="h-1.5 overflow-hidden rounded-full bg-zinc-100"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    isRecording ? "bg-rose-500" : "bg-zinc-900"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Microphone control */}
            <div className="mt-9 flex flex-col items-center">
              <div
                className={`relative flex size-32 items-center justify-center rounded-full transition-colors ${
                  isRecording ? "bg-rose-50" : "bg-zinc-100"
                }`}
              >
                {isRecording && (
                  <span className="absolute inset-0 animate-ping rounded-full border border-rose-300 opacity-40" />
                )}

                <Button
                  size="icon"
                  className={`relative size-24 rounded-full shadow-lg transition-transform hover:scale-[1.03] active:scale-95 ${
                    isRecording
                      ? "bg-rose-500 text-white hover:bg-rose-600"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                  onClick={isRecording ? stop : start}
                  disabled={isUploading || (!isRecording && !!audioBlob)}
                  aria-label={
                    isRecording ? "Stop recording" : "Start recording"
                  }
                >
                  {isRecording ? (
                    <Square className="size-7 fill-current" />
                  ) : (
                    <Mic className="size-8" />
                  )}
                </Button>
              </div>

              <p className="mt-4 text-sm text-zinc-500" aria-live="polite">
                {isRecording
                  ? "Tap to finish your recording"
                  : audioBlob
                    ? "Your voice, captured."
                    : "Tap the microphone to begin"}
              </p>
            </div>

            {/* Playback and upload */}
            {audioBlob && audioUrl && (
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-sm">
                      <AudioLines className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-800">
                        Your recording
                      </p>
                      <p className="text-xs text-zinc-500">
                        {(audioBlob.size / 1024).toFixed(1)} KB
                        {" · "}
                        {audioBlob.type || "Unknown format"}
                      </p>
                    </div>

                    {uploadedKey && (
                      <CheckCircle2
                        className="size-5 shrink-0 text-emerald-600"
                        aria-label="Upload successful"
                      />
                    )}
                  </div>

                  <audio controls src={audioUrl} className="h-10 w-full" />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl border-zinc-200 bg-white font-medium hover:bg-zinc-50"
                    onClick={handleReset}
                    disabled={isUploading}
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Record again
                  </Button>

                  <Button
                    className="h-12 rounded-xl bg-zinc-900 font-medium text-white shadow-sm hover:bg-zinc-800"
                    onClick={handleUpload}
                    disabled={isUploading || !!uploadedKey}
                  >
                    {isUploading ? (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    ) : uploadedKey ? (
                      <CheckCircle2 className="mr-2 size-4" />
                    ) : (
                      <CloudUpload className="mr-2 size-4" />
                    )}

                    {isUploading
                      ? "Uploading..."
                      : uploadedKey
                        ? "Uploaded successfully"
                        : "Upload recording"}
                  </Button>
                </div>

                {uploadedKey && (
                  <p className="break-all text-xs text-emerald-700">
                    Recording uploaded successfully.
                  </p>
                )}
              </div>
            )}

            {/* Errors */}
            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}

