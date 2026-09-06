"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createAssessmentAction, gradeSubmissionAction } from "@/actions/assessment-actions";

interface AssessmentItem {
  id: string;
  title: string;
  instructions: string | null;
  totalMarks: number;
  type: string;
  createdAt: Date;
  course: { title: string };
  submissions: {
    id: string;
    score: number | null;
    feedback: string | null;
    status: string;
    submittedAt: Date;
    user: { name: string; email: string };
  }[];
}

interface CourseItem {
  id: string;
  title: string;
}

export function InstructorAssessmentsClient({
  assessments,
  courses,
}: {
  assessments: AssessmentItem[];
  courses: CourseItem[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleCreateAssignment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createAssessmentAction(formData);
    setLoading(false);

    if (result.success) {
      showToast("Assignment created successfully!", "success");
      setIsModalOpen(false);
    } else {
      showToast(result.error || "Failed to create assignment", "error");
    }
  }

  async function handleGradeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!gradingSubmission) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const score = parseFloat(formData.get("score") as string) || 0;
    const feedback = formData.get("feedback") as string || "";

    const result = await gradeSubmissionAction(gradingSubmission.id, score, feedback);
    setLoading(false);

    if (result.success) {
      showToast("Submission graded successfully!", "success");
      setGradingSubmission(null);
    } else {
      showToast(result.error || "Failed to grade submission", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Assignments & Submissions</h1>
          <p className="text-sm text-[var(--muted)]">Create course assignments and review student submissions</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <span>+ Create Assignment</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Assignments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Active Assignments</h2>
          {assessments.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-8 text-center text-sm text-[var(--muted)]">
              No assignments created yet. Click &quot;+ Create Assignment&quot; to assign tasks to your students.
            </div>
          ) : (
            assessments.map((ass) => (
              <div key={ass.id} className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)] mb-1">
                      {ass.course.title}
                    </span>
                    <h3 className="font-semibold text-[var(--foreground)]">{ass.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-[var(--muted)]">Total: {ass.totalMarks} marks</span>
                </div>
                {ass.instructions && <p className="mt-2 text-xs text-[var(--muted)]">{ass.instructions}</p>}
                <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                  <span>📥 {ass.submissions.length} Submissions</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Submissions to Grade */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Student Submissions</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 shadow-xs space-y-4">
            {assessments.flatMap((a) => a.submissions).length === 0 ? (
              <p className="text-center text-sm text-[var(--muted)] py-6">No student submissions received yet.</p>
            ) : (
              assessments.flatMap((a) =>
                a.submissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div>
                      <p className="font-semibold text-sm text-[var(--foreground)]">{sub.user.name}</p>
                      <p className="text-xs text-[var(--muted)]">{sub.user.email}</p>
                      {sub.score !== null ? (
                        <span className="inline-block mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Grade: {sub.score} marks ({sub.feedback})
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Pending Review
                        </span>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => setGradingSubmission(sub)}>
                      {sub.score !== null ? "Re-grade" : "Grade"}
                    </Button>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal to Create Assignment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">New Course Assignment</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Course</label>
                <select name="courseId" required className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:outline-none">
                  <option value="">Select course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <Input label="Assignment Title" name="title" placeholder="e.g. Building a Responsive Web Application" required />

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Instructions / Description</label>
                <textarea name="instructions" rows={3} placeholder="Detailed instructions for students..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:outline-none" />
              </div>

              <Input label="Total Marks" name="totalMarks" type="number" defaultValue="100" required />

              <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to Grade Submission */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">Grade Submission</h3>
              <button onClick={() => setGradingSubmission(null)} className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <p className="text-sm font-medium text-[var(--foreground)]">
                Student: <span className="text-[var(--accent)]">{gradingSubmission.user.name}</span> ({gradingSubmission.user.email})
              </p>

              <Input label="Score / Marks" name="score" type="number" step="0.5" defaultValue={gradingSubmission.score || "90"} required />

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Feedback / Notes</label>
                <textarea name="feedback" rows={3} defaultValue={gradingSubmission.feedback || "Good work!"} placeholder="Provide feedback to the student..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:outline-none" />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <Button type="button" variant="outline" onClick={() => setGradingSubmission(null)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving Grade..." : "Submit Grade"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
