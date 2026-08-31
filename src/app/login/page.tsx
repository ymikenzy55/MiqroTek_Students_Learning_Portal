"use client";

import { useState } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { cn } from "@/lib/utils";

type Tab = "student" | "staff";
type StudentMode = "login" | "register";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("student");
  const [studentMode, setStudentMode] = useState<StudentMode>("login");

  const isStudent = tab === "student";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] p-4 sm:p-8">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)] shadow-sm lg:grid lg:grid-cols-2">
        {/* Right: brand panel (rendered first in DOM for z-index layering) */}
        <div className="relative hidden overflow-hidden bg-[var(--primary)] lg:flex lg:flex-col lg:justify-center lg:p-12">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full"
            style={{ background: "var(--accent)", opacity: 0.15, animation: "floatBlob 8s ease-in-out infinite" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full"
            style={{ background: "var(--accent-dark)", opacity: 0.25, animation: "floatBlob 10s ease-in-out infinite reverse" }}
          />
          <div className="relative z-10">
            <h3 className="text-3xl font-semibold leading-tight tracking-tight text-white">
              {isStudent ? "Learn. Build. Grow." : "Teach. Track. Inspire."}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              {isStudent
                ? "Access your courses, weekly topics, assessments and attendance all in one place."
                : "Manage your courses, monitor student progress and review submissions with ease."}
            </p>
            <div className="mt-10 space-y-4">
              {(isStudent
                ? ["Structured weekly learning paths", "Track assessments and grades", "Monitor your attendance"]
                : ["Create and manage courses", "Review student submissions", "Record class attendance"]
              ).map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left: form panel — slightly overlaps the brand panel on large screens */}
        <div className="relative z-10 flex flex-col justify-center rounded-2xl bg-[var(--white)] p-8 sm:p-12 lg:mr-[-2rem] lg:rounded-l-none lg:shadow-xl">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white font-bold">
              M
            </div>
            <div>
              <p className="font-semibold leading-tight text-[var(--foreground)]">Miqrotek</p>
              <p className="text-xs text-[var(--muted)]">Learning Portal</p>
            </div>
          </div>

          {/* Animated segmented tabs */}
          <div className="relative mb-8 flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
            <span
              aria-hidden
              className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-lg bg-[var(--primary)] shadow-sm transition-transform duration-300 ease-out"
              style={{ transform: isStudent ? "translateX(0)" : "translateX(100%)" }}
            />
            <button
              onClick={() => {
                setTab("student");
                setStudentMode("login");
              }}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-300",
                isStudent ? "text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.42A12 12 0 0112 21a12 12 0 01-6.16-10.42L12 14z" />
              </svg>
              Student
            </button>
            <button
              onClick={() => setTab("staff")}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-300",
                !isStudent ? "text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Instructor
            </button>
          </div>

          {/* Form content */}
          <div key={`${tab}-${studentMode}`} style={{ animation: "fadeSlideIn 260ms ease-out" }}>
            {isStudent ? (
              studentMode === "login" ? (
                <>
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    Welcome back
                  </h2>
                  <p className="mb-6 mt-1 text-sm text-[var(--muted)]">
                    Sign in to your student account
                  </p>
                  <LoginForm key="student-login" allowedRoles={["STUDENT"]} portalLabel="student" />
                  <div className="mt-5 flex flex-col gap-2 text-sm">
                    <Link
                      href="/forgot-password"
                      className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                    >
                      Forgot password?
                    </Link>
                    <p className="text-[var(--muted)]">
                      Don&apos;t have an account?{" "}
                      <button
                        onClick={() => setStudentMode("register")}
                        className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-dark)]"
                      >
                        Create one
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    Create account
                  </h2>
                  <p className="mb-6 mt-1 text-sm text-[var(--muted)]">
                    Register as a student to get started
                  </p>
                  <RegisterForm />
                  <p className="mt-5 text-sm text-[var(--muted)]">
                    Already have an account?{" "}
                    <button
                      onClick={() => setStudentMode("login")}
                      className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-dark)]"
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )
            ) : (
              <>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  Instructor sign in
                </h2>
                <p className="mb-6 mt-1 text-sm text-[var(--muted)]">
                  For instructors and administrators
                </p>
                <LoginForm
                  key="staff-login"
                  allowedRoles={["INSTRUCTOR", "SUPER_ADMIN"]}
                  portalLabel="instructor or administrator"
                />
                <div className="mt-5 flex flex-col gap-2 text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    Forgot password?
                  </Link>
                  <p className="text-xs text-[var(--muted)]">
                    Staff accounts are created by the administrator.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
