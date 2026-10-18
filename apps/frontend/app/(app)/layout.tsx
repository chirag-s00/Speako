import { Fraunces, DM_Sans } from "next/font/google";
import { AppSidebar } from "@/components/layout/app-sidebar";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} font-body grid min-h-screen place-items-center overflow-x-hidden bg-[#0a0b09] p-3 text-[#efe9df] sm:p-6`}
    >
      <div className="grid min-h-[860px] w-full max-w-[1440px] min-w-0 overflow-hidden rounded-[28px] border border-white/[.07] bg-[radial-gradient(1200px_600px_at_55%_45%,#17201a,#0b0d0b)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <AppSidebar />
        {children}
      </div>
    </div>
  );
}
