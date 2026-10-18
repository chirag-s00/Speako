"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ease, mod } from "@/modules/speak/lib/reel";
import { RANDOM } from "@/modules/speak/constants";
import type { ReelItem } from "@/modules/speak/constants";
import { useSound } from "@/modules/speak/hooks/use-sound";

type Sound = ReturnType<typeof useSound>;

type Args = {
  reel: ReadonlyArray<ReelItem>;
  filter: string;
  sound: Sound;
  disabled?: boolean;
  onSpinStart?: () => void;
};

export function useReelSpin({
  reel,
  filter,
  sound,
  disabled = false,
  onSpinStart,
}: Args) {
  const [pos, setPos] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(true);

  const raf = useRef<number>(0);
  const posRef = useRef(0);

  // Keep the latest callback without making `spin` depend on its identity.
  const onSpinStartRef = useRef(onSpinStart);
  useEffect(() => {
    onSpinStartRef.current = onSpinStart;
  }, [onSpinStart]);

  const n = reel.length;

  useEffect(() => {
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const spin = useCallback((): void => {
    if (spinning || disabled) return;

    const pool = reel
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => filter === RANDOM || item.cat === filter);

    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return;

    sound.unlock();
    sound.start();
    onSpinStartRef.current?.();

    setSpinning(true);
    setLanded(false);

    const from = posRef.current;
    const base = Math.ceil(from);
    const target = base + n * 3 + mod(pick.i - base, n);

    const dur = 4200 + Math.random() * 800;
    const t0 = performance.now();

    let lastIdx = Math.round(from);

    const frame = (now: number): void => {
      const t = Math.min((now - t0) / dur, 1);
      const p = from + (target - from) * ease(t);

      posRef.current = p;
      setPos(p);

      const idx = Math.round(p);
      if (idx !== lastIdx) {
        sound.tick(t);
        lastIdx = idx;
      }

      if (t < 1) {
        raf.current = requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        setLanded(true);
        sound.land();
      }
    };

    raf.current = requestAnimationFrame(frame);
  }, [spinning, disabled, reel, filter, n, sound]);

  const resetPosition = useCallback((): void => {
    cancelAnimationFrame(raf.current);
    posRef.current = 0;
    setPos(0);
    setSpinning(false);
    setLanded(true);
  }, []);

  return { pos, spinning, landed, spin, resetPosition };
}