"use client";

import { useState, useMemo, useCallback } from "react";
import { useAudioRecorder } from "@/modules/speak/hooks/use-audio-recorder";
import { useSound } from "@/modules/speak/hooks/use-sound";
import { at, buildReel } from "@/modules/speak/lib/reel";
import { DATA } from "@/modules/speak/data/prompts";
import { type Mode, MAX_DURATION,RANDOM } from "@/modules/speak/constants";
import { ModeTabs } from "@/modules/speak/components/mode-tabs";
import { Reel } from "@/modules/speak/components/reel";
import { PromptPanel } from "@/modules/speak/components/prompt-panel";
import { useDrillSubmission } from "@/modules/speak/hooks/use-drill-submission";
import { useReelSpin } from "@/modules/speak/hooks/use-reel-spin";
import {
  Volume2,
  VolumeX,
  RotateCw,
} from "lucide-react";



/* ---------- Component ---------- */

export function DrillsView() {
  const [mode, setMode] = useState<Mode>("drills");
  const [filter, setFilter] = useState<string>(RANDOM);

  // Actual microphone recording state
  const {
    isRecording: speaking,
    elapsed: secs,
    audioBlob,
    error: recorderError,
    start,
    stop,
    reset,
  } = useAudioRecorder(MAX_DURATION);

  const {
    isUploading,
    uploadedKey,
    uploadError,
    submit,
    clear: clearSubmission,
  } = useDrillSubmission();

  const sound = useSound();

  const reel = useMemo(() => buildReel(mode), [mode]);

  const clearAttempt = useCallback((): void => {
    reset();
    clearSubmission();
  }, [reset, clearSubmission]);

  const { pos, spinning, landed, spin, resetPosition } = useReelSpin({
    reel,
    filter,
    sound,
    disabled: speaking || isUploading,
    onSpinStart: clearAttempt,
  });

  const current = at(reel, Math.round(pos));

  /* ---------- Recording controls ---------- */

  const handleRecordingToggle = useCallback(() => {
    if (spinning || isUploading) return;

    sound.unlock();

    if (speaking) {
      stop();
      return;
    }

    clearSubmission();

    start();
  }, [clearSubmission, spinning, isUploading, speaking, sound, start, stop]);

  const handleReset = useCallback(() => {
    if (isUploading) return;

    reset();
    clearSubmission();
  }, [clearSubmission, isUploading, reset]);

  const handleUpload = useCallback(() => {
    if (!audioBlob || speaking) return;

    void submit({
      blob: audioBlob,
      mode,
      promptText: current.text,
      seconds: secs,
    });
  }, [audioBlob, speaking, submit, mode, current.text, secs]);


  const switchMode = (nextMode: Mode): void => {
    if (spinning || speaking || isUploading || nextMode === mode) return;

    setMode(nextMode);
    setFilter(RANDOM);
    resetPosition();
    clearAttempt();
  };

  return (

        <main className="grid min-w-0 gap-x-7 overflow-hidden p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[auto_1fr] lg:py-7 lg:pl-0 lg:pr-7">
          <header className="flex min-w-0 items-center justify-end gap-5 lg:col-span-2 lg:pl-7">
            <button
              onClick={() => sound.setMuted(!sound.muted)}
              aria-label={sound.muted ? "Unmute" : "Mute"}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[.07] text-[#ffcf94]"
            >
              {sound.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </header>

          {/* Reel column */}

          <section className="flex min-w-0 flex-col overflow-hidden lg:pl-7">
            <div className="min-w-0">
              <small className="text-xs font-semibold tracking-[.2em] text-[#f0a65c]">
                PRACTICE
              </small>

              <h1 className="mb-1.5 mt-1 font-['Fraunces',serif] text-5xl font-semibold tracking-tight">
                {DATA[mode].title}
              </h1>

              <p className="max-w-[320px] text-base leading-relaxed text-[#cfc8bb]">
                {DATA[mode].sub}
              </p>

              <ModeTabs
                mode={mode}
                disabled={spinning || speaking || isUploading}
                onChange={switchMode}
              />
            </div>

            {/* Reel */}

            <Reel reel={reel} pos={pos} spinning={spinning} landed={landed} />

            <button
              onClick={spin}
              disabled={spinning || speaking || isUploading}
              className="mb-6 mt-7 inline-flex items-center gap-2.5 self-center rounded-full border border-white/[.07] bg-white/[.03] px-11 py-4 font-medium transition hover:enabled:border-[#f0a65c]/50 disabled:cursor-default disabled:opacity-50"
            >
              <RotateCw size={16} className={spinning ? "animate-spin" : ""} />
              {spinning ? "Spinning…" : "Spin the wheel"}
            </button>
          </section>

          {/* Right prompt panel */}

          <PromptPanel
            current={current}
            spinning={spinning}
            isRecording={speaking}
            elapsed={secs}
            maxDuration={MAX_DURATION}
            hasRecording={!!audioBlob}
            isUploading={isUploading}
            isSubmitted={!!uploadedKey}
            recorderError={recorderError}
            uploadError={uploadError}
            onToggleRecording={handleRecordingToggle}
            onReset={handleReset}
            onUpload={handleUpload}
          />
        </main>

  );
}

