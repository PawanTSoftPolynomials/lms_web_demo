"use client";

import { useEffect, useState } from "react";

import { getCourses } from "@/services/course.service";

import Loader from "@/components/common/Loader";
import EmptyState from "@/components/student/EmptyState";
import CourseCard from "@/components/student/CourseCard";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();

        setCourses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Browse Courses</h1>

        <p className="text-slate-400 mt-2">Explore available courses.</p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="No Courses Found"
          description="No courses are available right now."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              href={`/student/courses/${course.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
