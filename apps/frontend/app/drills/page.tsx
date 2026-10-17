"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { submitDrill } from "@/modules/speak/lib/uploadAudio";
import { Button } from "@speako/ui/components/button";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Layers,
  MessageSquare,
  BarChart3,
  User,
  Mic,
  MicOff,
  ArrowRight,
  Coffee,
  Briefcase,
  Plane,
  Users,
  Heart,
  Brain,
  Code2,
  Target,
  Volume2,
  VolumeX,
  RotateCw,
  RotateCcw,
  Upload,
  AudioLines,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

/* ---------- Types ---------- */

type Mode = "drills" | "interview";
type PromptTuple = readonly [text: string, description: string];

interface Category {
  icon: LucideIcon;
  prompts: readonly PromptTuple[];
}

interface ModeData {
  title: string;
  sub: string;
  categories: Record<string, Category>;
}

interface ReelItem {
  cat: string;
  text: string;
  desc: string;
  Icon: LucideIcon;
}

interface Sound {
  muted: boolean;
  setMuted: (muted: boolean) => void;
  unlock: () => void;
  start: () => void;
  tick: (progress?: number) => void;
  land: () => void;
}

/* ---------- Constants ---------- */

const MAX_DURATION = 90;
const CARD_W = 190;
const RANDOM = "Random Mode";

/* ---------- Data ---------- */

const DATA: Record<Mode, ModeData> = {
  drills: {
    title: "Drills",
    sub: "Spin the wheel, get a random prompt, and start speaking.",
    categories: {
      "Daily Life": {
        icon: Coffee,
        prompts: [
          [
            "Talk about your daily routine.",
            "Describe your typical day, what you do, and how you spend your time.",
          ],
          [
            "Describe your morning ritual.",
            "Walk through the first hour after you wake up.",
          ],
          [
            "Explain your favorite meal.",
            "What is in it, who makes it, and why do you love it?",
          ],
        ],
      },
      Travel: {
        icon: Plane,
        prompts: [
          [
            "Describe your ideal vacation.",
            "Where would you go, who with, and what would you do?",
          ],
          [
            "Tell us about a trip you remember.",
            "What happened, and why has it stayed with you?",
          ],
        ],
      },
      Work: {
        icon: Briefcase,
        prompts: [
          [
            "Discuss your future career.",
            "Where do you see yourself in five years, and why?",
          ],
          [
            "Describe your ideal workday.",
            "Think about people, tasks, and environment.",
          ],
        ],
      },
      Social: {
        icon: Users,
        prompts: [
          [
            "Talk about your family.",
            "Who is in it, and what makes them special to you?",
          ],
          [
            "Describe your best friend.",
            "How did you meet and what keeps you close?",
          ],
        ],
      },
      Hobbies: {
        icon: Heart,
        prompts: [
          [
            "Share your hobbies.",
            "What do you do for fun and how did you start?",
          ],
          [
            "Teach us something you love.",
            "Explain a skill or pastime to a complete beginner.",
          ],
        ],
      },
    },
  },
  interview: {
    title: "Interview",
    sub: "Spin for a real interview question and answer out loud.",
    categories: {
      Behavioral: {
        icon: Users,
        prompts: [
          [
            "Tell me about yourself.",
            "Give a 60-second summary of your background and what drives you.",
          ],
          [
            "Describe a time you failed.",
            "What happened, what did you learn, what changed afterward?",
          ],
          [
            "Tell me about a conflict at work.",
            "How did you handle it and what was the outcome?",
          ],
        ],
      },
      Technical: {
        icon: Code2,
        prompts: [
          [
            "Explain a project you're proud of.",
            "Cover the problem, your role, the decisions, and the result.",
          ],
          [
            "Walk through how you debug.",
            "Describe your process for a bug you can't reproduce.",
          ],
        ],
      },
      HR: {
        icon: Briefcase,
        prompts: [
          [
            "Why do you want this job?",
            "Connect the role to your goals and strengths.",
          ],
          [
            "What are your strengths and weaknesses?",
            "Be honest and give a concrete example for each.",
          ],
        ],
      },
      Situational: {
        icon: Target,
        prompts: [
          [
            "You miss a deadline. What do you do?",
            "Explain how you communicate and recover.",
          ],
          [
            "Prioritize three urgent tasks.",
            "How do you decide what comes first?",
          ],
        ],
      },
      Mindset: {
        icon: Brain,
        prompts: [
          [
            "Where do you see yourself in 5 years?",
            "Be specific about skills, impact, and growth.",
          ],
          [
            "How do you handle pressure?",
            "Share a real moment and what you did.",
          ],
        ],
      },
    },
  },
};

const MODES: ReadonlyArray<{ id: Mode; label: string }> = [
  { id: "drills", label: "Practice drills" },
  { id: "interview", label: "Interview" },
];

const NAV: ReadonlyArray<{
  Icon: LucideIcon;
  label: string;
  active?: boolean;
}> = [
  { Icon: Home, label: "Home" },
  { Icon: Layers, label: "Drills", active: true },
  { Icon: MessageSquare, label: "Practice" },
  { Icon: BarChart3, label: "Progress" },
  { Icon: User, label: "Profile" },
];

/* ---------- Helpers ---------- */

const mod = (n: number, m: number): number => ((n % m) + m) % m;

const ease = (t: number): number => 1 - Math.pow(1 - t, 4);

const at = (reel: readonly ReelItem[], i: number): ReelItem => {
  const item = reel[mod(i, reel.length)];

  if (!item) throw new Error("Reel is empty");

  return item;
};

const fmt = (s: number): string =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
    2,
    "0",
  )}`;

const flatten = (mode: Mode): ReelItem[] =>
  Object.entries(DATA[mode].categories).flatMap(([cat, category]) =>
    category.prompts.map(([text, desc]): ReelItem => ({
      cat,
      text,
      desc,
      Icon: category.icon,
    })),
  );

const buildReel = (mode: Mode): ReelItem[] => {
  const all = flatten(mode);

  const byCat: ReelItem[][] = Object.keys(DATA[mode].categories).map(
    (category) => all.filter((item) => item.cat === category),
  );

  const out: ReelItem[] = [];
  const longest = Math.max(...byCat.map((group) => group.length));

  for (let i = 0; i < longest; i++) {
    for (const group of byCat) {
      const item = group[i];

      if (item) out.push(item);
    }
  }

  return out;
};

/* ---------- Sound ---------- */

type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function useSound(): Sound {
  const ctx = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  mutedRef.current = muted;

  const ac = (): AudioContext => {
    if (!ctx.current) {
      const Ctor =
        window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;

      if (!Ctor) {
        throw new Error("Web Audio is not supported in this browser");
      }

      ctx.current = new Ctor();
    }

    if (ctx.current.state === "suspended") {
      void ctx.current.resume();
    }

    return ctx.current;
  };

  const tone = (
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType = "sine",
    vol = 0.15,
    slideTo?: number,
  ): void => {
    const audio = ac();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audio.currentTime + start);

    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(
        slideTo,
        audio.currentTime + start + dur,
      );
    }

    gain.gain.setValueAtTime(vol, audio.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audio.currentTime + start + dur,
    );

    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(audio.currentTime + start);
    oscillator.stop(audio.currentTime + start + dur + 0.02);
  };

  return {
    muted,
    setMuted,

    unlock: () => {
      ac();
    },

    start: () => {
      if (mutedRef.current) return;

      tone(160, 0, 0.18, "triangle", 0.3, 60);
      tone(300, 0.08, 0.35, "sawtooth", 0.05, 900);
    },

    tick: (progress = 0) => {
      if (mutedRef.current) return;

      tone(1300 - progress * 500, 0, 0.035, "square", 0.05);
      tone(180, 0, 0.03, "triangle", 0.12);
    },

    land: () => {
      if (mutedRef.current) return;

      tone(120, 0, 0.25, "triangle", 0.35, 50);

      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
        tone(freq, 0.12 + i * 0.08, 0.5, "sine", 0.14),
      );

      tone(1568, 0.5, 0.7, "triangle", 0.06);
    },
  };
}

/* ---------- Component ---------- */

export default function SpeakoDrills() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("drills");
  const [filter, setFilter] = useState<string>(RANDOM);
  const [pos, setPos] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(true);

  // Actual microphone recording state
  const {
    isRecording: speaking,
    elapsed: secs,
    audioBlob,
    audioUrl,
    error: recorderError,
    start,
    stop,
    reset,
  } = useAudioRecorder(MAX_DURATION);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sound = useSound();

  const raf = useRef<number>(0);
  const posRef = useRef(0);

  const reel = useMemo(() => buildReel(mode), [mode]);
  const n = reel.length;
  const current = at(reel, Math.round(pos));
  const cats = Object.keys(DATA[mode].categories);
  const CurIcon = current.Icon;

  /* ---------- Reel cleanup ---------- */

  useEffect(() => {
    return () => cancelAnimationFrame(raf.current);
  }, []);

  /* ---------- Recording controls ---------- */

  const handleRecordingToggle = useCallback(() => {
    if (spinning || isUploading) return;

    sound.unlock();

    if (speaking) {
      stop();
      return;
    }

    setUploadedKey(null);
    setUploadError(null);

    start();
  }, [spinning, isUploading, speaking, sound, start, stop]);

  const handleReset = useCallback(() => {
    if (isUploading) return;

    reset();
    setUploadedKey(null);
    setUploadError(null);
  }, [isUploading, reset]);

  const handleUpload = useCallback(async () => {
    if (!audioBlob || speaking || isUploading || uploadedKey) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await submitDrill(
        audioBlob,
        mode === "drills" ? "practice" : "interview",
        current.text,
        secs,
      );

      setUploadedKey(response.jobId);
      router.push(`/jobs/${response.jobId}`);
    } catch (error) {
      console.error("Drill submission failed:", error);
      setUploadError("Failed to submit drill. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [
    audioBlob,
    speaking,
    isUploading,
    uploadedKey,
    mode,
    current.text,
    secs,
    router,
  ]);

  /* ---------- Reel animation ---------- */

  const spin = useCallback((): void => {
    if (spinning || speaking || isUploading) return;

    const pool = reel
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => filter === RANDOM || item.cat === filter);

    const pick = pool[Math.floor(Math.random() * pool.length)];

    if (!pick) return;

    sound.unlock();
    sound.start();

    // Discard any previous recording when choosing a new prompt.
    reset();
    setUploadedKey(null);
    setUploadError(null);

    setSpinning(true);
    setLanded(false);

    const from = posRef.current;
    const base = Math.ceil(from);
    const target = base + n * 3 + mod(pick.i - base, n);

    const dur = 4200 + Math.random() * 800;
    const t0 = performance.now();

    let lastIdx = Math.round(from);

    const frame = (now: number): void => {
      const t = Math.min((now - t0) / dur, 1);
      const p = from + (target - from) * ease(t);

      posRef.current = p;
      setPos(p);

      const idx = Math.round(p);

      if (idx !== lastIdx) {
        sound.tick(t);
        lastIdx = idx;
      }

      if (t < 1) {
        raf.current = requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        setLanded(true);
        sound.land();
      }
    };

    raf.current = requestAnimationFrame(frame);
  }, [spinning, speaking, isUploading, reel, filter, n, sound, reset]);

  const switchMode = (nextMode: Mode): void => {
    if (spinning || speaking || isUploading || nextMode === mode) return;

    setMode(nextMode);
    setFilter(RANDOM);

    posRef.current = 0;
    setPos(0);
    setLanded(true);

    reset();
    setUploadedKey(null);
    setUploadError(null);
  };

  const first = Math.floor(pos) - 4;
  const visible = Array.from({ length: 10 }, (_, k) => first + k);

  return (
    <div className="grid min-h-screen place-items-center overflow-x-hidden bg-[#0a0b09] p-3 font-['DM_Sans',system-ui,sans-serif] text-[#efe9df] sm:p-6">
      <style>{CSS}</style>

      <div className="grid min-h-[860px] w-full max-w-[1440px] min-w-0 overflow-hidden rounded-[28px] border border-white/[.07] bg-[radial-gradient(1200px_600px_at_55%_45%,#17201a,#0b0d0b)] lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}

        <aside className="hidden flex-col gap-9 border-r border-white/[.07] px-[22px] py-8 lg:flex">
          <div>
            <div className="font-['Fraunces',serif] text-[30px] font-semibold tracking-tight">
              Speako
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {NAV.map(({ Icon: NavIcon, label, active }) => (
              <button
                key={label}
                className={
                  "flex items-center gap-4 rounded-2xl px-3.5 py-4 text-left text-base " +
                  (active
                    ? "bg-gradient-to-r from-[#f0a65c]/30 to-[#f0a65c]/10 text-white ring-1 ring-inset ring-[#f0a65c]/20"
                    : "text-[#cfc8bb] hover:bg-white/[.03]")
                }
              >
                <NavIcon size={20} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}

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

              <div
                role="tablist"
                aria-label="Mode"
                className="mt-[18px] inline-flex max-w-full rounded-full border border-white/[.07] bg-white/[.03] p-1"
              >
                {MODES.map(({ id, label }) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={mode === id}
                    onClick={() => switchMode(id)}
                    disabled={spinning || speaking || isUploading}
                    className={
                      "rounded-full px-3 py-[9px] text-sm transition sm:px-[18px] " +
                      (mode === id
                        ? "bg-[#f0a65c] font-semibold text-[#2a1a08]"
                        : "text-[#a79f92] hover:text-white")
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reel */}

            <div className="relative mt-auto h-[360px] min-w-0 overflow-hidden [perspective-origin:50%_50%] [perspective:1100px]">
              <div className="pointer-events-none absolute left-0 right-0 top-5 h-0.5 bg-gradient-to-r from-transparent via-[#f0a65c]/55 to-transparent" />

              <div className="pointer-events-none absolute bottom-5 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#f0a65c]/55 to-transparent" />

              <div className="pointer-events-none absolute left-1/2 top-0 z-30 h-11 w-3.5 -translate-x-1/2 bg-gradient-to-b from-[#ffcf94] to-[#f0a65c] drop-shadow-[0_0_10px_rgba(240,166,92,.7)] [clip-path:polygon(0_0,100%_0,50%_100%)]" />

              <div className="pointer-events-none absolute bottom-0 left-1/2 z-30 h-11 w-3.5 -translate-x-1/2 bg-gradient-to-b from-[#ffcf94] to-[#f0a65c] drop-shadow-[0_0_10px_rgba(240,166,92,.7)] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />

              <div className="absolute inset-0 [transform-style:preserve-3d]">
                {visible.map((i) => {
                  const d = i - pos;
                  const ad = Math.abs(d);
                  const item = at(reel, i);
                  const ItemIcon = item.Icon;
                  const center = ad < 0.5;

                  return (
                    <div
                      key={i}
                      className={
                        "absolute left-1/2 top-[50px] flex h-[260px] w-44 flex-col items-center gap-3.5 rounded-[22px] bg-gradient-to-br px-3.5 py-[22px] text-center will-change-transform " +
                        (center
                          ? "border-[3px] border-[#f3a456] from-[#f0a65c]/30 to-[#f0a65c]/10 text-white shadow-[0_0_40px_rgba(240,166,92,.4),inset_0_0_30px_rgba(240,166,92,.15)] " +
                            (landed
                              ? "motion-safe:animate-[land_.9s_ease-out]"
                              : "")
                          : "border border-white/[.07] from-white/[.07] to-white/[.02] text-[#d8cfc0]")
                      }
                      style={{
                        transform: `translateX(calc(-50% + ${d * CARD_W}px)) rotateY(${-d * 28}deg) scale(${Math.max(1 - ad * 0.13, 0.5)})`,
                        opacity: Math.max(1 - ad * 0.28, 0),
                        filter: `blur(${spinning ? Math.min(ad * 0.6 + 0.8, 3) : Math.min(ad * 0.7, 2.5)}px)`,
                        zIndex: 10 - Math.round(ad),
                      }}
                    >
                      <ItemIcon
                        size={34}
                        className={
                          "mt-[26px] " +
                          (center ? "text-[#ffcf94]" : "text-[#e8c9a2]")
                        }
                      />

                      <h3 className="grid flex-1 items-center font-['Fraunces',serif] text-xl font-medium leading-tight">
                        {item.text}
                      </h3>

                      <span className="rounded-full bg-white/[.07] px-3.5 py-2 text-[11px] uppercase tracking-wider text-[#cbbfae]">
                        {item.cat}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

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

          <aside className="flex min-w-0 flex-col gap-[18px] self-start overflow-hidden rounded-[22px] border border-white/[.07] bg-white/[.015] p-4 sm:p-5 max-lg:mt-4">
            <div className="inline-flex max-w-full items-center gap-3 self-start rounded-full bg-white/[.04] py-2 pl-2 pr-4 text-[17px] font-medium sm:pr-[22px]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f0a65c]/[.14]">
                <Wave small />
              </span>
              Your Prompt
            </div>

            <div className="min-w-0 rounded-[18px] border border-white/[.07] bg-gradient-to-br from-white/5 to-white/[.01] p-4 sm:p-[22px]">
              <div
                className={
                  "transition duration-300 " +
                  (spinning ? "opacity-35 blur-[2px]" : "")
                }
              >
                <div className="flex min-w-0 items-center gap-3.5 text-lg font-medium">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#f0a65c]/30 bg-[#3a2a1c] text-[#ffcf94]">
                    <CurIcon size={18} />
                  </span>

                  <span className="min-w-0 break-words">{current.cat}</span>
                </div>

                <h2 className="mb-3.5 mt-[22px] break-words font-['Fraunces',serif] text-[27px] font-semibold leading-[1.15] tracking-tight sm:text-[31px]">
                  {current.text}
                </h2>

                <p className="mb-[22px] break-words text-[15.5px] leading-relaxed text-[#cfc8bb]">
                  {current.desc}
                </p>
              </div>

              {/* Recording complete: playback and actions */}

              {audioBlob && !speaking ? (
                <div className="flex min-w-0 flex-col gap-3">
                  <p className="text-center text-sm text-[#cfc8bb]">
                    Recording finished · {fmt(secs)}
                  </p>

                  {/* {audioUrl && (
                    <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-[#cfc8bb]">
                        <span className="flex items-center gap-2">
                          <AudioLines size={15} />
                          Your recording
                        </span>

                        <span>{(audioBlob.size / 1024).toFixed(1)} KB</span>
                      </div>

                      <audio controls src={audioUrl} className="h-10 w-full" />
                    </div>
                  )} */}

                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-xl border-white/10 bg-white/5 font-medium text-[#efe9df] hover:bg-white/10"
                    onClick={handleReset}
                    disabled={isUploading}
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Record again
                  </Button>

                  <Button
                    className="h-12 w-full rounded-xl bg-[#f0a65c] font-medium text-[#2a1a08] shadow-sm hover:bg-[#f5b36c]"
                    onClick={handleUpload}
                    disabled={isUploading || !!uploadedKey}
                  >
                    {isUploading ? (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    ) : uploadedKey ? (
                      <CheckCircle2 className="mr-2 size-4" />
                    ) : (
                      <Upload className="mr-2 size-4" />
                    )}

                    {isUploading
                      ? "Submitting..."
                      : uploadedKey
                        ? "Submitted"
                        : "Upload recording"}
                  </Button>

                  {uploadedKey && (
                    <p className="break-words text-xs text-emerald-400">
                      Recording submitted successfully.
                    </p>
                  )}

                  {(uploadError || recorderError) && (
                    <p
                      role="alert"
                      className="break-words text-xs leading-relaxed text-[#f0a65c]"
                    >
                      {uploadError ?? recorderError}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <button
                    disabled={spinning || isUploading}
                    onClick={handleRecordingToggle}
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-[#f5b36c] to-[#e99a47] p-[17px] text-base font-semibold text-[#2a1a08] shadow-[0_6px_24px_rgba(240,166,92,.3)] transition hover:enabled:-translate-y-px disabled:cursor-default disabled:opacity-50"
                  >
                    {speaking ? (
                      <>
                        <MicOff size={16} />
                        Stop · {fmt(secs)}
                      </>
                    ) : (
                      <>
                        <Mic size={16} />
                        Start Speaking
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <p className="mt-3 text-center text-xs text-[#a79f92]">
                    {speaking
                      ? `${Math.max(0, MAX_DURATION - secs)} seconds remaining`
                      : "You have up to 90 seconds to speak."}
                  </p>

                  {recorderError && (
                    <p role="alert" className="text-xs text-[#f0a65c]">
                      {recorderError}
                    </p>
                  )}

                  {uploadError && (
                    <p role="alert" className="text-xs text-[#f0a65c]">
                      {uploadError}
                    </p>
                  )}
                </>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

/* ---------- Wave ---------- */

function Wave({ small = false }: { small?: boolean }) {
  const heights = small ? [8, 16, 11, 20, 9] : [14, 26, 38, 22, 30, 14];

  return (
    <span className="inline-flex items-center gap-1">
      {heights.map((height, i) => (
        <i
          key={i}
          className="block w-[3px] rounded-[3px] bg-[#f0a65c]"
          style={{ height }}
        />
      ))}
    </span>
  );
}

/* ---------- CSS ---------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=DM+Sans:wght@400;500;600&display=swap');

@keyframes land {
  0% {
    box-shadow: 0 0 120px rgba(255,190,110,.95), inset 0 0 50px rgba(255,200,130,.5);
  }
  100% {
    box-shadow: 0 0 40px rgba(240,166,92,.4), inset 0 0 30px rgba(240,166,92,.15);
  }
}
`;
