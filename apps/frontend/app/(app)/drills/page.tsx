import {DrillsView} from "@/modules/speak/speak-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speako - AI speaking practice app",
  description: "Practice your speaking skills with AI-powered feedback",
};

export default function Home() {
  return <DrillsView></DrillsView>;
}
