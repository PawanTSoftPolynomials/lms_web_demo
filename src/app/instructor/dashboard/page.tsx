"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import CourseGridCard from "@/components/courses/CourseGridCard";
import { BookOpen } from "lucide-react";

import { AttentionList } from "@/components/dashboard/AttentionList";
import { HomeHeader } from "@/components/dashboard/HomeHeader";
import { InstructorKPIs } from "@/components/instructor/dashboard/InstructorKPIs";
import { ContinueEditingCard } from "@/components/instructor/dashboard/ContinueEditingCard";
import { RecentSubmissionsList } from "@/components/instructor/dashboard/RecentSubmissionsList";
import { RecentActivitiesSidebar } from "@/components/instructor/dashboard/RecentActivitiesSidebar";

import {
  useDashboardStats,
  useRecentActivities,
  useRecentSubmissions,
  useNeedsAttention,
  useContinueEditing,
  useMyCourses,
} from "@/hooks/queries/instructor/useDashboardHome";

/**
 * Instructor Home.
 *
 * Ordered by what an instructor actually opens this page to do, not by what is
 * easiest to measure:
 *
 *   1. Needs attention  - the work queue, severity-sorted, every row a way in
 *   2. Pick up where you left off / what students just did
 *   3. My courses       - the thing being built
 *
 * Deliberately absent: the calendar widget, the upcoming-events panel, the
 * batch-performance widget and the grade-distribution pie. All four pointed at
 * sections (Calendar, Batches, Analytics) that are commented out of
 * PRIMARY_NAV_ITEMS, so they were sending instructors toward screens the
 * product no longer navigates to. Between them they also cost five requests per
 * load, including three fired by the batch widget alone. Their components are
 * still in the tree and can be dropped back in if those sections return.
 */
export default function InstructorDashboardHomePage() {
  const { user } = useAuth();

  const stats = useDashboardStats();
  const attention = useNeedsAttention();
  const continueEditing = useContinueEditing();
  const submissions = useRecentSubmissions();
  const activities = useRecentActivities();
  const courses = useMyCourses();

  const statValue = (id: string) => Number(stats.data?.find((s) => s.id === id)?.value ?? 0);

  const totalCourses = statValue("active-courses");
  const totalStudents = statValue("students");
  const pendingReviews = statValue("pending-reviews");
  const activeQuizzes = statValue("active-quizzes");

  // Draft count drives the greeting line only; the KPI strip links to the full
  // course list where the same breakdown is shown properly.
  const draftCourses = courses.data.filter(
    (c) => !c.isPublished && c.status !== "PUBLISHED" && c.status !== "Published"
  ).length;

  return (
    <div className="flex flex-col gap-6 py-2">
      <HomeHeader
        name={user?.name}
        summary={[
          pendingReviews > 0 ? `${pendingReviews} to review` : "",
          draftCourses > 0 ? `${draftCourses} draft${draftCourses === 1 ? "" : "s"}` : "",
          totalStudents > 0 ? `${totalStudents} student${totalStudents === 1 ? "" : "s"}` : "",
        ]}
        actionLabel="New course"
        actionHref="/instructor/courses/create"
      />

      <InstructorKPIs
        coursesCount={totalCourses}
        studentsCount={totalStudents}
        pendingAssignments={pendingReviews}
        activeQuizzes={activeQuizzes}
      />

      <AttentionList
        items={attention.data}
        isLoading={attention.isLoading}
        emptyDescription="Nothing is waiting on you. Good time to build out a course."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ContinueEditingCard item={continueEditing.data} isLoading={continueEditing.isLoading} />
        <RecentSubmissionsList submissions={submissions.data} isLoading={submissions.isLoading} />
        <RecentActivitiesSidebar activities={activities.data} isLoading={activities.isLoading} />
      </div>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight text-foreground">My courses</h2>
          <Link
            href="/instructor/courses"
            className="inline-flex min-h-11 items-center shrink-0 text-sm font-medium text-link hover:text-link-hover hover:underline"
          >
            View all
          </Link>
        </div>

        {courses.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : courses.data.length === 0 ? (
          // Not <EmptyState>: its call to action is a <Button>, and this one
          // navigates rather than acting, so it is written out here as an
          // anchor in link colour instead.
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-card-border bg-card px-6 py-14 text-center">
            <BookOpen size={26} className="text-muted-foreground" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">No courses yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create your first course to start adding modules, lessons and quizzes.
            </p>
            <Link
              href="/instructor/courses/create"
              className="mt-1 text-sm font-medium text-link hover:text-link-hover hover:underline"
            >
              Create a course
            </Link>
          </div>
        ) : (
          // Same wrapper the My Courses page uses: a horizontal snap carousel
          // on mobile, a grid from md up. CourseGridCard carries carousel
          // styling of its own (w-[85%] shrink-0 snap-center), which only lays
          // out correctly inside this flex container — dropping the card into a
          // plain grid leaves every card at 85% width with a ragged gutter.
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-none [-webkit-overflow-scrolling:touch] md:grid md:snap-none md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0">
            {courses.data.slice(0, 3).map((course) => (
              <CourseGridCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
