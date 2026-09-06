"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

function evaluatePassword(password: string): StrengthResult {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length === 0) {
    return { score: 0, label: "", color: "", suggestions: [] };
  }

  // Length checks
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  else if (password.length > 0) suggestions.push("Use at least 10 characters");

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (varietyCount >= 2) score++;
  if (varietyCount >= 3) score++;
  if (varietyCount === 4) score = Math.min(score + 1, 4);

  if (!hasUpper) suggestions.push("Add uppercase letters");
  if (!hasNumber) suggestions.push("Add numbers");
  if (!hasSpecial) suggestions.push("Add special characters (!@#$)");

  // Common password penalty
  const common = ["password", "123456", "qwerty", "abc123", "letmein"];
  if (common.some((c) => password.toLowerCase().includes(c))) {
    score = Math.max(0, score - 2);
    suggestions.unshift("Avoid common passwords");
  }

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-rose-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-lime-500",
    "bg-emerald-500",
  ];

  const clampedScore = Math.min(Math.max(score, 0), 4);

  return {
    score: clampedScore,
    label: labels[clampedScore],
    color: colors[clampedScore],
    suggestions: suggestions.slice(0, 3),
  };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const result = useMemo(() => evaluatePassword(password), [password]);

  if (password.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < result.score ? result.color : "bg-[var(--border)]"
            )}
          />
        ))}
      </div>

      {/* Label + suggestions */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium",
            result.score <= 1
              ? "text-rose-500"
              : result.score === 2
                ? "text-amber-500"
                : result.score === 3
                  ? "text-lime-600"
                  : "text-emerald-600"
          )}
        >
          {result.label}
        </span>
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 && result.score < 4 && (
        <ul className="space-y-0.5">
          {result.suggestions.map((s, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span className="text-amber-500">⚠</span>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
