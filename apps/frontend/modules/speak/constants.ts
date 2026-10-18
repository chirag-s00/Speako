import type { buildReel } from "@/modules/speak/lib/reel";

export type Mode = "drills" | "interview";

// Temporary: derived from buildReel so it always matches what the reel returns.
// Replace with an explicit type later if you want.
export type ReelItem = ReturnType<typeof buildReel>[number];


export const MAX_DURATION = 90;
export const CARD_W = 190;
export const RANDOM = "Random Mode";

export const MODES: ReadonlyArray<{ id: Mode; label: string }> = [
  { id: "drills", label: "Practice drills" },
  { id: "interview", label: "Interview" },
];