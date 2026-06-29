"use client";

import { useEffect, useMemo, useState } from "react";

import { FaBook, FaLayerGroup, FaClipboardList, FaUsers } from "react-icons/fa";

import LoadingOverlay from "@/components/common/LoadingOverlay";

import DashboardHeader from "@/components/dashboard/common/DashboardHeader";
import QuickActions from "@/components/dashboard/common/QuickActions";
import RecentActivity from "@/components/dashboard/common/RecentActivity";

import WelcomeSection from "@/components/dashboard/instructor/WelcomeSection";
import StatsGrid from "@/components/dashboard/instructor/StatsGrid";
import PerformanceChart from "@/components/dashboard/instructor/PerformanceChart";
import StudentEngagement from "@/components/dashboard/instructor/StudentEngagement";
import TopCourses from "@/components/dashboard/instructor/TopCourses";
import RecentQuizzes from "@/components/dashboard/instructor/RecentQuizzes";

import LatestCourses from "@/components/dashboard/LatestCourses";
import CourseStatusChart from "@/components/dashboard/CourseStatusChart";

import ChartEmptyState from "@/components/dashboard/components/ChartEmptyState";

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
        value: dashboard?.totalStudents ?? 0,
        icon: <FaUsers />,
        iconBgClass: "bg-emerald-500/20",
      },
      {
        title: "Quizzes",
        value: dashboard?.totalQuizzes ?? 0,
        icon: <FaClipboardList />,
        iconBgClass: "bg-orange-500/20",
      },
    ],
    [dashboard],
  );

  const welcomeData = useMemo(
    () => ({
      name: user?.name || "Instructor",
      courseCount: dashboard?.totalCourses ?? 0,
      studentCount: dashboard?.totalStudents ?? 0,
      quizCount: dashboard?.totalQuizzes ?? 0,
      completionRate: 0,
    }),
    [dashboard, user],
  );

  const courseStatus = useMemo(
    () => [
      {
        name: "Published",
        value: dashboard?.publishedCourses ?? 0,
      },
      {
        name: "Draft",
        value: dashboard?.draftCourses ?? 0,
      },
      {
        name: "Archived",
        value: 0,
      },
    ],
    [dashboard],
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
      <DashboardHeader
        title="Instructor Dashboard"
        subtitle="Manage your courses, students and learning content"
      />

      <WelcomeSection
        name={welcomeData.name}
        courseCount={welcomeData.courseCount}
        studentCount={welcomeData.studentCount}
        quizCount={welcomeData.quizCount}
        completionRate={welcomeData.completionRate}
      />

      <StatsGrid stats={stats} />

      {/* Analytics */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartEmptyState
            title="Performance Analytics"
            description="Performance statistics will appear here once the backend dashboard analytics are available."
          />

          {/* Replace with:
          <PerformanceChart data={dashboard.performance} />
          */}
        </div>

        <div>
          <ChartEmptyState
            title="Student Engagement"
            description="Student engagement insights will be available soon."
          />

          {/* Replace with:
          <StudentEngagement
            activeStudents={dashboard.studentEngagement.active}
            completedStudents={dashboard.studentEngagement.completed}
            inactiveStudents={dashboard.studentEngagement.inactive}
          />
          */}
        </div>
      </div>

      {/* Course Widgets */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartEmptyState
          title="Top Courses"
          description="Top performing courses will appear here when supported by the backend."
        />

        <ChartEmptyState
          title="Recent Activity"
          description="Recent instructor activity will appear here."
        />

        {/*
        Future:

        <TopCourses courses={dashboard.topCourses} />

        <RecentActivity
          activities={dashboard.recentActivity}
        />
        */}
      </div>

      {/* Bottom Widgets */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <ChartEmptyState
            title="Recent Quizzes"
            description="Recent quizzes will appear here once the dashboard API is extended."
          />

          {/*
          Future:

          <RecentQuizzes
            quizzes={dashboard.recentQuizzes}
          />
          */}
        </div>

        <div>
          <CourseStatusChart
            courses={[
              ...Array(dashboard?.publishedCourses ?? 0).fill({
                status: "PUBLISHED",
              }),

              ...Array(dashboard?.draftCourses ?? 0).fill({
                status: "DRAFT",
              }),
            ]}
          />
        </div>
      </div>

      {/* Latest Courses */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <ChartEmptyState
            title="Latest Courses"
            description="Latest instructor courses will be available when supported by the dashboard endpoint."
          />

          {/*
          Future:

          <LatestCourses
            courses={dashboard.latestCourses}
          />
          */}
        </div>

        <QuickActions actions={quickActions} />
      </div>
    </div>
  );
}
