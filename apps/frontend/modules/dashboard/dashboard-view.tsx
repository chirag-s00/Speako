"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Clock3,
  Mic,
  MessageSquare,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

import {
  getDashboardData,
  type DashboardData,
} from "@/modules/dashboard/lib/getDashboardData";
import { ApiError } from "@/modules/progress/lib/getResults";

const panel =
  "rounded-[22px] border border-white/[.07] bg-gradient-to-br from-white/5 to-white/[.01]";

export default function DashboardView({
  username,
  greeting = "Welcome Back,"
}: {
  username?: string;
  greeting?: string;
}) {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dashboard = await getDashboardData(10);
      setData(dashboard);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Could not load your dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) return `${remainingSeconds}s`;
    if (remainingSeconds === 0) return `${minutes}m`;

    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getOverallScore = (item: DashboardData["results"][number]) => {
    const scores = item.scores;

    return Math.round(
      (scores.pacing +
        scores.clarity +
        scores.fluency +
        scores.coherence +
        scores.vocabulary) /
        5,
    );
  };

  return (
    <main className="min-w-0 space-y-6 overflow-hidden p-4 text-[#eee7dc] sm:p-5 lg:space-y-7 lg:py-7 lg:pl-7 lg:pr-7">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[.2em] text-[#f0a65c]">
            {greeting.toUpperCase()}
          </p>

          <h1 className="mt-1 font-['Fraunces',serif] text-4xl font-semibold tracking-tight sm:text-5xl">
            {username || "Welcome"} <span>👋</span>
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#cfc8bb] sm:text-base">
            Let's get started
          </p>
        </div>
      </header>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-400/[.05] p-5 text-sm text-red-300"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-3 underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className={`${panel} animate-pulse p-6 text-sm text-[#a79f92]`}>
          Loading your speaking activity...
        </div>
      )}

      {!loading && data && (
        <>
          {/* Hero */}
          <section className={`${panel} relative overflow-hidden p-6 sm:p-8`}>
            <div className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full bg-[#f0a65c]/[.08] blur-3xl" />

            <div className="relative max-w-2xl">
              <h2 className="mt-5 font-['Fraunces',serif] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Every conversation makes you stronger.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#cfc8bb] sm:text-base">
                Practice speaking, review your feedback, and build confidence
                one drill at a time.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/drills"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#f5b36c] to-[#e99a47] px-5 py-3 text-sm font-semibold text-[#2a1a08] shadow-[0_6px_24px_rgba(240,166,92,.18)] transition hover:-translate-y-px"
                >
                  <Zap size={17} />
                  Start speaking
                  <ArrowRight size={15} />
                </Link>

                <Link
                  href="/progress"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[.07] bg-white/[.03] px-5 py-3 text-sm text-[#cfc8bb] transition hover:border-[#f0a65c]/40 hover:text-[#ffcf94]"
                >
                  <Activity size={16} />
                  Review progress
                </Link>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-['Fraunces',serif] text-2xl font-semibold tracking-tight">
                Your progress
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Completed drills"
                value={String(data.completedDrills)}
                Icon={MessageSquare}
              />
              <StatCard
                label="Average score"
                value={`${data.averageScore}%`}
                Icon={Star}
              />

              <StatCard
                label="Average fluency"
                value={`${data.averageFluency}%`}
                Icon={TrendingUp}
              />

              <StatCard
                label="Speaking time"
                value={formatDuration(data.totalSpeakingSeconds)}
                Icon={Clock3}
              />
            </div>
          </section>

          {/* Recent practice and focus */}
          <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className={`${panel} min-w-0 p-5 sm:p-6`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-['Fraunces',serif] text-2xl font-semibold tracking-tight">
                    Recent practice
                  </h2>
                  <p className="mt-1 text-sm text-[#a79f92]">
                    Pick up where you left off.
                  </p>
                </div>

                <Link
                  href="/progress"
                  aria-label="View all speaking results"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-white/[.07] text-[#f0a65c] transition hover:border-[#f0a65c]/40"
                >
                  <ArrowRight size={17} />
                </Link>
              </div>

              {data.recent.length === 0 ? (
                <div className="rounded-[18px] border border-white/[.07] bg-white/[.02] px-5 py-8 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#f0a65c]/[.10] text-[#f0a65c]">
                    <Mic size={21} />
                  </div>

                  <h3 className="mt-4 font-medium">Your first drill awaits</h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#a79f92]">
                    Complete a speaking drill to see your scores and feedback
                    here.
                  </p>

                  <Link
                    href="/drills"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f0a65c] px-5 py-2.5 text-sm font-semibold text-[#20170f] transition hover:bg-[#f5b978]"
                  >
                    Start a drill <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recent.map((item) => {
                    const overall = getOverallScore(item);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => router.push(`/progress/${item.drillId}`)}
                        className="group flex w-full min-w-0 items-center gap-3 rounded-[18px] border border-white/[.07] bg-white/[.025] p-4 text-left transition hover:border-[#f0a65c]/40 hover:bg-white/[.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0a65c] sm:gap-4"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#f0a65c]/20 bg-[#f0a65c]/[.09] text-[#f0a65c]">
                          <Mic size={19} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold uppercase tracking-wider text-[#f0a65c]">
                            {item.drill.mode}
                          </span>

                          <span className="mt-1 block truncate text-sm font-medium text-[#eee7dc] sm:text-base">
                            {item.drill.prompt || "Speaking drill"}
                          </span>

                          <span className="mt-1 block text-xs text-[#a79f92]">
                            {formatDate(item.createdAt)}
                            {" · "}
                            {formatDuration(item.drill.durationSec ?? 0)}
                          </span>
                        </span>

                        <span className="shrink-0 text-right">
                          <span className="block text-xl font-semibold text-[#eee7dc]">
                            {overall}
                            <span className="text-xs text-[#a79f92]">/100</span>
                          </span>
                          <span className="mt-1 block text-xs text-[#a79f92]">
                            Score
                          </span>
                        </span>

                        <ArrowRight
                          size={16}
                          className="hidden shrink-0 text-[#a79f92] transition group-hover:translate-x-1 group-hover:text-[#f0a65c] sm:block"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {data.nextCursor && (
                <p className="mt-4 text-center text-xs text-[#a79f92]">
                  Showing recent results.{" "}
                  <Link
                    href="/progress"
                    className="text-[#f0a65c] hover:text-[#ffcf94]"
                  >
                    Load more in history
                  </Link>
                </p>
              )}
            </div>

            {/* Personalized focus */}
            <aside className={`${panel} flex flex-col p-5 sm:p-6`}>
              <div className="grid size-11 place-items-center rounded-full border border-[#f0a65c]/20 bg-[#f0a65c]/[.09] text-[#f0a65c]">
                <Star size={20} />
              </div>

              <p className="mt-5 text-xs font-semibold tracking-[.2em] text-[#f0a65c]">
                YOUR NEXT STEP
              </p>

              <h2 className="mt-2 font-['Fraunces',serif] text-2xl font-semibold tracking-tight">
                Keep improving
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#cfc8bb]">
                {data.focusTip ??
                  "Complete a speaking drill to receive feedback and discover what to work on next."}
              </p>

              <div className="mt-6 rounded-[18px] border border-white/[.07] bg-white/[.025] p-4">
                <p className="text-sm font-medium">Practice tip</p>
                <p className="mt-2 text-sm leading-relaxed text-[#a79f92]">
                  Speak at a comfortable pace, organize your ideas, and leave a
                  short pause between important points.
                </p>
              </div>

              <Link
                href="/drills"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f5b36c] to-[#e99a47] px-4 py-3 text-sm font-semibold text-[#2a1a08] transition hover:-translate-y-px"
              >
                Practice now <ArrowRight size={15} />
              </Link>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof MessageSquare;
}) {
  return (
    <div className="rounded-[20px] border border-white/[.07] bg-gradient-to-br from-white/5 to-white/[.01] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[#cfc8bb]">{label}</p>

        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#f0a65c]/20 bg-[#f0a65c]/[.09] text-[#f0a65c]">
          <Icon size={17} />
        </span>
      </div>

      <p className="mt-4 break-words font-['Fraunces',serif] text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
