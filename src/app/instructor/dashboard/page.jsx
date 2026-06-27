"use client";

import { useEffect, useMemo, useState } from "react";

import {
  FaBook,
  FaLayerGroup,
  FaClipboardList,
  FaQuestionCircle,
  FaUsers,
} from "react-icons/fa";

import LoadingOverlay from "@/components/common/LoadingOverlay";
import DashboardHeader from "@/components/dashboard/common/DashboardHeader";
import WelcomeSection from "@/components/dashboard/instructor/WelcomeSection";
import StatsGrid from "@/components/dashboard/instructor/StatsGrid";
import PerformanceChart from "@/components/dashboard/instructor/PerformanceChart";
import StudentEngagement from "@/components/dashboard/instructor/StudentEngagement";
import TopCourses from "@/components/dashboard/instructor/TopCourses";

import RecentActivity from "@/components/dashboard/common/RecentActivity";
import QuickActions from "@/components/dashboard/common/QuickActions";

import RecentQuizzes from "@/components/dashboard/instructor/RecentQuizzes";
import UpcomingDeadlines from "@/components/dashboard/instructor/UpcomingDeadlines";
import Announcements from "@/components/dashboard/instructor/Announcements";

import { getCourses } from "@/services/course.service";
import { getModules } from "@/services/module.service";
import { getQuizzes } from "@/services/quiz.service";
import { getQuestions } from "@/services/question.service";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
export default function InstructorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const performanceData = [
    { name: "Jan", students: 12, courses: 2 },
    { name: "Feb", students: 20, courses: 3 },
    { name: "Mar", students: 35, courses: 4 },
    { name: "Apr", students: 48, courses: 6 },
    { name: "May", students: 64, courses: 8 },
    { name: "Jun", students: 82, courses: 10 },
  ];

  const engagement = {
    active: 148,
    completed: 64,
    inactive: 18,
  };

  const recentActivity = [
    {
      id: 1,
      icon: <FaBook />,
      iconBgClass: "bg-violet-500/10 text-violet-400",
      title: "Course Published",
      description: "Java Spring Boot",
      time: "2 hours ago",
    },
    {
      id: 2,
      icon: <FaUsers />,
      iconBgClass: "bg-blue-500/10 text-blue-400",
      title: "12 New Students",
      description: "React Masterclass",
      time: "Yesterday",
    },
  ];

  const announcements = [
    {
      id: 1,
      title: "Platform Maintenance",
      description: "Scheduled maintenance this weekend.",
      createdAt: "Today",
    },
    {
      id: 2,
      title: "New Quiz Features",
      description: "Timed quizzes are now available.",
      createdAt: "Yesterday",
    },
  ];

  const deadlines = [
    {
      id: 1,
      title: "Assignment 1",
      course: "Java",
      dueDate: "Tomorrow",
      daysLeft: 1,
      pendingStudents: 12,
    },
    {
      id: 2,
      title: "React Project",
      course: "React",
      dueDate: "Friday",
      daysLeft: 3,
      pendingStudents: 8,
    },
  ];

  const quickActions = [
    {
      id: 1,
      label: "Create Course",
      icon: <FaBook />,
      href: "/instructor/courses/create",
      iconBgClass: "bg-violet-500/10 text-violet-400",
    },
    {
      id: 2,
      label: "Create Quiz",
      icon: <FaClipboardList />,
      href: "/instructor/quizzes/create",
      iconBgClass: "bg-emerald-500/10 text-emerald-400",
    },
    {
      id: 3,
      label: "Modules",
      icon: <FaLayerGroup />,
      href: "/instructor/modules",
      iconBgClass: "bg-blue-500/10 text-blue-400",
    },
    {
      id: 4,
      label: "Questions",
      icon: <FaQuestionCircle />,
      href: "/instructor/questions",
      iconBgClass: "bg-orange-500/10 text-orange-400",
    },
  ];

  // { dcdffd}
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [courseData, moduleData, quizData, questionData] =
          await Promise.all([
            getCourses(),
            getModules(),
            getQuizzes(),
            getQuestions(),
          ]);

        setCourses(courseData || []);
        setModules(moduleData || []);
        setQuizzes(quizData || []);
        setQuestions(questionData || []);
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
        value: courses.length,
        icon: <FaBook />,
        iconBgClass: "bg-violet-500/20",
        trend: 2,
        trendLabel: "this month",

        onClick: () => router.push("/instructor/courses"),
      },
      {
        title: "Modules",
        value: modules.length,
        icon: <FaLayerGroup />,
        iconBgClass: "bg-blue-500/20",
        trend: 6,
        trendLabel: "new",
        onClick: () => {},
      },
      {
        title: "Quizzes",
        value: quizzes.length,
        icon: <FaClipboardList />,
        iconBgClass: "bg-emerald-500/20",
        trend: 3,
        trendLabel: "published",
        onClick: () => {},
      },
      {
        title: "Questions",
        value: questions.length,
        icon: <FaQuestionCircle />,
        iconBgClass: "bg-orange-500/20",
        trend: 12,
        trendLabel: "added",
        onClick: () => {},
      },
    ],
    [courses, modules, quizzes, questions],
  );

  const topCourses = useMemo(() => {
    return courses.slice(0, 5).map((course, index) => ({
      id: course.id,
      title: course.title,
      students: 20 + index * 8,
      progress: 65 + index * 6,
    }));
  }, [courses]);

  const recentQuizzes = useMemo(() => {
    return quizzes.slice(0, 5).map((quiz, index) => ({
      id: quiz.id,
      title: quiz.title,
      questions: 10 + index * 5,
      attempts: 25 + index * 11,
      createdAt: "2 days ago",
    }));
  }, [quizzes]);

  const welcomeData = useMemo(
    () => ({
      name: user.name,
      courseCount: courses.length,
      studentCount: topCourses.reduce(
        (sum, course) => sum + course.students,
        0,
      ),
      quizCount: quizzes.length,
      completionRate: 84,
    }),
    [courses, quizzes, topCourses],
  );
  const engagementData = {
    activeStudents: engagement.active,
    completedStudents: engagement.completed,
    inactiveStudents: engagement.inactive,
  };
  const performance = performanceData;
  const header = useMemo(
    () => ({
      title: "Instructor Dashboard",
      subtitle: "Manage your courses, quizzes and students",
    }),
    [],
  );

  if (loading) {
    return <LoadingOverlay />;
  }
  return (
    <div className="space-y-8">
      <DashboardHeader title={header.title} subtitle={header.subtitle} />

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
          <PerformanceChart data={performance} />
        </div>

        <StudentEngagement
          activeStudents={engagementData.activeStudents}
          completedStudents={engagementData.completedStudents}
          inactiveStudents={engagementData.inactiveStudents}
        />
      </div>

      {/* Courses + Activity */}
      <div className="grid gap-6 xl:grid-cols-2">
        <TopCourses courses={topCourses} />

        <RecentActivity activities={recentActivity} />
      </div>

      {/* Bottom Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentQuizzes quizzes={recentQuizzes} />

        <UpcomingDeadlines deadlines={deadlines} />

        <Announcements announcements={announcements} />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
    </div>
  );
}
