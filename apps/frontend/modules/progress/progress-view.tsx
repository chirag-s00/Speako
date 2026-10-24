"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Clock3,
  Flame,
  Target,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

type DrillResult = {
  id: string;
  promptText: string;
  mode: string;
  durationSeconds: number;
  createdAt: string;
  scores: {
    pacing: number;
    fluency: number;
    vocabulary: number;
    coherence: number;
    overall: number;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SCORE_FIELDS = [
  { key: "pacing", label: "Pacing" },
  { key: "fluency", label: "Fluency" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "coherence", label: "Coherence" },
] as const;

export function ProgressView() {
  const [results, setResults] = useState<DrillResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    if (!API_URL) {
      setError("API URL is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/progress`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Please sign in to view your progress."
            : "Unable to load your progress.",
        );
      }

      const data: { results: DrillResult[] } = await response.json();

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  const averageScore = results.length
    ? Math.round(
        results.reduce((total, result) => total + result.scores.overall, 0) /
          results.length,
      )
    : 0;

  const totalMinutes = Math.round(
    results.reduce((total, result) => total + result.durationSeconds, 0) / 60,
  );

  return (
    <main className="min-w-0 overflow-hidden p-4 sm:p-5 lg:p-7">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <small className="text-xs font-semibold tracking-[.2em] text-[#f0a65c]">
            YOUR JOURNEY
          </small>

          <h1 className="mt-2 font-['Fraunces',serif] text-4xl font-semibold sm:text-5xl">
            Progress
          </h1>

          <p className="mt-2 text-[#cfc8bb]">
            Every drill makes you a stronger speaker.
          </p>
        </div>

        <button
          onClick={() => void loadResults()}
          disabled={loading}
          aria-label="Refresh progress"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[.07] text-[#ffcf94] transition hover:bg-white/[.05] disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300"
        >
          {error}
          <button onClick={() => void loadResults()} className="ml-3 underline">
            Try again
          </button>
        </div>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Target}
          label="Completed drills"
          value={loading ? "—" : String(results.length)}
        />

        <StatCard
          icon={TrendingUp}
          label="Average score"
          value={loading ? "—" : `${averageScore}/100`}
        />

        <StatCard
          icon={Clock3}
          label="Speaking time"
          value={loading ? "—" : `${totalMinutes} min`}
        />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-['Fraunces',serif] text-2xl font-semibold">
            Drill history
          </h2>

          <span className="text-sm text-[#a7a195]">
            {results.length} sessions
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/[.07] p-8 text-center text-[#a7a195]">
            Loading your results...
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-white/[.07] bg-white/[.02] px-6 py-12 text-center">
            <Activity size={30} className="mx-auto mb-4 text-[#f0a65c]" />

            <h3 className="text-lg font-medium">Your journey starts here</h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#a7a195]">
              Complete your first speaking drill to see your scores and track
              your improvement over time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <article
                key={result.id}
                className="rounded-2xl border border-white/[.07] bg-white/[.02] p-5 transition hover:border-[#f0a65c]/30 sm:p-6"
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#f0a65c]">
                      {result.mode}
                    </p>

                    <h3 className="text-lg font-medium">{result.promptText}</h3>

                    <p className="mt-2 text-sm text-[#a7a195]">
                      {new Date(result.createdAt).toLocaleDateString(
                        undefined,
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                      {" · "}
                      {Math.floor(result.durationSeconds / 60)}:
                      {String(result.durationSeconds % 60).padStart(2, "0")}{" "}
                      min:sec
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-3xl font-semibold text-[#ffcf94]">
                      {result.scores.overall}
                    </p>
                    <p className="text-xs text-[#a7a195]">Overall / 100</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {SCORE_FIELDS.map(({ key, label }) => {
                    const score = result.scores[key];

                    return (
                      <div key={key}>
                        <div className="mb-2 flex justify-between gap-2 text-sm">
                          <span className="text-[#cfc8bb]">{label}</span>
                          <span>{score}</span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                          <div
                            className="h-full rounded-full bg-[#f0a65c]"
                            style={{
                              width: `${Math.max(0, Math.min(100, score))}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-white/[.07] bg-white/[.02] p-5">
      <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-[#f0a65c]/15 bg-[#f0a65c]/[.07] text-[#f0a65c]">
        <Icon size={19} />
      </div>

      <p className="text-sm text-[#a7a195]">{label}</p>

      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </article>
  );
}
