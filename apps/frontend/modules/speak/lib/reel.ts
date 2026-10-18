import { LucideIcon } from "lucide-react";
import {DATA} from "../data/prompts"

interface ReelItem {
  cat: string;
  text: string;
  desc: string;
  Icon: LucideIcon;
}


type Mode = "drills" | "interview";


export const mod = (n: number, m: number): number => ((n % m) + m) % m;

export const ease = (t: number): number => 1 - Math.pow(1 - t, 4);

export const at = (reel: readonly ReelItem[], i: number): ReelItem => {
  const item = reel[mod(i, reel.length)];

  if (!item) throw new Error("Reel is empty");

  return item;
};

const flatten = (mode: Mode): ReelItem[] =>
  Object.entries(DATA[mode].categories).flatMap(([cat, category]) =>
    category.prompts.map(([text, desc]): ReelItem => ({
      cat,
      text,
      desc,
      Icon: category.icon,
    })),
  );

 export const buildReel = (mode: Mode): ReelItem[] => {
    const all = flatten(mode);
  
    const byCat: ReelItem[][] = Object.keys(DATA[mode].categories).map(
      (category) => all.filter((item) => item.cat === category),
    );
  
    const out: ReelItem[] = [];
    const longest = Math.max(...byCat.map((group) => group.length));
  
    for (let i = 0; i < longest; i++) {
      for (const group of byCat) {
        const item = group[i];
  
        if (item) out.push(item);
      }
    }
  
    return out;
  };
  