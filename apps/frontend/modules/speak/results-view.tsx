"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Lightbulb,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Volume2,
} from "lucide-react";
import { env } from "@/lib/env";

type JobStatus = "pending" | "processing" | "success" | "failed";

type JobResult = {
  transcript: string;
  scores: unknown;
  tips: unknown;
  fillerEvents: unknown;
  metrics?: unknown;
};

type JobSnapshot = {
  jobId: string;
  drillId: string;
  status: JobStatus;
  error?: string;
  result?: JobResult;
};

const API_BASE = (env.API_URL ?? "").replace(/\/$/, "");

function jobUrl(jobId: string, events = false) {
  return `${API_BASE}/jobs/${encodeURIComponent(jobId)}${
    events ? "/events" : ""
  }`;
}

function isSnapshot(value: unknown): value is JobSnapshot {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;

  return (
    typeof data.jobId === "string" &&
    ["pending", "processing", "success", "failed"].includes(String(data.status))
  );
}

function formatLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* ---------- Generic data renderer ---------- */

function DataValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-[#a79f92]">—</span>;
  }

  if (typeof value === "string" || typeof value === "number") {
    return (
      <span className="whitespace-pre-wrap break-words">{String(value)}</span>
    );
  }

  if (typeof value === "boolean") {
    return <span>{value ? "Yes" : "No"}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-[#a79f92]">No items</span>;
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/[.07] bg-white/[.02] p-3"
          >
            <DataValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 0) {
      return <span className="text-[#a79f92]">No data</span>;
    }

    return (
      <div className="space-y-3">
        {entries.map(([key, item]) => (
          <div key={key} className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a79f92]">
              {formatLabel(key)}
            </div>
            <div className="text-sm leading-relaxed text-[#eee7dc]">
              <DataValue value={item} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span>Unavailable</span>;
}

/* ---------- Section card ---------- */

function ResultSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-white/[.07] bg-white/[.025] p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0a65c]/10 text-[#f0a65c]">
          {icon}
        </div>
        <h2 className="font-['Fraunces',serif] text-xl font-semibold">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/* ---------- Main component ---------- */

export function DrillResultsView({ jobId }: { jobId: string }) {
  const [snapshot, setSnapshot] = useState<JobSnapshot | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [retry, setRetry] = useState(0);

  const loadSnapshot = useCallback(async (): Promise<JobSnapshot> => {
    const response = await fetch(jobUrl(jobId), {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? "Job not found or you don't have access to it."
          : "Unable to retrieve the analysis.",
      );
    }

    const data: unknown = await response.json();

    if (!isSnapshot(data)) {
      throw new Error("The server returned an invalid job response.");
    }

    return data;
  }, [jobId]);

  useEffect(() => {
    let disposed = false;
    let terminal = false;
    let polling = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let source: EventSource | undefined;

    const applySnapshot = (next: JobSnapshot) => {
      if (disposed) return;

      setSnapshot(next);
      setConnectionError(false);

      if (next.status === "success" || next.status === "failed") {
        terminal = true;
        source?.close();

        if (timer) clearTimeout(timer);
      }
    };

    const poll = async () => {
      if (disposed || terminal || polling) return;

      polling = true;

      try {
        const next = await loadSnapshot();
        applySnapshot(next);
      } catch {
        if (!disposed && !terminal) {
          setConnectionError(true);
        }
      } finally {
        polling = false;

        if (!disposed && !terminal) {
          timer = setTimeout(poll, 1000);
        }
      }
    };

    // First load current status, then open the event stream.
    const start = async () => {
      try {
        const initial = await loadSnapshot();

        if (disposed) return;

        applySnapshot(initial);

        if (terminal) return;

        source = new EventSource(jobUrl(jobId, true), {
          withCredentials: true,
        });

        source.onmessage = (event) => {
          try {
            const data: unknown = JSON.parse(event.data);

            if (isSnapshot(data)) {
              applySnapshot(data);
            }
          } catch {
            // Ignore malformed events; the next event or poll can recover.
          }
        };

        source.onerror = () => {
          if (disposed || terminal) return;

          source?.close();

          // EventSource cannot set arbitrary authorization headers.
          // Polling is a fallback for SSE connection failures.
          void poll();
        };
      } catch {
        if (!disposed) {
          setConnectionError(true);
          void poll();
        }
      }
    };

    void start();

    return () => {
      disposed = true;
      source?.close();
      if (timer) clearTimeout(timer);
    };
  }, [jobId, loadSnapshot, retry]);

  const status = snapshot?.status;

  if (!snapshot || status === "pending" || status === "processing") {
    return (
      <main className="min-h-[60vh] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <small className="font-semibold tracking-[.2em] text-[#f0a65c]">
              SPEAKING PRACTICE
            </small>
            <h1 className="mb-2 mt-2 font-['Fraunces',serif] text-4xl font-semibold sm:text-5xl">
              Analyzing your speech
            </h1>
            <p className="text-[#cfc8bb]">
              We&apos;re working on your transcript and feedback.
            </p>
          </div>

          <section className="rounded-2xl border border-white/[.07] bg-white/[.025] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f0a65c]/10 text-[#f0a65c]">
                <LoaderCircle className="animate-spin" size={23} />
              </div>
              <div>
                <h2 className="font-medium">
                  {status === "processing"
                    ? "Analyzing recording"
                    : "Waiting for analysis"}
                </h2>
                <p className="mt-1 text-sm text-[#a79f92]">
                  {connectionError
                    ? "Reconnecting to the server…"
                    : "This may take a little while."}
                </p>
              </div>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-[#f0a65c]" />
            </div>

            {connectionError && (
              <button
                onClick={() => setRetry((value) => value + 1)}
                className="mt-5 inline-flex items-center gap-2 text-sm text-[#ffcf94] hover:text-white"
              >
                <RefreshCw size={15} />
                Reconnect
              </button>
            )}
          </section>
        </div>
      </main>
    );
  }

  if (status === "failed") {
    return (
      <main className="min-h-[60vh] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-400/20 bg-red-400/[.04] p-6 sm:p-8">
          <AlertCircle size={30} className="mb-4 text-red-300" />
          <h1 className="font-['Fraunces',serif] text-3xl font-semibold">
            Analysis unsuccessful
          </h1>
          <p className="mt-3 text-[#cfc8bb]">
            {snapshot.error ??
              "We couldn't analyze this recording. Please try again."}
          </p>
          <button
            onClick={() => setRetry((value) => value + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[.1] px-5 py-3 text-sm hover:border-[#f0a65c]/50"
          >
            <RefreshCw size={16} />
            Check status again
          </button>
        </div>
      </main>
    );
  }

  const result = snapshot.result;

  if (!result) {
    return (
      <main className="p-6">
        <p className="text-[#cfc8bb]">
          The job completed, but no result was returned.
        </p>
      </main>
    );
  }

  return (
    <main className="min-w-0 overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-7">
        {/* Page header */}
        <header>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[.2em] text-[#f0a65c]">
            <CheckCircle2 size={17} />
            ANALYSIS COMPLETE
          </div>

          <h1 className="font-['Fraunces',serif] text-4xl font-semibold tracking-tight sm:text-5xl">
            Your speaking results
          </h1>

          <p className="mt-3 max-w-2xl leading-relaxed text-[#cfc8bb]">
            Review your transcript, explore your scores, and use the feedback to
            improve your next attempt.
          </p>
        </header>

        {/* Result overview */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
            <FileText className="mb-3 text-[#f0a65c]" size={21} />
            <p className="text-sm text-[#a79f92]">Transcript</p>
            <p className="mt-1 font-medium">Ready to review</p>
          </div>

          <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
            <Activity className="mb-3 text-[#f0a65c]" size={21} />
            <p className="text-sm text-[#a79f92]">Scores</p>
            <p className="mt-1 font-medium">Analysis available</p>
          </div>

          <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
            <Lightbulb className="mb-3 text-[#f0a65c]" size={21} />
            <p className="text-sm text-[#a79f92]">Feedback</p>
            <p className="mt-1 font-medium">Ready to explore</p>
          </div>
        </div>

        {/* Transcript */}
        <ResultSection
          title="Transcript"
          icon={<MessageSquareText size={20} />}
        >
          <p className="whitespace-pre-wrap break-words text-base leading-8 text-[#eee7dc]">
            {result.transcript || "No transcript available."}
          </p>
        </ResultSection>

        {/* Scores */}
        <ResultSection title="Speaking scores" icon={<Activity size={20} />}>
          <DataValue value={result.scores} />
        </ResultSection>

        {/* Tips */}
        <ResultSection title="Tips to improve" icon={<Lightbulb size={20} />}>
          <DataValue value={result.tips} />
        </ResultSection>

        {/* Filler words */}
        <ResultSection
          title="Filler words and events"
          icon={<Volume2 size={20} />}
        >
          <DataValue value={result.fillerEvents} />
        </ResultSection>

        {/* Optional metrics */}
        {result.metrics !== undefined && (
          <ResultSection title="Additional metrics" icon={<Clock3 size={20} />}>
            <DataValue value={result.metrics} />
          </ResultSection>
        )}
      </div>
    </main>
  );
}
