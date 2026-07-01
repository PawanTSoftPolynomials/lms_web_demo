"use client";

import { useMemo } from "react";

import { instructorDashboardMock } from "@/constants/instructorDashboardMock";

import { FaBook, FaClipboardList } from "react-icons/fa";
import {
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import { FaArrowTrendUp } from "react-icons/fa6";

import LoadingOverlay from "@/components/common/LoadingOverlay";
import QuickActions from "@/components/dashboard/common/QuickActions";
import WelcomeSection from "@/components/dashboard/instructor/WelcomeSection";
import PerformanceSection from "@/components/dashboard/instructor/PerformanceSection";
import StudentEngagement from "@/components/dashboard/instructor/StudentEngagement";
import CourseTable from "@/components/dashboard/instructor/CourseTable";
import QuizTable from "@/components/dashboard/instructor/QuizTable";

import useAuth from "@/hooks/useAuth";
import { useInstructorDashboard } from "@/hooks/queries/instructor/useInstructorDashboard";

export default function InstructorDashboard() {
  const { user } = useAuth();

  const mockData = instructorDashboardMock;

  const {
    data: dashboard,
    isLoading,
    isError,
  } = useInstructorDashboard();

  const welcomeData = useMemo(
      () => ({
        name: user?.name || "Instructor",

        courseCount: dashboard?.totalCourses ?? 0,

        studentCount: dashboard?.totalStudents ?? 0,

        quizCount: dashboard?.totalQuizzes ?? 0,

        // Mock until backend supports it
        completionRate: 82,
      }),
      [dashboard, user],
  );

  const stats = useMemo(
      () => [
        {
          title: "Courses",
          value: dashboard?.totalCourses ?? 0,
          subtitle: `${dashboard?.publishedCourses ?? 0} Published`,
          icon: HiOutlineBookOpen,
          color: "violet",
        },
        {
          title: "Students",
          value: dashboard?.totalStudents ?? 0,
          subtitle: "Enrolled Students",
          icon: HiOutlineUsers,
          color: "blue",
        },
        {
          title: "Quizzes",
          value: dashboard?.totalQuizzes ?? 0,
          subtitle: "Available Quizzes",
          icon: HiOutlineAcademicCap,
          color: "emerald",
        },
        {
          title: "Completion",
          value: "82%",
          subtitle: "Average Progress",
          icon: FaArrowTrendUp,
          color: "orange",
        },
      ],
      [dashboard],
  );

  const quickActions = [
    {
      id: 1,
      title: "Create Course",
      description: "Start a new course",
      href: "/instructor/courses/create",
      icon: FaBook,
      color: "violet",
    },
    {
      id: 2,
      title: "Create Quiz",
      description: "Build assessments",
      href: "/instructor/quizzes/create",
      icon: FaClipboardList,
      color: "emerald",
    },
    {
      id: 3,
      title: "My Courses",
      description: "Manage your courses",
      href: "/instructor/courses",
      icon: HiOutlineBookOpen,
      color: "blue",
    },
  ];

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isError) {
    return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          Failed to load dashboard.
        </div>
    );
  }

  return (
      <div className="space-y-8">
        <WelcomeSection
            name={welcomeData.name}
            courseCount={welcomeData.courseCount}
            studentCount={welcomeData.studentCount}
            quizCount={welcomeData.quizCount}
            completionRate={welcomeData.completionRate}
        />

        {/* <StatsGrid stats={stats} /> */}

        <QuickActions actions={quickActions} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <PerformanceSection
                data={mockData.performance}
                students={dashboard?.totalStudents ?? 0}
                courses={dashboard?.totalCourses ?? 0}
                quizzes={dashboard?.totalQuizzes ?? 0}
                completion={82}
            />
          </div>

          <div>
            <StudentEngagement
                activeStudents={mockData.engagement.active}
                inactiveStudents={mockData.engagement.inactive}
            />
          </div>
        </div>

        <CourseTable courses={mockData.courses} />

        <QuizTable quizzes={mockData.quizzes} />
      </div>
  );
}