import { at } from "@/modules/speak/lib/reel";
import { ReelCard } from "@/modules/speak/components/reel-card";
import type { ReelItem } from "@/modules/speak/constants";

type Props = {
  reel: ReadonlyArray<ReelItem>;
  pos: number;
  spinning: boolean;
  landed: boolean;
};

export function Reel({ reel, pos, spinning, landed }: Props) {
  const first = Math.floor(pos) - 4;
  const visible = Array.from({ length: 10 }, (_, k) => first + k);

  return (
    <div className="relative mt-auto h-[360px] min-w-0 overflow-hidden [perspective-origin:50%_50%] [perspective:1100px]">
      <div className="pointer-events-none absolute left-0 right-0 top-5 h-0.5 bg-gradient-to-r from-transparent via-[#f0a65c]/55 to-transparent" />

      <div className="pointer-events-none absolute bottom-5 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#f0a65c]/55 to-transparent" />

      <div className="pointer-events-none absolute left-1/2 top-0 z-30 h-11 w-3.5 -translate-x-1/2 bg-gradient-to-b from-[#ffcf94] to-[#f0a65c] drop-shadow-[0_0_10px_rgba(240,166,92,.7)] [clip-path:polygon(0_0,100%_0,50%_100%)]" />

      <div className="pointer-events-none absolute bottom-0 left-1/2 z-30 h-11 w-3.5 -translate-x-1/2 bg-gradient-to-b from-[#ffcf94] to-[#f0a65c] drop-shadow-[0_0_10px_rgba(240,166,92,.7)] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />

      <div className="absolute inset-0 [transform-style:preserve-3d]">
        {visible.map((i) => (
          <ReelCard
            key={i}
            item={at(reel, i)}
            d={i - pos}
            spinning={spinning}
            landed={landed}
          />
        ))}
      </div>
    </div>
  );
}
