"use client";

import Loader from "@/components/common/Loader";
import EmptyState from "@/components/student/EmptyState";
import CourseCard from "@/components/student/CourseCard";

import useCourses from "@/hooks/queries/student/useCourses";

export default function StudentCourses() {
  const { data: courses = [], isLoading, error } = useCourses();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Something went wrong"
        description="Unable to load courses."
      />
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
