import { env } from "@/lib/env";

const API_URL = env.API_URL;

// ---------- Types ----------

export type DrillResult = {
  id: string; // Result ID
  drillId: string; // Drill ID
  transcript: string;
  scores: {
    pacing: number;
    clarity: number;
    fluency: number;
    coherence: number;
    vocabulary: number;
  };
  metrics: {
    pauseCount: number;
    fillerCount: number;
    longestPauseMs: number;
    wordsPerMinute: number;
    repetitionCount: number;
  };
  tips: string[];
  fillerEvents: {
    word: string;
    start_ms: number;
  }[];
  createdAt: string;
  drill: {
    id: string;
    mode: string;
    prompt: string | null;
    durationSec: number | null;
    createdAt: string;
  };
};

export type ResultsResponse = {
  results: DrillResult[];
  nextCursor: string | null;
};

export type ResultDetail = {
  id: string; // Drill ID
  mode: string;
  prompt: string | null;
  durationSec: number | null;
  createdAt: string;
  result: {
    id: string; // Result ID
    transcript: string;
    scores: DrillResult["scores"];
    metrics: DrillResult["metrics"];
    tips: string[];
    fillerEvents: DrillResult["fillerEvents"];
    createdAt: string;
  };
};

// ---------- Errors ----------

// Lets the UI branch on status (redirect on 401, not-found page on 404)
// instead of matching on message strings.
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleError(response: Response): Promise<never> {
  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new ApiError("Please log in to view your results.", 401);
  }

  if (response.status === 404) {
    throw new ApiError("Speaking result not found.", 404);
  }

  throw new ApiError(
    data?.message ?? "Something went wrong while fetching results.",
    response.status,
  );
}

// ---------- Request helper ----------

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!API_URL) {
    throw new Error("API URL is not configured.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<T>;
}

// ---------- GET /progress ----------

export async function getResults(
  limit = 10,
  cursor?: string,
  signal?: AbortSignal,
): Promise<ResultsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });

  if (cursor) {
    params.set("cursor", cursor);
  }

  return request<ResultsResponse>(`/progress?${params.toString()}`, signal);
}

// ---------- GET /progress/:drillId ----------

export async function getResultById(
  drillId: string,
  signal?: AbortSignal,
): Promise<ResultDetail> {
  const data = await request<{ result: ResultDetail }>(
    `/progress/${encodeURIComponent(drillId)}`,
    signal,
  );

  return data.result;
}