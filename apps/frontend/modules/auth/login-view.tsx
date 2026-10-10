"use client";
import { useRouter } from "next/navigation";
import {login} from "./components/login";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Mic2, MessageCircle } from "lucide-react";

import { Button } from "@speako/ui/components/button";
import { Input } from "@speako/ui/components/input";
import { Label } from "@speako/ui/components/label";
import { Separator } from "@speako/ui/components/separator";

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);



    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setLoading(true);

    try {
        await login({ email, password });
        router.push("/");
    }catch (err) {
        setError(
        err instanceof Error ? err.message : "Login failed"
        );
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Left branding panel */}
      <section className="relative hidden overflow-hidden bg-violet-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />

        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Mic2 className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">speako</span>
        </Link>

        <div className="relative z-10 mx-auto max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">Your daily speaking practice</p>
              <p className="text-sm text-violet-100">One drill at a time.</p>
            </div>
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Find your voice.
            <br />
            Speak with confidence.
          </h1>

          <p className="mt-6 text-lg leading-8 text-violet-100">
            Practice real conversations, improve your fluency, and turn every
            spoken word into progress.
          </p>

          <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm leading-6 text-violet-50">
              "The more you speak, the more confident you become. Your next
              breakthrough starts with one conversation."
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Mic2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">
                Your journey starts here
              </span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-violet-200">
          Practice a little. Improve every day.
        </p>
      </section>

      {/* Login form */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Mic2 className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900">
              speako
            </span>
          </Link>

          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-violet-600">
              WELCOME BACK
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Log in to Speako
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Ready to practice? Pick up where you left off.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-3 rounded-xl border-zinc-200"
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

          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-zinc-400">
              OR CONTINUE WITH EMAIL
            </span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-zinc-200 focus-visible:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-zinc-200 pr-11 focus-visible:ring-violet-500"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-violet-600 font-medium hover:bg-violet-700"
            >
              {loading ? "Logging in..." : "Log in"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-5 text-zinc-400">
            By continuing, you agree to Speako's Terms of Service and Privacy
            Policy.
          </p>
        </div>
      </section>
    </main>
  );
}