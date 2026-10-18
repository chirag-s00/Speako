import { RotateCcw, Upload, LoaderCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@speako/ui/components/button";
import { fmt } from "@/modules/speak/lib/format";

type Props = {
  elapsed: number;
  isUploading: boolean;
  isSubmitted: boolean;
  error: string | null;
  onReset: () => void;
  onUpload: () => void;
};

export function RecordingResult({
  elapsed,
  isUploading,
  isSubmitted,
  error,
  onReset,
  onUpload,
}: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="text-center text-sm text-[#cfc8bb]">
        Recording finished · {fmt(elapsed)}
      </p>

      <Button
        variant="outline"
        className="h-12 w-full rounded-xl border-white/10 bg-white/5 font-medium text-[#efe9df] hover:bg-white/10"
        onClick={onReset}
        disabled={isUploading}
      >
        <RotateCcw className="mr-2 size-4" />
        Record again
      </Button>

      <Button
        className="h-12 w-full rounded-xl bg-[#f0a65c] font-medium text-[#2a1a08] shadow-sm hover:bg-[#f5b36c]"
        onClick={onUpload}
        disabled={isUploading || isSubmitted}
      >
        {isUploading ? (
          <LoaderCircle className="mr-2 size-4 animate-spin" />
        ) : isSubmitted ? (
          <CheckCircle2 className="mr-2 size-4" />
        ) : (
          <Upload className="mr-2 size-4" />
        )}

        {isUploading
          ? "Submitting..."
          : isSubmitted
            ? "Submitted"
            : "Upload recording"}
      </Button>

      {isSubmitted && (
        <p className="break-words text-xs text-emerald-400">
          Recording submitted successfully.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="break-words text-xs leading-relaxed text-[#f0a65c]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
 {
   /* {audioUrl && (
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
                  )} */
 }