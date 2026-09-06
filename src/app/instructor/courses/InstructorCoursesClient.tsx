"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { CourseModal } from "@/components/courses/CourseModal";
import { EditCourseModal } from "@/components/courses/EditCourseModal";
import {
  deleteCourseAction,
  toggleTopicCoveredAction,
  addWeeklyTopicAction,
  deleteWeeklyTopicAction,
} from "@/actions/course-actions";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { useSearchAndPaginate } from "@/lib/useSearchAndPaginate";
import { SearchBar, Pagination } from "@/components/ui/SearchAndPagination";

interface WeeklyTopicData {
  id: string;
  weekNumber: number;
  title: string;
  covered: boolean;
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  duration: string | null;
  image: string | null;
  highlights: string[];
  instructor: { name: string };
  _count: { weeklyTopics: number; enrollments: number };
  weeklyTopics: WeeklyTopicData[];
}

export function InstructorCoursesClient({ courses }: { courses: CourseData[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);
  const [managingTopicsFor, setManagingTopicsFor] = useState<CourseData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [, startToggle] = useTransition();
  const { showToast } = useToast();

  const { query, setQuery, page, setPage, totalPages, totalItems, paginated, pageSize } =
    useSearchAndPaginate(courses, {
      searchKeys: ["title", "description", "duration"],
      pageSize: 9,
    });

  async function handleDelete(courseId: string, title: string) {
    if (!confirm(`Are you sure you want to delete course "${title}"?`)) return;

    setDeletingId(courseId);
    const result = await deleteCourseAction(courseId);
    setDeletingId(null);

    if (result.success) {
      showToast(`Course "${title}" deleted.`, "success");
      router.refresh();
    } else {
      showToast(result.error || "Failed to delete course", "error");
    }
  }

  async function handleToggleTopic(topicId: string, currentCovered: boolean) {
    setTogglingId(topicId);
    startToggle(async () => {
      const result = await toggleTopicCoveredAction(topicId);
      setTogglingId(null);
      if (result.success) {
        showToast(
          currentCovered ? "Topic marked as not yet covered." : "Topic marked as covered!",
          "success"
        );
        // Update local state for immediate feedback
        if (managingTopicsFor) {
          setManagingTopicsFor({
            ...managingTopicsFor,
            weeklyTopics: managingTopicsFor.weeklyTopics.map((t) =>
              t.id === topicId ? { ...t, covered: !currentCovered } : t
            ),
          });
        }
      } else {
        showToast(result.error, "error");
      }
    });
  }

  async function handleAddTopic() {
    if (!managingTopicsFor || !newTopicTitle.trim()) return;
    setAddingTopic(true);
    const result = await addWeeklyTopicAction(managingTopicsFor.id, newTopicTitle);
    setAddingTopic(false);
    if (result.success && result.data) {
      showToast(`Topic "${result.data.title}" added as Week ${result.data.weekNumber}.`, "success");
      setManagingTopicsFor({
        ...managingTopicsFor,
        weeklyTopics: [
          ...managingTopicsFor.weeklyTopics,
          { id: result.data.id, weekNumber: result.data.weekNumber, title: result.data.title, covered: false },
        ],
      });
      setNewTopicTitle("");
    } else {
      showToast(result.error || "Failed to add topic.", "error");
    }
  }

  async function handleDeleteTopic(topicId: string, topicTitle: string) {
    if (!managingTopicsFor) return;
    if (!confirm(`Delete topic "${topicTitle}"?`)) return;
    setDeletingTopicId(topicId);
    const result = await deleteWeeklyTopicAction(topicId);
    setDeletingTopicId(null);
    if (result.success) {
      showToast("Topic deleted.", "success");
      setManagingTopicsFor({
        ...managingTopicsFor,
        weeklyTopics: managingTopicsFor.weeklyTopics.filter((t) => t.id !== topicId),
      });
    } else {
      showToast(result.error || "Failed to delete topic.", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">My Courses</h1>
          <p className="text-sm text-[var(--muted)]">Create and manage courses, weekly topics, and student enrollments</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <span>+ Create Course</span>
        </Button>
      </div>

      {/* Search bar */}
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search courses by title, description, or duration..."
      />

      {paginated.length === 0 ? (
        <EmptyState
          title={query ? "No courses match your search" : "No courses created yet"}
          description={query ? "Try a different search term." : "Click '+ Create Course' above to list your first course."}
        />
      ) : (
        <>
        <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((course) => (
            <div
              key={course.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)] shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Cover image */}
              <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {course.duration && (
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                    ⏱️ {course.duration}
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                  👥 {course._count.enrollments}
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-base leading-snug text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {course.title}
                </h3>

                {course.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                    {course.description}
                  </p>
                )}

                {/* Highlights */}
                {course.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {course.highlights.slice(0, 3).map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)] border border-[var(--border)]"
                      >
                        ✓ {h}
                      </span>
                    ))}
                    {course.highlights.length > 3 && (
                      <span className="text-[10px] text-[var(--muted)]">
                        +{course.highlights.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats row */}
                <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--muted)]">
                  <span>📚 {course._count.weeklyTopics} topics</span>
                  <span className="font-bold text-[var(--accent)]">
                    {course.price > 0 ? `${course.currency} ${course.price.toFixed(0)}` : "Free"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="mt-auto flex items-center gap-2 border-t border-[var(--border)] pt-3">
                  <button
                    onClick={() => setManagingTopicsFor(course)}
                    className="flex-1 rounded-lg bg-[var(--accent)]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
                  >
                    Topics
                  </button>
                  <button
                    onClick={() => setEditingCourse(course)}
                    className="flex-1 rounded-lg bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--border)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    disabled={deletingId === course.id}
                    className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          pageSize={pageSize}
        />
        </>
      )}

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          router.refresh();
        }}
      />

      {editingCourse && (
        <EditCourseModal
          isOpen={true}
          onClose={() => {
            setEditingCourse(null);
            router.refresh();
          }}
          course={editingCourse}
        />
      )}

      {/* Topic management modal */}
      {managingTopicsFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setManagingTopicsFor(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Manage Topics
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {managingTopicsFor.title} — mark topics as covered to update student progress.
                </p>
              </div>
              <button
                onClick={() => setManagingTopicsFor(null)}
                className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            {managingTopicsFor.weeklyTopics.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--muted)]">
                No weekly topics for this course yet. Add one below.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {managingTopicsFor.weeklyTopics.map((topic) => (
                  <li
                    key={topic.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Week {topic.weekNumber}: {topic.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTopic(topic.id, topic.covered)}
                        disabled={togglingId === topic.id}
                        className={cn(
                          "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                          topic.covered
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
                        )}
                      >
                        {togglingId === topic.id
                          ? "..."
                          : topic.covered
                            ? "✓ Covered"
                            : "Mark Covered"}
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id, topic.title)}
                        disabled={deletingTopicId === topic.id}
                        className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
                        title="Delete topic"
                      >
                        {deletingTopicId === topic.id ? "..." : "✕"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Add new topic */}
            <div className="mt-4 flex gap-2 border-t border-[var(--border)] pt-4">
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                placeholder="Add a new topic title..."
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleAddTopic}
                disabled={addingTopic || !newTopicTitle.trim()}
                className="shrink-0"
              >
                {addingTopic ? "Adding..." : "+ Add"}
              </Button>
            </div>

            <div className="mt-4 flex justify-end border-t border-[var(--border)] pt-4">
              <Button variant="outline" onClick={() => setManagingTopicsFor(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
