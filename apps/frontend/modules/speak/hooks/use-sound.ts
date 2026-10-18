import { useRef, useState } from "react";


interface Sound {
  muted: boolean;
  setMuted: (muted: boolean) => void;
  unlock: () => void;
  start: () => void;
  tick: (progress?: number) => void;
  land: () => void;
}

type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function useSound(): Sound {
  const ctx = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  mutedRef.current = muted;

  const ac = (): AudioContext => {
    if (!ctx.current) {
      const Ctor =
        window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;

      if (!Ctor) {
        throw new Error("Web Audio is not supported in this browser");
      }

      ctx.current = new Ctor();
    }

    if (ctx.current.state === "suspended") {
      void ctx.current.resume();
    }

    return ctx.current;
  };

  const tone = (
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType = "sine",
    vol = 0.15,
    slideTo?: number,
  ): void => {
    const audio = ac();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audio.currentTime + start);

    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(
        slideTo,
        audio.currentTime + start + dur,
      );
    }

    gain.gain.setValueAtTime(vol, audio.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audio.currentTime + start + dur,
    );

    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(audio.currentTime + start);
    oscillator.stop(audio.currentTime + start + dur + 0.02);
  };

  return {
    muted,
    setMuted,

    unlock: () => {
      ac();
    },

    start: () => {
      if (mutedRef.current) return;

      tone(160, 0, 0.18, "triangle", 0.3, 60);
      tone(300, 0.08, 0.35, "sawtooth", 0.05, 900);
    },

    tick: (progress = 0) => {
      if (mutedRef.current) return;

      tone(1300 - progress * 500, 0, 0.035, "square", 0.05);
      tone(180, 0, 0.03, "triangle", 0.12);
    },

    land: () => {
      if (mutedRef.current) return;

      tone(120, 0, 0.25, "triangle", 0.35, 50);

      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
        tone(freq, 0.12 + i * 0.08, 0.5, "sine", 0.14),
      );

      tone(1568, 0.5, 0.7, "triangle", 0.06);
    },
  };
}
