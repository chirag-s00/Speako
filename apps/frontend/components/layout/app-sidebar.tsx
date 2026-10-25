"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Home, Layers, BarChart3, User } from "lucide-react";
import { LogoutButton } from "../logout/logout-button";

const NAV: ReadonlyArray<{ Icon: LucideIcon; label: string; href: string }> = [
  { Icon: Home, label: "Dashboard", href: "/dashboard" },
  { Icon: Layers, label: "Drills", href: "/drills" },
  { Icon: BarChart3, label: "Progress", href: "/progress" },
  { Icon: User, label: "Profile", href: "/profile" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden flex-col gap-9 border-r border-white/[.07] px-[22px] py-8 lg:flex">
      <div className="font-display text-[30px] font-semibold tracking-tight">
        Speako
      </div>

      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ Icon, label, href }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                "flex items-center gap-4 rounded-2xl px-3.5 py-4 text-left text-base " +
                (active
                  ? "bg-gradient-to-r from-[#f0a65c]/30 to-[#f0a65c]/10 text-white ring-1 ring-inset ring-[#f0a65c]/20"
                  : "text-[#cfc8bb] hover:bg-white/[.03]")
              }
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/[.07] pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
