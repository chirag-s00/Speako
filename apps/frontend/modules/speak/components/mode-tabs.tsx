import { MODES, type Mode } from "@/modules/speak/constants";

type Props = {
  mode: Mode;
  disabled: boolean;
  onChange: (mode: Mode) => void;
};

export function ModeTabs({ mode, disabled, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Mode"
      className="mt-[18px] inline-flex max-w-full rounded-full border border-white/[.07] bg-white/[.03] p-1"
    >
      {MODES.map(({ id, label }) => (
        <button
          key={id}
          role="tab"
          aria-selected={mode === id}
          onClick={() => onChange(id)}
          disabled={disabled}
          className={
            "rounded-full px-3 py-[9px] text-sm transition sm:px-[18px] " +
            (mode === id
              ? "bg-[#f0a65c] font-semibold text-[#2a1a08]"
              : "text-[#a79f92] hover:text-white")
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
