"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      portal,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError((result.code && PORTAL_MISMATCH_MESSAGES[result.code]) || GENERIC_ERROR);
      return;
    }

    // Fetch the session to determine where the signed-in user belongs
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role as Role | undefined;
    const name = session?.user?.name;

    if (role !== "STUDENT" && role !== "SUPER_ADMIN") {
      await signOut({ redirect: false });
      setLoading(false);
      setError(GENERIC_ERROR);
      return;
    }

    setLoading(false);
    showToast(`Welcome back${name ? ", " + name : ""}!`, "success");

    // Super admins act as instructors and can also reach /admin from there.
    router.push(role === "STUDENT" ? "/student" : "/instructor");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
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
    </form>
  );
}
