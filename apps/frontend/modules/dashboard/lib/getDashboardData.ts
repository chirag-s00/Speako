
import { getResults, type DrillResult } from "@/modules/progress/lib/getResults";

export type DashboardData = {
  results: DrillResult[];
  nextCursor: string | null;
  completedDrills: number;
  averageScore: number;
  averageFluency: number;
  totalSpeakingSeconds: number;
  recent: DrillResult[];
  focusTip: string | null;
};

function getOverallScore(scores: DrillResult["scores"]): number {
  const values = [
    scores.pacing,
    scores.clarity,
    scores.fluency,
    scores.coherence,
    scores.vocabulary,
  ];

  return Math.round(
    values.reduce((total, score) => total + score, 0) / values.length,
  );
}

export async function getDashboardData(
  limit = 10,
): Promise<DashboardData> {
  const data = await getResults(limit);
  const results = data.results;

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce(
            (total, item) => total + getOverallScore(item.scores),
            0,
          ) / results.length,
        )
      : 0;

  const averageFluency =
    results.length > 0
      ? Math.round(
          results.reduce((total, item) => total + item.scores.fluency, 0) /
            results.length,
        )
      : 0;

  const totalSpeakingSeconds = results.reduce(
    (total, item) => total + (item.drill.durationSec ?? 0),
    0,
  );

  const latestResult = results[0];

  return {
    results,
    nextCursor: data.nextCursor,
    completedDrills: results.length,
    averageScore,
    averageFluency,
    totalSpeakingSeconds,
    recent: results.slice(0, 3),
    focusTip: latestResult?.tips?.[0] ?? null,
  };
}
