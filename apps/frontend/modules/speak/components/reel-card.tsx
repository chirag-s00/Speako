import { CARD_W } from "@/modules/speak/constants";
import type { ReelItem } from "@/modules/speak/constants";

type Props = {
  item: ReelItem;
  d: number; // distance from the current reel position
  spinning: boolean;
  landed: boolean;
};

export function ReelCard({ item, d, spinning, landed }: Props) {
  const ad = Math.abs(d);
  const center = ad < 0.5;
  const ItemIcon = item.Icon;

  return (
    <div
      className={
        "absolute left-1/2 top-[50px] flex h-[260px] w-44 flex-col items-center gap-3.5 rounded-[22px] bg-gradient-to-br px-3.5 py-[22px] text-center will-change-transform " +
        (center
          ? "border-[3px] border-[#f3a456] from-[#f0a65c]/30 to-[#f0a65c]/10 text-white shadow-[0_0_40px_rgba(240,166,92,.4),inset_0_0_30px_rgba(240,166,92,.15)] " +
            (landed ? "motion-safe:animate-land" : "")
          : "border border-white/[.07] from-white/[.07] to-white/[.02] text-[#d8cfc0]")
      }
      style={{
        transform: `translateX(calc(-50% + ${d * CARD_W}px)) rotateY(${-d * 28}deg) scale(${Math.max(1 - ad * 0.13, 0.5)})`,
        opacity: Math.max(1 - ad * 0.28, 0),
        filter: `blur(${spinning ? Math.min(ad * 0.6 + 0.8, 3) : Math.min(ad * 0.7, 2.5)}px)`,
        zIndex: 10 - Math.round(ad),
      }}
    >
      <ItemIcon
        size={34}
        className={
          "mt-[26px] " + (center ? "text-[#ffcf94]" : "text-[#e8c9a2]")
        }
      />

      <h3 className="grid flex-1 items-center font-['Fraunces',serif] text-xl font-medium leading-tight">
        {item.text}
      </h3>

      <span className="rounded-full bg-white/[.07] px-3.5 py-2 text-[11px] uppercase tracking-wider text-[#cbbfae]">
        {item.cat}
      </span>
    </div>
  );
}
