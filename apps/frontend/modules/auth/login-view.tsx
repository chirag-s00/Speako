"use client";
import { useRouter } from "next/navigation";
import { login } from "./components/login";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Mic } from "lucide-react";

import { Button } from "@speako/ui/components/button";
import { Input } from "@speako/ui/components/input";
import { Label } from "@speako/ui/components/label";
import { Separator } from "@speako/ui/components/separator";

const BAR_HEIGHTS = [10, 22, 14, 30, 18, 26, 12];

function Waveform({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-[3px] ${className}`}
      aria-hidden="true"
    >
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          style={{ height: h }}
          className="w-[3px] rounded-full bg-gradient-to-b from-[#f0a064] to-[#c8622a]"
        />
      ))}
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-12 rounded-xl border-white/10 bg-white/[0.03] pl-11 text-sm text-white placeholder:text-zinc-500 focus-visible:border-[#e8884a]/60 focus-visible:ring-[#e8884a]/30";

  const socialClass =
    "h-12 w-full gap-3 rounded-xl border-white/10 bg-white/[0.03] text-sm font-medium text-white hover:bg-white/[0.07] hover:text-white";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080c0a] p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d1311] shadow-2xl shadow-black/60 lg:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col">
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#e8884a]/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#e8884a]/10 blur-2xl" />

          <Link
            href="/"
            className="relative z-10 mt-6 flex flex-col items-center"
          >
            <Waveform className="mb-2 scale-125" />
            <span className="font-serif text-3xl font-semibold tracking-tight text-[#f0a064]">
              Speako
            </span>
          </Link>

          <div className="relative z-10 mt-12">
            <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight">
              Speak. Improve. Grow.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-400">
              Build real speaking skills with AI. Anytime, anywhere.
            </p>
          </div>

          <div className="relative z-10 mt-auto flex items-end gap-4 pt-10">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#e8884a]/40 bg-gradient-to-b from-[#e8884a]/20 to-transparent shadow-[0_0_40px_rgba(232,136,74,0.25)]">
              <Mic className="h-10 w-10 text-[#f0a064]" strokeWidth={1.5} />
            </div>
            <Waveform className="mb-6" />
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center bg-[#111815] px-6 py-10 sm:px-10">
          <div className="w-full">
            <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <Waveform />
              <span className="font-serif text-2xl font-semibold text-[#f0a064]">
                Unprompted
              </span>
            </Link>

            <div className="mb-7">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-zinc-400">
                Log in to continue your speaking journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Label htmlFor="login-email" className="sr-only">
                  Email address
                </Label>
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="relative">
                <Label htmlFor="login-password" className="sr-only">
                  Password
                </Label>
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded accent-[#e8884a]"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#f0a064] hover:text-[#ffb87f]"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-[#d9773c] to-[#f0a064] font-medium text-[#1a0f08] shadow-lg shadow-[#e8884a]/20 hover:from-[#e2834a] hover:to-[#f5ab70] disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Log in"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <Separator className="flex-1 bg-white/10" />
              <span className="text-xs text-zinc-500">or continue with</span>
              <Separator className="flex-1 bg-white/10" />
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className={socialClass}
                onClick={() => {
                  // Connect Google OAuth here.
                }}
              >
                <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C44.42 37.93 46.98 31.77 46.98 24.55Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                  />
                </svg>
                Continue with Google
              </Button>

            </div>

            <p className="mt-7 text-center text-xs text-zinc-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#f0a064] hover:text-[#ffb87f]"
              >
                Register
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
