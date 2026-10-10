"use client";

import { useRouter } from "next/navigation";
import {register} from "./components/register";
import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Mic2, Check } from "lucide-react";

import { Button } from "@speako/ui/components/button";
import { Input } from "@speako/ui/components/input";
import { Label } from "@speako/ui/components/label";
import { Separator } from "@speako/ui/components/separator";
import { Checkbox } from "@speako/ui/components/checkbox";

export default function RegisterForm() {

    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
          
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");

        if (!acceptedTerms) {
          setError("Please accept the Terms of Service and Privacy Policy.");
          return;
        }

        if (password.length < 6) {
          setError("Your password must contain at least 6 characters.");
          return;
        }

  
        setLoading(true);
    
        try {
            await register({ email, password, username: name });
            router.push("/");
        }catch (err) {
            setError(
            err instanceof Error ? err.message : "Registration failed"
            );
      } finally {
        setLoading(false);
      }


  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Branding panel */}
      <section className="relative hidden overflow-hidden bg-violet-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />

        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Mic2 className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">speako</span>
        </Link>

        <div className="relative z-10 mx-auto max-w-md">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-300" />
            Your speaking journey starts here
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Every great speaker
            <br />
            starts somewhere.
          </h1>

          <p className="mt-6 text-lg leading-8 text-violet-100">
            Build your confidence one drill at a time. Practice speaking,
            discover your strengths, and become a better communicator.
          </p>

          <div className="mt-10 space-y-5">
            {[
              "Practice with engaging speaking drills",
              "Get feedback on fluency and pacing",
              "Track your progress over time",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-sm text-violet-50">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-violet-200">
          Your voice. Your pace. Your progress.
        </p>
      </section>

      {/* Registration form */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Mic2 className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900">
              speako
            </span>
          </Link>

          <div className="mb-7">
            <p className="mb-3 text-sm font-medium text-violet-600">
              GET STARTED FOR FREE
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Join Speako and start building your speaking confidence.
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
            Sign up with Google
          </Button>

          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-zinc-400">OR SIGN UP WITH EMAIL</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Full name</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border-zinc-200 focus-visible:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email address</Label>
              <Input
                id="register-email"
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
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
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
              <p className="text-xs text-zinc-400">
                Use at least 8 characters.
              </p>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="terms"
                className="cursor-pointer text-sm font-normal leading-5 text-zinc-500"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-violet-600 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-violet-600 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={!acceptedTerms || loading}
              className="h-11 w-full rounded-xl bg-violet-600 font-medium hover:bg-violet-700"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
