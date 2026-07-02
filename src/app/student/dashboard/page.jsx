"use client";

import { useEffect, useState } from "react";

import StatCard from "@/components/students/StatCard";
import CourseCard from "@/components/students/CourseCard";

import { getStudentDashboard } from "@/services/dashboard.service";

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getStudentDashboard();
        const data = response.data;

        setDashboard(data.stats);

        const formattedCourses = data.enrolledCoursesList.map((item) => ({
          id: item.course.id,
          title: item.course.title,
          instructor: item.course.instructor,
          category: item.course.category,
          progress: item.progress,
          completedLessons: item.completedLessons,
          lessons: item.course.lessons,
        }));

        setCourses(formattedCourses);
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>

        <p className="text-gray-400 mt-2">Continue your learning journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Enrolled Courses"
          value={dashboard?.enrolledCourses || 0}
        />

        <StatCard
          title="Completed Lessons"
          value={dashboard?.completedLessons || 0}
        />

        <StatCard title="Certificates" value={dashboard?.certificates || 0} />

        <StatCard
          title="Completion Rate"
          value={`${dashboard?.completionRate || 0}%`}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">
          Continue Learning
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <p className="text-gray-400">No enrolled courses found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
