"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutSession } from "./lib/logoutSession";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await logoutSession();

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while logging out.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="flex w-full items-center gap-4 rounded-2xl px-3.5 py-4 text-left text-base text-[#cfc8bb] transition-colors duration-200 hover:bg-red-400/[.06] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut size={20} />
        <span>{loading ? "Logging out..." : "Log out"}</span>
      </button>

      {error && (
        <p role="alert" className="mt-2 px-3.5 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
