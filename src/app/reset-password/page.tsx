"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please request a new reset link.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      showToast("Passwords do not match", "error");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      showToast("Password must be at least 6 characters", "error");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const errorMsg = data.error || "Something went wrong";
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }

    setSuccess(true);
    showToast("Password reset successfully", "success");
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
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success)]/10">
                <svg className="h-6 w-6 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[var(--foreground)]">Password reset</h2>
              <p className="mb-6 text-sm text-[var(--muted)]">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link href="/login">
                <Button className="w-full">Back to login</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-xl font-semibold text-[var(--foreground)]">Reset password</h2>
              <p className="mb-6 text-sm text-[var(--muted)]">Enter your new password below.</p>

              {error && (
                <div className="mb-4 rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-4 py-3 text-sm text-[var(--danger)]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="New password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                  required
                  disabled={!token}
                />
                <Input
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  disabled={!token}
                />
                <Button type="submit" className="w-full" disabled={loading || !token}>
                  {loading ? "Resetting..." : "Reset password"}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-[var(--muted)]">
                <Link href="/login" className="font-medium text-[var(--accent)] hover:text-[var(--accent-dark)]">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]"><p className="text-[var(--muted)]">Loading...</p></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
