"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Lightbulb,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Volume2,
} from "lucide-react";

import { ApiError, getResultById, type ResultDetail } from "./lib/getResults";

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

function DataValue({ value }: { value: unknown }) {
  if (value == null) {
    return <span className="text-[#a79f92]">Not available</span>;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return (
      <span className="whitespace-pre-wrap break-words">{String(value)}</span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-[#a79f92]">No items recorded</span>;
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
    return (
      <div className="space-y-4">
        {Object.entries(value as Record<string, unknown>).map(([key, item]) => (
          <div key={key}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#a79f92]">
              {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
            </p>
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

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function ProgressResultView({ drillId }: { drillId: string }) {
  const router = useRouter();

  const [drill, setDrill] = useState<ResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResult() {
      setLoading(true);
      setError(null);

      try {
        const data = await getResultById(drillId, controller.signal);

        if (!controller.signal.aborted) {
          setDrill(data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this speaking result.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadResult();

    return () => controller.abort();
  }, [drillId, retry, router]);

  if (loading) {
    return (
      <main className="min-h-[60vh] p-6 lg:p-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/[.07] bg-white/[.025] p-8">
          <LoaderCircle
            className="mb-4 animate-spin text-[#f0a65c]"
            size={28}
          />
          <h1 className="font-['Fraunces',serif] text-3xl font-semibold">
            Loading your results
          </h1>
          <p className="mt-2 text-[#cfc8bb]">
            Retrieving your saved speaking analysis.
          </p>
        </div>
      </main>
    );
  }

  if (error || !drill) {
    return (
      <main className="min-h-[60vh] p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-400/20 bg-red-400/[.04] p-6 sm:p-8">
          <AlertCircle className="mb-4 text-red-300" size={30} />
          <h1 className="font-['Fraunces',serif] text-3xl font-semibold">
            Unable to load results
          </h1>
          <p className="mt-3 text-[#cfc8bb]">
            {error ?? "This speaking result could not be found."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/progress")}
              className="inline-flex items-center gap-2 rounded-full border border-white/[.1] px-5 py-3 text-sm hover:border-[#f0a65c]/50"
            >
              <ArrowLeft size={16} />
              Back to progress
            </button>

            <button
              onClick={() => setRetry((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-[#f0a65c] px-5 py-3 text-sm font-semibold text-[#21170f]"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const result = drill.result;

  return (
    <main className="min-w-0 overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-7">
        <button
          onClick={() => router.push("/progress")}
          className="inline-flex items-center gap-2 text-sm text-[#cfc8bb] transition hover:text-[#f0a65c]"
        >
          <ArrowLeft size={16} />
          Back to progress
        </button>

        <header>
          <h1 className="font-['Fraunces',serif] text-4xl font-semibold tracking-tight sm:text-5xl">
            Analysis
          </h1>

          <p className="mt-3 max-w-2xl leading-relaxed text-[#a79f92]">
            Review your transcript, explore your scores, and use the feedback to
            improve your next attempt.
          </p>

          <p className="mt-3 text-sm text-[#a79f92]">
            Completed on {formatDate(result.createdAt)}
          </p>
        </header>
        <ResultSection title="Drill duration" icon={<Clock3 size={20} />}>
          <p className="whitespace-pre-wrap break-words text-base leading-8 text-[#eee7dc]">
            {`${drill.durationSec} seconds` || "Duration not available."}
          </p>
        </ResultSection>
        <ResultSection
          title="Transcript"
          icon={<MessageSquareText size={20} />}
        >
          <p className="whitespace-pre-wrap break-words text-base leading-8 text-[#eee7dc]">
            {result.transcript || "No transcript available."}
          </p>
        </ResultSection>

        <ResultSection title="Speaking scores" icon={<Activity size={20} />}>
          <DataValue value={result.scores} />
        </ResultSection>

        <ResultSection title="Tips to improve" icon={<Lightbulb size={20} />}>
          <DataValue value={result.tips} />
        </ResultSection>

        <ResultSection
          title="Filler words and events"
          icon={<Volume2 size={20} />}
        >
          <DataValue value={result.fillerEvents} />
        </ResultSection>

        {result.metrics !== undefined && (
          <ResultSection title="Additional metrics" icon={<Clock3 size={20} />}>
            <DataValue value={result.metrics} />
          </ResultSection>
        )}
      </div>
    </main>
  );
}
