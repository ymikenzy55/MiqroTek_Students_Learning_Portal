"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service to register.");
      return;
    }
    if (!agreedToPrivacy) {
      setError("You must agree to the Privacy Policy to register.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created! Please log in.");
      showToast("Account created! Please log in.", "info");
      return;
    }

    showToast("Account created successfully!", "success");
    router.push("/student");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}
      <Input label="Full name" name="name" placeholder="John Doe" required />
      <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
      <Input label="Phone number" name="phone" type="tel" placeholder="+233 123 456 789" />
      <Input label="Password" name="password" type="password" placeholder="••••••••" required />
      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        required
      />

      {/* Consent checkboxes */}
      <div className="space-y-2.5 pt-2">
        <label className="flex items-start gap-2.5 text-xs text-[var(--muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--accent)]"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="font-medium text-[var(--accent)] hover:underline">
              Terms of Service
            </Link>
          </span>
        </label>
        <label className="flex items-start gap-2.5 text-xs text-[var(--muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToPrivacy}
            onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--accent)]"
          />
          <span>
            I agree to the{" "}
            <Link href="/privacy" target="_blank" className="font-medium text-[var(--accent)] hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !agreedToTerms || !agreedToPrivacy}
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
