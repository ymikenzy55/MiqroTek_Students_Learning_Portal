"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/States";
import { CourseCard } from "@/components/courses/CourseCard";
import { useSearchAndPaginate } from "@/lib/useSearchAndPaginate";
import { SearchBar, Pagination } from "@/components/ui/SearchAndPagination";

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  duration: string | null;
  image: string | null;
  instructor: { name: string };
  _count: { weeklyTopics: number };
  pricingType: string;
  trialDays: number;
  registrationDeadline: string | null;
  allowPartialPayment: boolean;
  minimumPayment: number | null;
}

interface EnrollmentData {
  courseId: string;
  payment: { status: string } | null;
}

export function StudentCoursesClient({
  courses,
  enrollments,
}: {
  courses: CourseData[];
  enrollments: EnrollmentData[];
}) {
  const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]));
  const myCourses = courses.filter((c) => enrollmentMap.has(c.id));
  const availableCourses = courses.filter((c) => !enrollmentMap.has(c.id));

  return (
    <div className="space-y-8">
      {/* Registered Courses */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          My Registered Courses
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">({myCourses.length})</span>
        </h2>
        {myCourses.length === 0 ? (
          <EmptyState
            title="No courses registered"
            description="Explore available courses below and enroll to get started."
          />
        ) : (
          <CourseListWithSearch
            courses={myCourses}
            enrollmentMap={enrollmentMap}
            enrolled={true}
            searchPlaceholder="Search your courses by title, instructor, or duration..."
            pageSize={6}
          />
        )}
      </section>

      {/* Available Courses */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
          Available Courses
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
            ({availableCourses.length})
          </span>
        </h2>
        {availableCourses.length === 0 ? (
          <EmptyState
            title="No additional courses available"
            description="You are currently enrolled in all available courses."
          />
        ) : (
          <CourseListWithSearch
            courses={availableCourses}
            enrollmentMap={enrollmentMap}
            enrolled={false}
            searchPlaceholder="Search available courses by title, instructor, or duration..."
            pageSize={6}
          />
        )}
      </section>
    </div>
  );
}

function CourseListWithSearch({
  courses,
  enrollmentMap,
  enrolled,
  searchPlaceholder,
  pageSize,
}: {
  courses: CourseData[];
  enrollmentMap: Map<string, EnrollmentData>;
  enrolled: boolean;
  searchPlaceholder: string;
  pageSize: number;
}) {
  const { query, setQuery, page, setPage, totalPages, totalItems, paginated, pageSize: ps } =
    useSearchAndPaginate(courses, {
      searchKeys: ["title", "duration", "description"],
      pageSize,
    });

  return (
    <div className="space-y-4">
      <SearchBar value={query} onChange={setQuery} placeholder={searchPlaceholder} />

      {paginated.length === 0 ? (
        <EmptyState
          title={query ? "No courses match your search" : "No courses found"}
          description={query ? "Try a different search term." : ""}
        />
      ) : (
        <>
          <div className="stagger grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((course) => {
              const enr = enrollmentMap.get(course.id);
              const isPaid = enr?.payment?.status === "PAID" || course.price === 0;

              return (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  instructorName={course.instructor.name}
                  price={course.price}
                  currency={course.currency}
                  duration={course.duration}
                  image={course.image}
                  topicCount={course._count.weeklyTopics}
                  enrolled={enrolled}
                  pricingType={course.pricingType}
                  trialDays={course.trialDays}
                  allowPartialPayment={course.allowPartialPayment}
                  minimumPayment={course.minimumPayment}
                  action={
                    enrolled ? (
                      <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
                        <span
                          className={`text-xs font-bold ${
                            isPaid
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600"
                          }`}
                        >
                          {isPaid ? "✅ Paid & Active" : "⚠️ Payment Pending"}
                        </span>
                        <Link
                          href={`/student/courses/${course.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-dark)] transition-colors"
                        >
                          {isPaid ? "View Topics & Progress →" : "Pay & View Topics →"}
                        </Link>
                      </div>
                    ) : (
                      <div className="border-t border-[var(--border)] pt-3 text-right">
                        <Link
                          href={`/student/courses/${course.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-dark)] transition-colors"
                        >
                          {course.pricingType === "FREE_TRIAL"
                            ? `Start Free ${course.trialDays}-Day Trial →`
                            : course.price === 0
                              ? "Enroll for Free →"
                              : "View Details & Enroll →"}
                        </Link>
                      </div>
                    )
                  }
                />
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
            pageSize={ps}
          />
        </>
      )}
    </div>
  );
}
