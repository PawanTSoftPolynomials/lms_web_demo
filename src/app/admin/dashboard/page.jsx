"use client";

import dynamic from "next/dynamic";
import {
  
} from "react-icons/fa";

import { useDashboard } from "@/hooks/queries/admin/useDashboard";
import {
  useCourseStatusPie,
  useRecentActivity,
  useUpcomingEvents,
} from "@/hooks/queries/admin/useDashboardHome";

import Loader from "@/components/common/Loader";

import { AdminKPIs } from "@/components/admin/dashboard/AdminKPIs";
import { CoursePerformanceTable } from "@/components/admin/dashboard/CoursePerformanceTable";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";
import { TodaySnapshot } from "@/components/admin/dashboard/TodaySnapshot";
import { TopInstructor } from "@/components/admin/dashboard/TopInstructor";
import { UpcomingEvents } from "@/components/admin/dashboard/UpcomingEvents";
import RecentUsers from "@/components/dashboard/RecentUsers";

// Dynamically imported so recharts is bundled once via this shared
// dynamic() boundary instead of duplicated into this route's own chunk.
const CourseStatusPieChart = dynamic(
  () => import("@/components/admin/dashboard/CourseStatusPieChart").then((m) => m.CourseStatusPieChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse bg-muted/50 rounded-2xl" /> }
);

export default function AdminDashboard() {
  const { data: dashboard, isLoading, isError } = useDashboard();

  const coursePie = useCourseStatusPie(dashboard?.publishedCourses, dashboard?.draftCourses);
  const recentActivity = useRecentActivity();
  const upcomingEvents = useUpcomingEvents();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="py-24 text-center text-red-500">
        Failed to load dashboard.
      </div>
    );
  }

  return (
    <div className="-m-3 sm:-m-6 min-h-[calc(100vh-3.5rem)] bg-background p-3 sm:p-6 pt-0 sm:pt-0">
      <div className="flex flex-col gap-6 max-w-[1600px] mx-auto mt-4">
        <AdminKPIs
          coursesCount={dashboard.totalCourses}
          studentsCount={dashboard.totalStudents}
          instructorsCount={dashboard.totalInstructors}
          enrollmentsCount={dashboard.totalEnrollments}
          usersCount={dashboard.totalUsers}
          trends={dashboard.trends}
        />

        <CoursePerformanceTable
          courses={dashboard.coursePerformance}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TodaySnapshot snapshot={dashboard.todaySnapshot} />
          <TopInstructor instructor={dashboard.topInstructor} />
          <UpcomingEvents
            events={upcomingEvents.data}
            isLoading={upcomingEvents.isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CourseStatusPieChart data={coursePie} />
          <RecentActivityFeed
            activity={recentActivity.data}
            isLoading={recentActivity.isLoading}
          />
          <RecentUsers users={dashboard.recentUsers} />
        </div>
      </div>
    </div>
  );
}
