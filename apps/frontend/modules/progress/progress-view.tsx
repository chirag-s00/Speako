"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, getResults, type DrillResult } from "./lib/getResults";

export default function ProgressView() {
  const router = useRouter();

  const [results, setResults] = useState<DrillResult[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getResults(10);
      setResults(data.results);
      setNextCursor(data.nextCursor);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Could not load your speaking results.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const data = await getResults(10, nextCursor);

      setResults((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const newResults = data.results.filter(
          (item) => !existingIds.has(item.id),
        );

        return [...current, ...newResults];
      });

      setNextCursor(data.nextCursor);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Could not load more results.",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, item) => sum + getOverallScore(item.scores), 0) /
            results.length,
        )
      : 0;

  const totalSpeakingSeconds = results.reduce(
    (sum, item) => sum + (item.drill.durationSec ?? 0),
    0,
  );

  if (loading) {
    return (
      <main className="p-8 text-[#eee7dc]">
        Loading your speaking results...
      </main>
    );
  }

  return (
    <main className="min-w-0 space-y-8 overflow-hidden p-4 text-[#eee7dc] sm:p-5 lg:py-7 lg:pl-7 lg:pr-7">
      <header>
        <p className="text-sm tracking-[0.2em] text-[#f0a65c]">PROGRESS</p>
        
        <h1 className="mt-2 font-['Fraunces',serif] text-4xl sm:text-5xl font-semibold tracking-tight ">
          Results
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-[#a79f92]">
          Review your completed drills and track how your speaking improves.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/[.05] p-4 text-sm text-red-300"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadResults()}
            className="mt-3 underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Completed drills" value={String(results.length)} />

        <StatCard label="Average score" value={`${averageScore}/100`} />

        <StatCard
          label="Speaking time"
          value={formatDuration(totalSpeakingSeconds)}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-medium">Drill history</h2>
            <p className="mt-1 text-sm text-[#a79f92]">
              Select a drill to see your transcript and detailed feedback.
            </p>
          </div>

          <span className="text-sm text-[#a79f92]">
            {results.length} loaded
          </span>
        </div>

        {results.length === 0 && !error ? (
          <div className="rounded-2xl border border-white/[.07] bg-white/[.02] p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f0a65c]/10 text-[#f0a65c]">
              <span className="text-xl">↗</span>
            </div>

            <h3 className="mt-4 font-medium">Your journey starts here</h3>

            <p className="mt-2 text-sm text-[#a79f92]">
              Complete your first speaking drill to see your scores and feedback
              here.
            </p>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-5 rounded-full bg-[#f0a65c] px-5 py-2.5 text-sm font-medium text-[#20170f] transition hover:bg-[#f5b978]"
            >
              Start a drill
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((item) => {
              const scores = getScores(item.scores);

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => router.push(`/progress/${item.drillId}`)}
                  className="group w-full rounded-2xl border border-white/[.07] bg-white/[.025] p-5 text-left transition hover:border-[#f0a65c]/50 hover:bg-white/[.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0a65c]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#f0a65c]">
                        {item.drill.mode}
                      </p>

                      <h3 className="mt-2 break-words font-medium">
                        {item.drill.prompt || "Speaking drill"}
                      </h3>

                      <p className="mt-2 text-sm text-[#a79f92]">
                        {formatDate(item.createdAt)}{" "}
                        <span aria-hidden="true">·</span>{" "}
                        {formatDuration(item.drill.durationSec ?? 0)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-semibold">
                        {scores.overall}
                        <span className="text-sm text-[#a79f92]">/100</span>
                      </p>
                      <p className="text-xs text-[#a79f92]">Overall score</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Score label="Pacing" value={scores.pacing} />
                    <Score label="Fluency" value={scores.fluency} />
                    <Score label="Vocabulary" value={scores.vocabulary} />
                    <Score label="Coherence" value={scores.coherence} />
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 text-sm text-[#f0a65c]">
                    View detailed results
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {nextCursor && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => void handleLoadMore()}
              disabled={loadingMore}
              className="rounded-full border border-white/[.07] bg-white/[.03] px-6 py-3 text-sm text-[#cfc8bb] transition hover:border-[#f0a65c]/50 hover:text-[#f0a65c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more results"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

// ---------- Components ----------

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5">
      <p className="text-sm text-[#a79f92]">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  const safeValue = Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : 0;

  return (
    <div>
      <div className="mb-2 flex justify-between gap-2 text-sm">
        <span className="text-[#cfc8bb]">{label}</span>
        <span>{safeValue}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
        <div
          className="h-full rounded-full bg-[#f0a65c] transition-[width]"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

// ---------- Helpers ----------

type ScoreValues = {
  pacing: number;
  clarity: number;
  fluency: number;
  coherence: number;
  vocabulary: number;
  overall: number;
};

function getScores(value: unknown): ScoreValues {
  const data =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const readScore = (key: Exclude<keyof ScoreValues, "overall">): number => {
    const score = data[key];

    return typeof score === "number" && Number.isFinite(score)
      ? Math.min(100, Math.max(0, score))
      : 0;
  };

  const pacing = readScore("pacing");
  const clarity = readScore("clarity");
  const fluency = readScore("fluency");
  const coherence = readScore("coherence");
  const vocabulary = readScore("vocabulary");

  const overall = Math.round(
    (pacing + clarity + fluency + coherence + vocabulary) / 5,
  );

  return {
    pacing,
    clarity,
    fluency,
    coherence,
    vocabulary,
    overall,
  };
}

function getOverallScore(value: unknown): number {
  return getScores(value).overall;
}

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return minutes > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${remainingSeconds}s`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
