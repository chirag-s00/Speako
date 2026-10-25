"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  RefreshCw,
} from "lucide-react";
import { getProfile } from "./lib/fetchProfile";
import { type Profile } from "@speako/common/common";



export function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError(null);

      const user = await getProfile();
    
      setProfile(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-w-0 p-6 text-[#efe9df] sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-white/10" />
          <div className="h-40 rounded-2xl bg-white/[0.04]" />
          <div className="h-24 rounded-2xl bg-white/[0.04]" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-w-0 p-6 text-[#efe9df] sm:p-8">
        <h1 className="text-3xl font-[family-name:var(--font-fraunces)]">
          Your profile
        </h1>

        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
          <p className="text-sm text-red-300">
            {error ?? "Profile not found."}
          </p>

          <button
            type="button"
            onClick={() => void fetchProfile()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/[0.05]"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  const initials = profile.username.trim().slice(0, 2).toUpperCase();


  return (
    <main className="min-w-0 space-y-8 p-6 text-[#efe9df] sm:p-8">
      <header>
        <p className="text-sm tracking-[0.2em] text-[#f0a65c]">YOUR ACCOUNT</p>

        <h1 className="mt-2 text-3xl font-[family-name:var(--font-fraunces)] sm:text-4xl">
          Profile
        </h1>

        {/* <p className="mt-2 text-sm text-white/50">
          Manage your account information and view your account details.
        </p> */}
      </header>

      {/* Profile overview */}
      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-[#f0a65c]/20 bg-[#f0a65c]/10 text-2xl font-semibold text-[#f0a65c]">
            {initials || <UserRound size={30} />}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="break-words text-2xl font-semibold">
              {profile.username}
            </h2>

            <p className="mt-1 break-all text-sm text-white/50">
              {profile.email}
            </p>
          </div>
        </div>
      </section>

      {/* Account information */}
      <section>
        <h2 className="mb-4 text-xl font-medium">Account information</h2>

        <div className="divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5">
          <ProfileField
            icon={<UserRound size={18} />}
            label="Username"
            value={profile.username}
          />

          <ProfileField
            icon={<Mail size={18} />}
            label="Email address"
            value={profile.email}
          />

        </div>
      </section>
    </main>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[#f0a65c]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/40">{label}</p>
        <p className="mt-1 break-words text-sm">{value}</p>
      </div>
    </div>
  );
}
