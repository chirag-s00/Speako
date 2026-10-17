import HomeDashboard from "@/modules/dashboard/dashboard-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speako - AI speaking practice app",
  description: "Practice your speaking skills with AI-powered feedback",
};

export default function Home() {
  return <HomeDashboard></HomeDashboard>;
}
