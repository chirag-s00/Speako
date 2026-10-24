import DashboardView from "@/modules/dashboard/dashboard-view";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speako - AI speaking practice app",
  description: "Practice your speaking skills with AI-powered feedback",
};

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardView username={user.username} />;
}
