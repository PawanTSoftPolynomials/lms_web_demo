"use client";

import { useEffect, useState } from "react";

import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import LoadingOverlay from "@/components/common/LoadingOverlay";

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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const courses = await getCourses();
        console.log("COURSES", courses);

        const modules = await getModules();
        console.log("MODULES", modules);

        const quizzes = await getQuizzes();
        console.log("QUIZZES", quizzes);

        const questions = await getQuestions();
        console.log("QUESTIONS", questions);

        setStats({
          courses: courses.length,
          modules: modules.length,
          quizzes: quizzes.length,
          questions: questions.length,
        });
      } catch (error) {
        console.log(error.response);
        console.log(error);
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
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-white">Instructor Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6">
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
    </div>
  );
}
