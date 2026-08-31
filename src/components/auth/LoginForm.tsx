"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

type Role = "STUDENT" | "INSTRUCTOR" | "SUPER_ADMIN";

interface LoginFormProps {
  allowedRoles?: Role[];
  portalLabel?: string;
}

export function LoginForm({ allowedRoles, portalLabel }: LoginFormProps) {
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
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password");
      showToast("Invalid email or password", "error");
      return;
    }

    // Fetch the session to determine the signed-in role
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role as Role | undefined;
    const name = session?.user?.name;

    // Enforce the portal the user chose matches their actual role
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
      const msg = `This account is not a ${portalLabel ?? "valid"} account. Please use the correct sign-in tab.`;
      setError(msg);
      showToast(msg, "error");
      await signOut({ redirect: false });
      setLoading(false);
      return;
    }

    setLoading(false);
    showToast(`Welcome back${name ? ", " + name : ""}!`, "success");

    if (role === "STUDENT") router.push("/student");
    else if (role === "INSTRUCTOR") router.push("/instructor");
    else if (role === "SUPER_ADMIN") router.push("/admin");
    else router.push("/login");
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
