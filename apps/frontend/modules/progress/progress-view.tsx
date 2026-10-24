"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Scores = {
  pacing: number;
  fluency: number;
  vocabulary: number;
  coherence: number;
  overall: number;
};

type DrillResult = {
  id: string;
  drillId: string;
  transcript: string;
  scores: Scores;
  metrics: unknown;
  tips: unknown;
  fillerEvents: unknown;
  createdAt: string;
  drill: {
    id: string;
    mode: string;
    prompt: string | null;
    durationSec: number | null;
    createdAt: string;
  };
};

export function ProgressView() {
  const [results, setResults] = useState<DrillResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        if (!API_URL) {
          throw new Error("API URL is not configured");
        }

        const response = await fetch(`${API_URL}/progress`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load your progress");
        }

        const data = await response.json();

        if (!Array.isArray(data.results)) {
          throw new Error("Invalid progress response");
        }

        setResults(data.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, []);

  if (loading) {
    return <main className="p-8 text-[#efe9df]">Loading your progress...</main>;
  }

  if (error) {
    return <main className="p-8 text-red-400">{error}</main>;
  }

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, result) => sum + result.scores.overall, 0) /
            results.length,
        )
      : 0;

  const totalSpeakingSeconds = results.reduce(
    (sum, result) => sum + (result.drill.durationSec ?? 0),
    0,
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  return (
    <main className="min-w-0 space-y-8 p-6 text-[#efe9df] sm:p-8">
      <header>
        <p className="text-sm text-[#f0a65c]">YOUR JOURNEY</p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">
          Speaking progress
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Track your performance across completed drills.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Completed drills" value={String(results.length)} />
        <StatCard label="Average score" value={`${averageScore}/100`} />
        <StatCard
          label="Speaking time"
          value={formatDuration(totalSpeakingSeconds)}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Drill history</h2>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-white/70">No completed drills yet.</p>
            <p className="mt-2 text-sm text-white/40">
              Complete your first drill to see your progress here.
            </p>
          </div>
        ) : (
          results.map((result) => (
            <article
              key={result.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-[#f0a65c]">
                    {result.drill.mode}
                  </p>
                  <h3 className="mt-2 font-medium">
                    {result.drill.prompt || "Speaking drill"}
                  </h3>
                  <p className="mt-2 text-sm text-white/40">
                    {new Date(result.drill.createdAt).toLocaleDateString()} ·{" "}
                    {formatDuration(result.drill.durationSec ?? 0)}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-2xl font-semibold">
                    {result.scores.overall}
                    <span className="text-sm text-white/40">/100</span>
                  </p>
                  <p className="text-xs text-white/40">Overall score</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Score label="Pacing" value={result.scores.pacing} />
                <Score label="Fluency" value={result.scores.fluency} />
                <Score label="Vocabulary" value={result.scores.vocabulary} />
                <Score label="Coherence" value={result.scores.coherence} />
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-2 text-sm">
        <span className="text-white/50">{label}</span>
        <span>{value}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#f0a65c]"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
          }}
        />
      </div>
    </div>
  );
}
