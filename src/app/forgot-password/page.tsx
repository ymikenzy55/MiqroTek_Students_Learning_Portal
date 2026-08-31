"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResetUrl(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const errorMsg = data.error || "Something went wrong";
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }

    setSuccess("Reset link generated! Check below to reset your password.");
    showToast("Reset link generated successfully", "success");
    if (data.resetUrl) {
      setResetUrl(data.resetUrl);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-white font-bold text-xl">
            M
          </div>
          <h1 className="mt-3 text-2xl font-bold text-[var(--foreground)]">Miqrotek</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Student Learning Portal</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--white)] p-6">
          <h2 className="mb-1 text-xl font-semibold text-[var(--foreground)]">Forgot password</h2>
          <p className="mb-6 text-sm text-[var(--muted)]">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 px-4 py-3 text-sm text-[var(--success)]">
              {success}
              {resetUrl && (
                <div className="mt-3">
                  <p className="text-xs text-[var(--muted)] mb-1">Dev mode — reset link:</p>
                  <Link
                    href={resetUrl}
                    className="text-sm text-[var(--accent)] hover:text-[var(--accent-dark)] underline break-all"
                  >
                    {resetUrl}
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--accent)] hover:text-[var(--accent-dark)]"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
