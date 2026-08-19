"use client";

import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaBook,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";

import { useDashboard } from "@/hooks/queries/admin/useDashboard";
import {
  useCourseOverview,
  useCourseStatusPie,
  useRecentActivity,
  useUpcomingEvents,
} from "@/hooks/queries/admin/useDashboardHome";

import Loader from "@/components/common/Loader";

import { AdminKPIs } from "@/components/admin/dashboard/AdminKPIs";
import { CoursePerformanceTable } from "@/components/admin/dashboard/CoursePerformanceTable";
import { CourseStatusPieChart } from "@/components/admin/dashboard/CourseStatusPieChart";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";
import { TodaySnapshot } from "@/components/admin/dashboard/TodaySnapshot";
import { TopInstructor } from "@/components/admin/dashboard/TopInstructor";
import { UpcomingEvents } from "@/components/admin/dashboard/UpcomingEvents";
import RecentUsers from "@/components/dashboard/RecentUsers";

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
    <div className="-m-3 sm:-m-6 min-h-[calc(100vh-3.5rem)] bg-[#080B11] p-3 sm:p-6 pt-0 sm:pt-0">
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
