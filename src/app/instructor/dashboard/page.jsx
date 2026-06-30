"use client";

import { useEffect, useMemo, useState } from "react";
import { instructorDashboardMock } from "@/constants/instructorDashboardMock";
import { FaBook, FaLayerGroup, FaClipboardList, FaUsers } from "react-icons/fa";
import PerformanceSection from "@/components/dashboard/instructor/PerformanceSection";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import {
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import { FaArrowTrendUp } from "react-icons/fa6";
import QuickActions from "@/components/dashboard/common/QuickActions";
import ChartEmptyState from "@/components/dashboard/components/ChartEmptyState";
import StudentEngagement from "@/components/dashboard/instructor/StudentEngagement";
import WelcomeSection from "@/components/dashboard/instructor/WelcomeSection";
import StatsGrid from "@/components/dashboard/instructor/StatsGrid";
import PerformanceChart from "@/components/dashboard/instructor/PerformanceChart";
import useAuth from "@/hooks/useAuth";
import CourseTable from "@/components/dashboard/instructor/CourseTable";
import QuizTable from "@/components/dashboard/instructor/QuizTable";
import { getInstructorDashboard } from "@/services/dashboard.service";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const mockData = instructorDashboardMock;
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getInstructorDashboard();
        console.log("Dashboard:", data);
        console.log("Is Array:", Array.isArray(data));

        setDashboard(data);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const welcomeData = useMemo(
    () => ({
      name: user?.name || "Instructor",

      courseCount: dashboard?.totalCourses ?? 0,

      studentCount: dashboard?.totalStudents ?? 0,

      quizCount: dashboard?.totalQuizzes ?? 0,

      completionRate: 82, // until backend provides it
    }),
    [dashboard, user],
  );
  const stats = [
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
  ];
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

  if (loading) {
    return <LoadingOverlay />;
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

      {/* Analytics */}
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

      {/* My Courses */}
      <CourseTable courses={mockData.courses} />

      <QuizTable quizzes={mockData.quizzes} />
    </div>
  );
}
