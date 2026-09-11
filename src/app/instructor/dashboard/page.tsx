"use client";

import dynamic from "next/dynamic";
import { TooltipProvider } from "@/components/ui/shadcn/tooltip";

// import { WelcomeHeroCard } from "@/components/instructor/dashboard/WelcomeHeroCard";
import { InstructorKPIs } from "@/components/instructor/dashboard/InstructorKPIs";
import { CourseOverviewTable } from "@/components/instructor/dashboard/CourseOverviewTable";
import { RecentSubmissionsList } from "@/components/instructor/dashboard/RecentSubmissionsList";
import { DashboardCalendarWidget } from "@/components/instructor/dashboard/DashboardCalendarWidget";
import { RecentActivitiesSidebar } from "@/components/instructor/dashboard/RecentActivitiesSidebar";

import {
  useDashboardStats,
  useCourseProgressOverview,
  useRecentActivities,
  useRecentSubmissions,
  useGradeDistribution,
} from "@/hooks/queries/instructor/useDashboardHome";

// Dynamically imported so recharts is bundled once via this shared
// dynamic() boundary instead of duplicated into this route's own chunk.
const PerformancePieChart = dynamic(
  () => import("@/components/instructor/dashboard/PerformancePieChart").then((m) => m.PerformancePieChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse bg-muted/50 rounded-2xl" /> }
);

export default function InstructorDashboardHomePage() {
  // Data fetching.
  // useNeedsAttention / useAnnouncementsFeed / useMyLessonQueries were called
  // here but their results were never read by any JSX below. Between them they
  // cost three requests per dashboard load — including GET /modules, which
  // returns every module -> lesson -> topic for all of the instructor's courses
  // with no pagination, making it the heaviest payload on the page.
  const stats = useDashboardStats();
  const courses = useCourseProgressOverview();
  const activities = useRecentActivities();
  const submissions = useRecentSubmissions();
  const grades = useGradeDistribution();

  // Extract needed KPIs from the stats payload
  const totalCourses = stats.data?.find(s => s.id === "active-courses")?.value || 0;
  const totalStudents = stats.data?.find(s => s.id === "students")?.value || 0;
  const pendingReviews = stats.data?.find(s => s.id === "pending-reviews")?.value || 0;
  const activeQuizzes = stats.data?.find(s => s.id === "active-quizzes")?.value || 0;

  return (
    <TooltipProvider>
      {/* ============================= UNIFIED RESPONSIVE LAYOUT ============================= */}
      {/* Horizontal bleed matches the layout's padding (p-2 / sm:p-6 /
          md:p-16); -mx-4 and sm:-mx-12 overshot it and scrolled the page
          sideways on phones and small tablets. */}
      <div className="-m-3 sm:-m-6 sm:-mt-12 md:-mt-16 -mx-2 sm:-mx-6 md:-mx-16 min-h-[calc(100vh-3.5rem)] bg-background p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="flex flex-col max-w-[1600px] mx-auto">

          <div className="mt-4 sm:mt-[3.2px] mb-[1.6px]">
            <InstructorKPIs
              coursesCount={Number(totalCourses)}
              studentsCount={Number(totalStudents)}
              pendingAssignments={Number(pendingReviews)}
              activeQuizzes={Number(activeQuizzes)}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-[4.8px] mt-4 xl:mt-[3.2px]">
            {/* Left Main Column (occupies 8/12 on large screens) */}
            <div className="xl:col-span-8 flex flex-col gap-4 xl:gap-[4.8px]">
              {/* <WelcomeHeroCard instructorName={user?.name || "Instructor"} /> */}

              <CourseOverviewTable
                courses={courses.data}
                isLoading={courses.isLoading}
              />

              {/* Bottom Row inside Main Column */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-[4.8px]">
                <RecentSubmissionsList
                  submissions={submissions.data}
                  isLoading={submissions.isLoading}
                />
                <PerformancePieChart
                  data={grades.data}
                  isLoading={grades.isLoading}
                />
              </div>
            </div>

            {/* Right Sidebar Column (occupies 4/12 on large screens) */}
            <div className="xl:col-span-4 flex flex-col gap-4 xl:gap-[4.8px]">
              <DashboardCalendarWidget />

              <RecentActivitiesSidebar
                activities={activities.data || []}
                isLoading={activities.isLoading}
              />
            </div>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}
