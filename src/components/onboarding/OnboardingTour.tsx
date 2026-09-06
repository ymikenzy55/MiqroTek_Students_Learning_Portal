"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Step {
  title: string;
  description: string;
  icon: string;
}

const STUDENT_STEPS: Step[] = [
  {
    title: "Welcome to Miqrotek!",
    description: "Let's take a quick tour to help you get started. This will only take a minute.",
    icon: "👋",
  },
  {
    title: "Browse Courses",
    description: "Head to 'My Courses' to see courses you're enrolled in, or 'Available Courses' to discover new ones and enroll.",
    icon: "📚",
  },
  {
    title: "Track Your Progress",
    description: "Open any course to see weekly topics. As your instructor marks topics as covered, your progress bar will update automatically.",
    icon: "📊",
  },
  {
    title: "Take Assessments",
    description: "Visit the 'Assessments' tab to view and submit assignments. Your instructor will grade them and provide feedback.",
    icon: "✍️",
  },
  {
    title: "Mark Attendance",
    description: "Check the 'Attendance' tab to see your attendance record across all courses.",
    icon: "📅",
  },
  {
    title: "Message Your Instructor",
    description: "Use the 'Messages' tab to chat directly with your instructors. You'll get real-time notifications when they reply.",
    icon: "💬",
  },
  {
    title: "You're All Set!",
    description: "That's it! Explore the dashboard and start learning. You can dismiss this tour anytime — it won't show again.",
    icon: "🎉",
  },
];

const INSTRUCTOR_STEPS: Step[] = [
  {
    title: "Welcome, Instructor!",
    description: "Let's take a quick tour of your instructor dashboard. This will only take a minute.",
    icon: "👋",
  },
  {
    title: "Create Courses",
    description: "Head to 'Courses' and click '+ Create Course' to build a course step by step — basics, pricing, cover image, highlights, and optional weekly topics.",
    icon: "📚",
  },
  {
    title: "Manage Students",
    description: "Visit 'Students' to see everyone enrolled in your courses. You can suspend, promote, or remove students as needed.",
    icon: "👥",
  },
  {
    title: "Track Attendance",
    description: "Use the 'Attendance' tab to create sessions and mark students Present, Late, or Absent.",
    icon: "📅",
  },
  {
    title: "Create Assessments",
    description: "Visit 'Assessments' to create quizzes and assignments, then review and grade student submissions.",
    icon: "✍️",
  },
  {
    title: "Message Students",
    description: "Use 'Messages' to chat with individual students or send announcements to all enrolled students at once.",
    icon: "💬",
  },
  {
    title: "You're All Set!",
    description: "That's it! You can manage everything from this dashboard. This tour won't show again.",
    icon: "🎉",
  },
];

interface OnboardingTourProps {
  role: "STUDENT" | "SUPER_ADMIN";
}

export function OnboardingTour({ role }: OnboardingTourProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const steps = role === "STUDENT" ? STUDENT_STEPS : INSTRUCTOR_STEPS;
  const storageKey = `miqrotek-onboarding-${role}`;

  useEffect(() => {
    // Only show if the user hasn't seen it before
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      // Small delay so the dashboard loads first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  function handleClose() {
    localStorage.setItem(storageKey, "seen");
    setVisible(false);
  }

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  }

  function handleSkip() {
    handleClose();
  }

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl"
        style={{ animation: "fadeSlideIn 200ms ease-out" }}
      >
        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === step
                  ? "w-6 bg-[var(--accent)]"
                  : idx < step
                    ? "w-1.5 bg-emerald-500"
                    : "w-1.5 bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="mb-4 text-4xl">{current.icon}</div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">{current.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{current.description}</p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-between">
          {!isLast ? (
            <button
              onClick={handleSkip}
              className="text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Skip tour
            </button>
          ) : (
            <span />
          )}
          <Button onClick={handleNext}>
            {isLast ? "Get started" : "Next →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
