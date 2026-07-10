"use client";

import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaBook,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";

import { useDashboard } from "@/hooks/queries/admin/useDashboard";

import Loader from "@/components/common/Loader";

import DashboardHeader from "@/components/dashboard/common/DashboardHeader";
import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import CourseStatusChart from "@/components/dashboard/CourseStatusChart";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentUsers from "@/components/dashboard/RecentUsers";
import MiniCalendar from "@/components/dashboard/MiniCalendar";

export default function AdminDashboard() {
  const router = useRouter();

  const { data: dashboard, isLoading, isError } = useDashboard();

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

  const analyticsData = [
    {
      name: "Users",
      value: dashboard.totalUsers,
    },
    {
      name: "Students",
      value: dashboard.totalStudents,
    },
    {
      name: "Instructors",
      value: dashboard.totalInstructors,
    },
    {
      name: "Courses",
      value: dashboard.totalCourses,
    },
    {
      name: "Enrollments",
      value: dashboard.totalEnrollments,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Section: DashboardHeader & MiniCalendar side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        <div className="lg:col-span-3">
          <DashboardHeader name="Admin" />
        </div>
        <div className="lg:col-span-1">
          <MiniCalendar role="ADMIN" />
        </div>
      </div>

      {/* KPI Stats Counters (perfectly aligned in 5 columns) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <DashboardStatCard
          title="Total Users"
          value={dashboard.totalUsers}
          icon={<FaUsers />}
          onClick={() => router.push("/admin/users")}
        />

        <DashboardStatCard
          title="Courses"
          value={dashboard.totalCourses}
          icon={<FaBook />}
          onClick={() => router.push("/admin/courses")}
        />

        <DashboardStatCard
          title="Students"
          value={dashboard.totalStudents}
          icon={<FaUserGraduate />}
          onClick={() => router.push("/admin/students")}
        />

        <DashboardStatCard
          title="Instructors"
          value={dashboard.totalInstructors}
          icon={<FaChalkboardTeacher />}
          onClick={() => router.push("/admin/instructors")}
        />

        <DashboardStatCard
          title="Enrollments"
          value={dashboard.totalEnrollments}
          icon={<FaUsers />}
          onClick={() => router.push("/admin/enrollments")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsChart title="Platform Overview" data={analyticsData} />

        <CourseStatusChart
          publishedCourses={dashboard.publishedCourses}
          draftCourses={dashboard.draftCourses}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <QuickActions />

        <div className="lg:col-span-2">
          <RecentUsers users={dashboard.recentUsers} />
        </div>
      </div>
    </div>
  );
}
