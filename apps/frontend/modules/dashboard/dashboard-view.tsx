"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Flame,
  Home,
  Layers,
  MessageSquare,
  Mic,
  Plane,
  Star,
  TrendingUp,
  User,
  UserRound,
  Volume2,
  Zap,
} from "lucide-react";

/* ---------- Types & default data (replace with real data) ---------- */

interface Stat {
  label: string;
  value: string;
  unit: string;
  change: string;
  Icon: LucideIcon;
}

interface Session {
  title: string;
  topic: string;
  minutes: number;
  Icon: LucideIcon;
  iconClass: string;
}

const STATS: Stat[] = [
  {
    label: "Total Practice",
    value: "12",
    unit: "sessions",
    change: "24%",
    Icon: MessageSquare,
  },
  {
    label: "Speaking Time",
    value: "4h 36m",
    unit: "total time",
    change: "24%",
    Icon: Mic,
  },
  {
    label: "Avg. Fluency",
    value: "82%",
    unit: "score",
    change: "15%",
    Icon: Star,
  },
  {
    label: "Streak",
    value: "5",
    unit: "days",
    change: "2 days",
    Icon: BarChart3,
  },
];

const RECENT: Session[] = [
  {
    title: "Quick Speak",
    topic: "Daily Life",
    minutes: 5,
    Icon: Zap,
    iconClass: "from-[#f5b36c] to-[#c8722a] text-[#2a1a08]",
  },
  {
    title: "Interview",
    topic: "Job Interview",
    minutes: 8,
    Icon: UserRound,
    iconClass: "from-[#6d5bd0] to-[#3d2f8f] text-white",
  },
  {
    title: "Quick Speak",
    topic: "Travel",
    minutes: 6,
    Icon: Plane,
    iconClass: "from-[#3fae7f] to-[#1d6b4a] text-white",
  },
];

const NAV: ReadonlyArray<{
  Icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
}> = [
  { Icon: Home, label: "Home", href: "/", active: true },
  { Icon: Layers, label: "Drills", href: "/drills" },
  { Icon: MessageSquare, label: "Practice", href: "/practice" },
  { Icon: BarChart3, label: "Progress", href: "/progress" },
  { Icon: User, label: "Profile", href: "/profile" },
];

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

/* ---------- Shared styles ---------- */

const panel =
  "rounded-[22px] border border-white/[.07] bg-gradient-to-br from-white/5 to-white/[.01]";

/* ---------- Small pieces ---------- */

function Wave({
  heights = [8, 16, 11, 20, 9],
  className = "",
}: {
  heights?: number[];
  className?: string;
}) {
  return (
    <span
      className={"inline-flex items-center gap-1 " + className}
      aria-hidden="true"
    >
      {heights.map((h, i) => (
        <i
          key={i}
          className="block w-[3px] rounded-[3px] bg-[#f0a65c]"
          style={{ height: h }}
        />
      ))}
    </span>
  );
}

function Mascot() {
  return (
    <svg viewBox="0 0 220 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="mascot-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0a65c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f0a65c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mascot-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2622" />
          <stop offset="100%" stopColor="#0c0b0a" />
        </linearGradient>
        <linearGradient id="mascot-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5b36c" />
          <stop offset="100%" stopColor="#c8722a" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="100" r="95" fill="url(#mascot-glow)" />
      <line
        x1="110"
        y1="22"
        x2="110"
        y2="38"
        stroke="url(#mascot-orange)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="110" cy="18" r="5" fill="url(#mascot-orange)" />
      <path
        d="M52 95 C52 40, 168 40, 168 95"
        fill="none"
        stroke="url(#mascot-orange)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect
        x="36"
        y="78"
        width="24"
        height="46"
        rx="12"
        fill="url(#mascot-orange)"
      />
      <rect
        x="160"
        y="78"
        width="24"
        height="46"
        rx="12"
        fill="url(#mascot-orange)"
      />
      <rect
        x="56"
        y="48"
        width="108"
        height="92"
        rx="34"
        fill="url(#mascot-head)"
        stroke="#f0a65c"
        strokeOpacity="0.35"
      />
      <rect x="66" y="62" width="88" height="62" rx="24" fill="#050504" />
      <path
        d="M84 92 q8 -12 16 0"
        fill="none"
        stroke="#f0a65c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M120 92 q8 -12 16 0"
        fill="none"
        stroke="#f0a65c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M102 106 q8 8 16 0"
        fill="none"
        stroke="#f0a65c"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M168 110 C178 140, 150 152, 128 152"
        fill="none"
        stroke="url(#mascot-orange)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="116"
        y="144"
        width="18"
        height="26"
        rx="9"
        fill="url(#mascot-orange)"
      />
      <path
        d="M70 178 C70 154, 150 154, 150 178 Z"
        fill="url(#mascot-head)"
        stroke="#f0a65c"
        strokeOpacity="0.3"
      />
    </svg>
  );
}

function SectionHead({
  title,
  href = "/progress",
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-['Fraunces',serif] text-2xl font-semibold tracking-tight">
        {title}
      </h3>
      <Link
        href={href}
        className="flex items-center gap-1.5 text-sm text-[#f0a65c] hover:text-[#ffcf94]"
      >
        View all <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ---------- Component ---------- */

export default function DashboardView({
  name = "Chirag",
  fullName = "Chirag S.",
  greeting = "Good evening,",
  stats = STATS,
  recent = RECENT,
  streakDays = 5,
  activeDays = 5,
}: {
  name?: string;
  fullName?: string;
  greeting?: string;
  stats?: Stat[];
  recent?: Session[];
  streakDays?: number;
  activeDays?: number;
}) {
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="grid min-h-screen place-items-center overflow-x-hidden bg-[#0a0b09] p-3 font-['DM_Sans',system-ui,sans-serif] text-[#efe9df] sm:p-6">
      <style>{CSS}</style>

      <div className="grid min-h-[860px] w-full max-w-[1440px] min-w-0 overflow-hidden rounded-[28px] border border-white/[.07] bg-[radial-gradient(1200px_600px_at_55%_45%,#17201a,#0b0d0b)] lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}

        <aside className="hidden flex-col gap-9 border-r border-white/[.07] px-[22px] py-8 lg:flex">
          <div className="font-['Fraunces',serif] text-[30px] font-semibold tracking-tight">
            Speako
          </div>

          <nav className="flex flex-col gap-1.5">
            {NAV.map(({ Icon: NavIcon, label, href, active }) => (
              <Link
                key={label}
                href={href}
                className={
                  "flex items-center gap-4 rounded-2xl px-3.5 py-4 text-left text-base " +
                  (active
                    ? "bg-gradient-to-r from-[#f0a65c]/30 to-[#f0a65c]/10 text-white ring-1 ring-inset ring-[#f0a65c]/20"
                    : "text-[#cfc8bb] hover:bg-white/[.03]")
                }
              >
                <NavIcon size={20} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex items-center justify-between rounded-[18px] border border-white/[.07] bg-white/[.02] p-4">
            <p className="font-['Fraunces',serif] text-sm leading-6 text-[#cfc8bb]">
              “Small steps
              <br />
              every day lead
              <br />
              to big progress.”
            </p>
            <Wave heights={[8, 16, 10, 20, 12]} className="opacity-70" />
          </div>
        </aside>

        {/* Main content */}

        <main className="grid min-w-0 gap-x-7 gap-y-5 overflow-hidden p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[auto_1fr] lg:py-7 lg:pl-7 lg:pr-7">
          {/* Header */}

          <header className="flex min-w-0 items-start justify-between gap-5 lg:col-span-2">
            <div className="min-w-0">
              <small className="text-xs font-semibold tracking-[.2em] text-[#f0a65c]">
                {greeting.replace(",", "").toUpperCase()}
              </small>
              <h1 className="mb-1.5 mt-1 font-['Fraunces',serif] text-5xl font-semibold tracking-tight">
                {name} <span className="inline-block">👋</span>
              </h1>
              <p className="text-base leading-relaxed text-[#cfc8bb]">
                Your voice matters. Let’s make it stronger.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                aria-label="Sound"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[.07] text-[#ffcf94]"
              >
                <Volume2 size={18} />
              </button>
              <button className="flex items-center gap-2.5 rounded-full border border-white/[.07] bg-white/[.03] py-1.5 pl-1.5 pr-3.5 text-sm text-[#efe9df] hover:bg-white/[.06]">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f0a65c]/[.14] text-xs font-semibold text-[#ffcf94]">
                  {initials}
                </span>
                {fullName}
                <ChevronDown size={16} className="text-[#a79f92]" />
              </button>
            </div>
          </header>

          {/* Left column */}

          <section className="flex min-w-0 flex-col gap-5">
            {/* Hero */}
            <div className={`${panel} relative overflow-hidden p-6 sm:p-8`}>
              <div className="pointer-events-none absolute -right-10 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(240,166,92,.14),transparent_65%)]" />

              <div className="relative grid items-center gap-6 md:grid-cols-[1.15fr_1fr]">
                <div className="min-w-0">
                  <small className="text-xs font-semibold tracking-[.2em] text-[#f0a65c]">
                    CHOOSE YOUR MODE
                  </small>
                  <h2 className="mb-3 mt-2 font-['Fraunces',serif] text-5xl font-semibold leading-[1.05] tracking-tight">
                    Start speaking today
                  </h2>
                  <p className="max-w-[340px] text-base leading-relaxed text-[#cfc8bb]">
                    Practice real conversations, get instant feedback, and
                    improve with AI.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/drills"
                      className="flex flex-1 items-center gap-3 rounded-full bg-gradient-to-b from-[#f5b36c] to-[#e99a47] p-3 pr-5 text-[#2a1a08] shadow-[0_6px_24px_rgba(240,166,92,.3)] transition hover:-translate-y-px"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/25">
                        <Zap size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base font-semibold">
                          Quick Speak
                        </span>
                        <span className="block truncate text-xs opacity-75">
                          Short, focused practice
                        </span>
                      </span>
                    </Link>

                    <Link
                      href="/drills?mode=interview"
                      className="flex flex-1 items-center gap-3 rounded-full border border-white/[.07] bg-white/[.03] p-3 pr-5 transition hover:border-[#f0a65c]/50"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[.07] text-[#e8c9a2]">
                        <UserRound size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base font-semibold">
                          Interview
                        </span>
                        <span className="block truncate text-xs text-[#a79f92]">
                          Real interview scenarios
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="relative mx-auto hidden h-64 w-full max-w-[300px] items-center md:flex">
                  <Wave
                    heights={[12, 26, 38, 22, 14]}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-70"
                  />
                  <Mascot />
                </div>
              </div>
            </div>

            {/* Recent practice */}
            <div className={`${panel} p-5 sm:p-6`}>
              <SectionHead title="Recent practice" />
              <div className="grid gap-3 md:grid-cols-3">
                {recent.map((s, i) => (
                  <button
                    key={i}
                    className="flex min-w-0 items-center gap-3.5 rounded-[18px] border border-white/[.07] bg-white/[.03] p-4 text-left transition hover:border-[#f0a65c]/40"
                  >
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${s.iconClass}`}
                    >
                      <s.Icon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold">
                        {s.title}
                      </span>
                      <span className="block truncate text-xs text-[#cfc8bb]">
                        Topic: {s.topic}
                      </span>
                      <span className="mt-1 block text-xs text-[#a79f92]">
                        {s.minutes} min
                      </span>
                    </span>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-[#a79f92]"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right column (fixed 380px like the Drills prompt panel) */}

          <aside className="flex min-w-0 flex-col gap-5 max-lg:mt-1">
            {/* Progress */}
            <div className={`${panel} p-4 sm:p-5`}>
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/[.04] py-2 pl-2 pr-[22px] text-[17px] font-medium">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f0a65c]/[.14]">
                    <Wave />
                  </span>
                  Your Progress
                </div>
                <Link
                  href="/progress"
                  className="flex items-center gap-1.5 text-sm text-[#f0a65c] hover:text-[#ffcf94]"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="min-w-0 rounded-[18px] border border-white/[.07] bg-gradient-to-br from-white/5 to-white/[.01] p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#f0a65c]/30 bg-[#3a2a1c] text-[#ffcf94]">
                        <s.Icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-[#cfc8bb]">
                          {s.label}
                        </p>
                        <p className="font-['Fraunces',serif] text-[26px] font-semibold leading-tight tracking-tight">
                          {s.value}
                        </p>
                        <p className="text-xs text-[#a79f92]">{s.unit}</p>
                      </div>
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 border-t border-white/[.07] pt-2.5 text-xs">
                      <TrendingUp size={13} className="text-emerald-400" />
                      <span className="font-semibold text-emerald-400">
                        {s.change}
                      </span>
                      <span className="text-[#a79f92]">vs last week</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak */}
            <div className={`${panel} p-4 sm:p-5`}>
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[#f0a65c]/30 bg-[#3a2a1c] text-[#ffcf94] shadow-[0_0_30px_rgba(240,166,92,.25)]">
                  <Flame size={30} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#cfc8bb]">
                    Keep your streak alive!
                  </p>
                  <p className="font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-[#ffcf94]">
                    {streakDays} days
                  </p>
                  <p className="text-xs text-[#a79f92]">Current streak</p>
                </div>
              </div>

              <div className="mt-4 flex justify-between gap-1.5">
                {WEEK.map((d, i) => (
                  <span
                    key={i}
                    className={
                      "grid h-9 w-9 place-items-center rounded-full text-xs font-medium " +
                      (i < activeDays
                        ? "bg-gradient-to-br from-[#4fbf8a] to-[#1f7a52] text-white"
                        : "border border-white/[.07] bg-white/[.04] text-[#a79f92]")
                    }
                  >
                    {d}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-center font-['Fraunces',serif] text-sm italic text-[#a79f92]">
                “Progress, not perfection.”
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

/* ---------- CSS ---------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=DM+Sans:wght@400;500;600&display=swap');
`;
