import { Mic, MicOff, ArrowRight } from "lucide-react";
import { fmt } from "@/modules/speak/lib/format";

type Props = {
  isRecording: boolean;
  elapsed: number;
  maxDuration: number;
  disabled: boolean;
  onToggle: () => void;
};

export function RecorderButton({
  isRecording,
  elapsed,
  maxDuration,
  disabled,
  onToggle,
}: Props) {
  return (
    <>
      <button
        disabled={disabled}
        onClick={onToggle}
        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-[#f5b36c] to-[#e99a47] p-[17px] text-base font-semibold text-[#2a1a08] shadow-[0_6px_24px_rgba(240,166,92,.3)] transition hover:enabled:-translate-y-px disabled:cursor-default disabled:opacity-50"
      >
        {isRecording ? (
          <>
            <MicOff size={16} />
            Stop · {fmt(elapsed)}
          </>
        ) : (
          <>
            <Mic size={16} />
            Start Speaking
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-[#a79f92]">
        {isRecording
          ? `${Math.max(0, maxDuration - elapsed)} seconds remaining`
          : `You have up to ${maxDuration} seconds to speak.`}
      </p>
    </>
  );
}
