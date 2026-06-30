"use client";

import { useEffect, useMemo, useState } from "react";

import {
  FaBook,
  FaLayerGroup,
  FaClipboardList,
  FaUsers,
} from "react-icons/fa";

import LoadingOverlay from "@/components/common/LoadingOverlay";

import QuickActions from "@/components/dashboard/common/QuickActions";
import ChartEmptyState from "@/components/dashboard/components/ChartEmptyState";

import WelcomeSection from "@/components/dashboard/instructor/WelcomeSection";
import StatsGrid from "@/components/dashboard/instructor/StatsGrid";

import useAuth from "@/hooks/useAuth";

import { getInstructorDashboard } from "@/services/dashboard.service";

export default function InstructorDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getInstructorDashboard();
        setDashboard(data);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Courses",
        value: dashboard?.totalCourses ?? 0,
        icon: <FaBook />,
        iconBgClass: "bg-violet-500/20",
      },
      {
        title: "Modules",
        value: dashboard?.totalModules ?? 0,
        icon: <FaLayerGroup />,
        iconBgClass: "bg-blue-500/20",
      },
      {
        title: "Students",
        value: dashboard?.totalStudents ?? "--",
        icon: <FaUsers />,
        iconBgClass: "bg-emerald-500/20",
      },
      {
        title: "Quizzes",
        value: dashboard?.totalQuizzes ?? "--",
        icon: <FaClipboardList />,
        iconBgClass: "bg-orange-500/20",
      },
    ],
    [dashboard]
  );

  const welcomeData = useMemo(
    () => ({
      name: user?.name || "Instructor",
      courseCount: dashboard?.totalCourses ?? 0,
      studentCount: dashboard?.totalStudents ?? 0,
      quizCount: dashboard?.totalQuizzes ?? 0,
      completionRate: 0,
    }),
    [dashboard, user]
  );

  const quickActions = [
    {
      id: 1,
      label: "Create Course",
      href: "/instructor/courses/create",
      icon: <FaBook />,
      iconBgClass: "bg-violet-500/10 text-violet-400",
    },
    {
      id: 2,
      label: "Create Module",
      href: "/instructor/modules/create",
      icon: <FaLayerGroup />,
      iconBgClass: "bg-blue-500/10 text-blue-400",
    },
    {
      id: 3,
      label: "Create Quiz",
      href: "/instructor/quizzes/create",
      icon: <FaClipboardList />,
      iconBgClass: "bg-emerald-500/10 text-emerald-400",
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

      <StatsGrid stats={stats} />

      <QuickActions actions={quickActions} />

      {/* Analytics */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartEmptyState
            title="Performance Analytics"
            description="Performance statistics will appear here once the backend dashboard analytics are available."
          />
        </div>

        <div>
          <ChartEmptyState
            title="Student Engagement"
            description="Student engagement insights will be available soon."
          />
        </div>
      </div>

      {/* My Courses */}
      <ChartEmptyState
        title="My Courses"
        description="Manage your courses and modules from here. This section will be connected to the backend in the next update."
      />

      {/* Quizzes */}
      <ChartEmptyState
        title="Quizzes"
        description="Manage your quizzes and questions from here. This section will be connected to the backend in the next update."
      />
    </div>
  );
}