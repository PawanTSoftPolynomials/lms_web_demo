"use client";

import { useEffect, useState } from "react";

import ProgressCard from "@/components/students/ProgressCard";
import { getStudentDashboard } from "@/services/dashboardService";

export default function ProgressPage() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await getStudentDashboard();
        const data = response.data;

        setStats(data.stats);

        const formattedCourses =
          data.enrolledCoursesList.map((item) => ({
            id: item.course.id,
            title: item.course.title,
            instructor: item.course.instructor,
            progress: item.progress,
          }));

        setCourses(formattedCourses);
      } catch (error) {
        console.error("Progress fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="text-white">
        Loading progress...
      </div>
    );
  }

  const totalProgress =
    stats?.completionRate || 0;

  const completedCourses =
    courses.filter(
      (course) => course.progress === 100
    ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Learning Progress
        </h1>

        <p className="text-gray-400 mt-2">
          Track your course completion.
        </p>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-xl font-bold">
          Overall Progress
        </h2>

        <div className="mt-4">
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div
              className="bg-orange-500 h-4 rounded-full"
              style={{
                width: `${totalProgress}%`,
              }}
            />
          </div>

          <p className="mt-3 text-orange-400 text-lg font-bold">
            {totalProgress}% Completed
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.length > 0 ? (
          courses.map((course) => (
            <ProgressCard
              key={course.id}
              course={course}
            />
          ))
        ) : (
          <p className="text-gray-400">
            No progress available.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-slate-900 p-6 rounded-xl">
          <h2 className="text-xl font-bold">
            Courses Completed
          </h2>

          <p className="text-4xl text-green-500 mt-4">
            {completedCourses}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2 className="text-xl font-bold">
            Certificates Earned
          </h2>

          <p className="text-4xl text-orange-500 mt-4">
            {stats?.certificates || 0}
          </p>
        </div>
      </div>
    </div>
  );
}