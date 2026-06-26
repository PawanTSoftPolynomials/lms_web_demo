"use client";

import { useEffect, useState } from "react";

import LoadingOverlay from "@/components/common/LoadingOverlay";

import WelcomeSection from "@/components/dashboard/WelcomeSection";
import DashboardSection from "@/components/dashboard/DashboardSection";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RecentList from "@/components/dashboard/RecentList";

import {
  FaBook,
  FaLayerGroup,
  FaClipboardList,
  FaQuestionCircle,
} from "react-icons/fa";

import { getCourses } from "@/services/course.service";
import { getModules } from "@/services/module.service";
import { getQuizzes } from "@/services/quiz.service";
import { getQuestions } from "@/services/question.service";

export default function InstructorDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    courses: 0,
    modules: 0,
    quizzes: 0,
    questions: 0,
  });

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const courseData = await getCourses();

        const moduleData = await getModules();

        const quizData = await getQuizzes();

        const questionData = await getQuestions();

        setCourses(courseData);
        setModules(moduleData);
        setQuizzes(quizData);
        setQuestions(questionData);

        setStats({
          courses: courseData.length,
          modules: moduleData.length,
          quizzes: quizData.length,
          questions: questionData.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <WelcomeSection />

      {/* Statistics */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardStatCard
          title="Courses"
          value={stats.courses}
          icon={FaBook}
          href="/instructor/courses"
        />

        <DashboardStatCard
          title="Modules"
          value={stats.modules}
          icon={FaLayerGroup}
          href="/instructor/modules"
        />

        <DashboardStatCard
          title="Quizzes"
          value={stats.quizzes}
          icon={FaClipboardList}
          href="/instructor/quizzes"
        />

        <DashboardStatCard
          title="Questions"
          value={stats.questions}
          icon={FaQuestionCircle}
          href="/instructor/questions"
        />
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DashboardSection title="Recent Activity" subtitle="Latest updates">
            <RecentActivity />
          </DashboardSection>
        </div>

        <div className="lg:col-span-2">
          <DashboardSection title="Quick Actions" subtitle="Shortcuts">
            <QuickActions />
          </DashboardSection>
        </div>
      </div>
      {/* Courses & Quizzes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardSection title="Recent Courses">
          <RecentList items={courses} field="title" />
        </DashboardSection>

        <DashboardSection title="Recent Quizzes">
          <RecentList items={quizzes} field="title" />
        </DashboardSection>
      </div>
    </div>
  );
}
