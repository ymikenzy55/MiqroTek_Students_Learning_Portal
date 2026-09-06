"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { Portal, Role } from "@/types";

const GENERIC_ERROR = "Invalid email or password";

const PORTAL_MISMATCH_MESSAGES: Record<string, string> = {
  student_account:
    "That account is registered as a student. Switch to the Student tab to sign in.",
  staff_account:
    "That account is registered as an instructor. Switch to the Instructor tab to sign in.",
};

interface LoginFormProps {
  portal: Portal;
}

export function LoginForm({ portal }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Show error from Google sign-in redirect (e.g. staff_google_blocked)
  const googleError = searchParams.get("error");
  const googleErrorMessage =
    googleError === "staff_google_blocked"
      ? "That Google account belongs to an instructor. Please sign in with your email and password on the Instructor tab."
      : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log(`🔐 Login attempt: ${email} (Portal: ${portal})`);

    const result = await signIn("credentials", {
      email,
      password,
      portal,
      redirect: false,
    });

    if (result?.error) {
      console.error("❌ Login failed:", result.error, result.code);
      setLoading(false);
      setError((result.code && PORTAL_MISMATCH_MESSAGES[result.code]) || GENERIC_ERROR);
      return;
    }

    // Fetch the session to determine where the signed-in user belongs
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role as Role | undefined;
    const name = session?.user?.name;

    console.log(`✅ Session retrieved - Role: ${role}, Name: ${name}`);

    if (role !== "STUDENT" && role !== "SUPER_ADMIN") {
      console.warn(`⚠️ Unexpected role on session: ${role}`);
      await signOut({ redirect: false });
      setLoading(false);
      setError(GENERIC_ERROR);
      return;
    }

    setLoading(false);
    showToast(`Welcome back${name ? ", " + name : ""}!`, "success");

    console.log(`✅ Redirecting to dashboard: ${role}`);

    // Super admins act as instructors and can also reach /admin from there.
    router.push(role === "STUDENT" ? "/student" : "/instructor");
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    // Full-page redirect to Google OAuth, then back to the student dashboard
    await signIn("google", { callbackUrl: "/student" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || googleErrorMessage) && (
        <div className="rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-4 py-3 text-sm text-[var(--danger)]">
          {error || googleErrorMessage}
        </div>
      )}
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      {/* Google OAuth — students only */}
      {portal === "student" && (
        <>
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--white)] px-3 text-xs text-[var(--muted)]">
                or
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>
        </>
      )}
    </form>
  );
}
