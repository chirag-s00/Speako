import { Wave } from "../wave";
import { RecorderButton } from "@/modules/speak/components/recorder-button";
import { RecordingResult } from "@/modules/speak/components/recording-result";
import type { ReelItem } from "@/modules/speak/constants";

type Props = {
  current: ReelItem;
  spinning: boolean;
  isRecording: boolean;
  elapsed: number;
  maxDuration: number;
  hasRecording: boolean;
  isUploading: boolean;
  isSubmitted: boolean;
  recorderError: string | null;
  uploadError: string | null;
  onToggleRecording: () => void;
  onReset: () => void;
  onUpload: () => void;
};

export function PromptPanel({
  current,
  spinning,
  isRecording,
  elapsed,
  maxDuration,
  hasRecording,
  isUploading,
  isSubmitted,
  recorderError,
  uploadError,
  onToggleRecording,
  onReset,
  onUpload,
}: Props) {
  const CurIcon = current.Icon;

  return (
    <aside className="flex min-w-0 flex-col gap-[18px] self-start overflow-hidden rounded-[22px] border border-white/[.07] bg-white/[.015] p-4 sm:p-5 max-lg:mt-4">
      <div className="inline-flex max-w-full items-center gap-3 self-start rounded-full bg-white/[.04] py-2 pl-2 pr-4 text-[17px] font-medium sm:pr-[22px]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f0a65c]/[.14]">
          <Wave small />
        </span>
        Your Prompt
      </div>

      <div className="min-w-0 rounded-[18px] border border-white/[.07] bg-gradient-to-br from-white/5 to-white/[.01] p-4 sm:p-[22px]">
        <div
          className={
            "transition duration-300 " +
            (spinning ? "opacity-35 blur-[2px]" : "")
          }
        >
          <div className="flex min-w-0 items-center gap-3.5 text-lg font-medium">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#f0a65c]/30 bg-[#3a2a1c] text-[#ffcf94]">
              <CurIcon size={18} />
            </span>
            <span className="min-w-0 break-words">{current.cat}</span>
          </div>

          <h2 className="mb-3.5 mt-[22px] break-words font-['Fraunces',serif] text-[27px] font-semibold leading-[1.15] tracking-tight sm:text-[31px]">
            {current.text}
          </h2>

          <p className="mb-[22px] break-words text-[15.5px] leading-relaxed text-[#cfc8bb]">
            {current.desc}
          </p>
        </div>

        {hasRecording && !isRecording ? (
          <RecordingResult
            elapsed={elapsed}
            isUploading={isUploading}
            isSubmitted={isSubmitted}
            error={uploadError ?? recorderError}
            onReset={onReset}
            onUpload={onUpload}
          />
        ) : (
          <>
            <RecorderButton
              isRecording={isRecording}
              elapsed={elapsed}
              maxDuration={maxDuration}
              disabled={spinning || isUploading}
              onToggle={onToggleRecording}
            />

            {recorderError && (
              <p role="alert" className="text-xs text-[#f0a65c]">
                {recorderError}
              </p>
            )}

            {uploadError && (
              <p role="alert" className="text-xs text-[#f0a65c]">
                {uploadError}
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
