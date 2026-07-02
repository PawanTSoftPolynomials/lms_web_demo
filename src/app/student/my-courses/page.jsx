"use client";

import { useEffect, useState } from "react";

import CourseCard from "@/components/students/CourseCard";
import { getStudentDashboard } from "@/services/dashboard.service";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await getStudentDashboard();
        const data = response.data;

        const formattedCourses =
          data.enrolledCoursesList.map((item) => ({
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
        console.error("My courses fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="text-white">
        Loading my courses...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          My Courses
        </h1>

        <p className="text-gray-400 mt-2">
          Continue where you left off.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))
        ) : (
          <p className="text-gray-400">
            No enrolled courses found.
          </p>
        )}
      </div>
    </div>
  );
}