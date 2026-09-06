import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = await params;
  const session = await auth();
  const instructorId = session?.user?.id;

  if (!instructorId) {
    notFound();
  }

  // Only load the student if they are enrolled in at least one of this
  // instructor's courses — prevents id-based enumeration.
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: studentId,
      course: { instructorId },
    },
    select: { id: true },
  });

  if (!enrollment) {
    notFound();
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      studentProfile: { select: { bio: true, avatarUrl: true } },
      enrollments: {
        where: { course: { instructorId } },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              duration: true,
              price: true,
              currency: true,
            },
          },
          payment: { select: { status: true, amount: true, reference: true } },
        },
      },
      submissions: {
        where: { assessment: { course: { instructorId } } },
        include: {
          assessment: {
            select: { id: true, title: true, course: { select: { title: true } } },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: 20,
      },
      attendanceRecords: {
        where: { session: { course: { instructorId } } },
        include: {
          session: {
            select: { id: true, date: true, course: { select: { title: true } } },
          },
        },
        orderBy: { session: { date: "desc" } },
        take: 20,
      },
    },
  });

  if (!student) {
    notFound();
  }

  const presentCount = student.attendanceRecords.filter(
    (r) => r.status === "PRESENT"
  ).length;
  const lateCount = student.attendanceRecords.filter(
    (r) => r.status === "LATE"
  ).length;
  const attendanceRate =
    student.attendanceRecords.length > 0
      ? Math.round(
          ((presentCount + lateCount * 0.5) / student.attendanceRecords.length) * 100
        )
      : 0;

  const initials = student.name.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/instructor/students"
          className="text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Back to Students
        </Link>
      </div>

      <PageHeader
        title={student.name}
        description="Student overview, enrollments, submissions, and attendance."
      />

      {/* Identity card */}
      <Card>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-2xl font-bold text-[var(--accent)] overflow-hidden">
            {student.image || student.studentProfile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.image || student.studentProfile?.avatarUrl || ""}
                alt={student.name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">{student.name}</h2>
            <p className="text-sm text-[var(--muted)]">{student.email}</p>
            <p className="text-sm text-[var(--muted)]">
              Phone: {student.phone || "N/A"}
            </p>
            <p className="text-xs text-[var(--muted)]">
              Joined {new Date(student.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={`/instructor/messages?to=${student.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
            >
              Message Student
            </Link>
          </div>
        </div>
        {student.studentProfile?.bio && (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Bio</p>
            <p className="mt-1 text-sm text-[var(--foreground)]">{student.studentProfile.bio}</p>
          </div>
        )}
      </Card>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled Courses" value={student.enrollments.length} />
        <StatCard label="Submissions" value={student.submissions.length} />
        <StatCard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
        />
        <StatCard
          label="Sessions Attended"
          value={`${presentCount}/${student.attendanceRecords.length}`}
        />
      </div>

      {/* Enrolled courses */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
          Enrolled Courses
        </h3>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)]">
          {student.enrollments.length === 0 ? (
            <p className="p-6 text-center text-sm text-[var(--muted)]">
              No enrollments in your courses.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase font-semibold text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {student.enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-[var(--surface)]/50">
                    <td className="px-5 py-3 font-medium text-[var(--foreground)]">
                      {e.course.title}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)]">
                      {e.course.duration || "—"}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)]">
                      {e.course.currency} {e.course.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          e.payment?.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {e.payment?.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Recent submissions */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
          Recent Submissions
        </h3>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)]">
          {student.submissions.length === 0 ? (
            <p className="p-6 text-center text-sm text-[var(--muted)]">
              No submissions yet.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {student.submissions.map((s) => (
                <li key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {s.assessment.title}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {s.assessment.course.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        s.status === "GRADED"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-[var(--surface)] text-[var(--muted)]"
                      }`}
                    >
                      {s.status}
                    </span>
                    {s.score != null && (
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        Score: {s.score}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Attendance history */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
          Attendance History
        </h3>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)]">
          {student.attendanceRecords.length === 0 ? (
            <p className="p-6 text-center text-sm text-[var(--muted)]">
              No attendance records yet.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {student.attendanceRecords.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {r.session.course.title}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(r.session.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.status === "PRESENT"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : r.status === "LATE"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
