"use client";

import Loader from "@/components/common/Loader";
import MyCourseCard from "@/components/student/MyCourseCard";

import useAuth from "@/hooks/useAuth";
import useMyCourses from "@/hooks/queries/students/useMyCourses";

export default function MyCourses() {
  const { user, loading: authLoading } = useAuth();

  const {
    data: courses = [],
    isLoading,
    error,
  } = useMyCourses(user?.id);

  if (authLoading || isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-red-400">
        Failed to load your courses.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          My Courses
        </h1>

        <p className="text-slate-400 mt-2">
          Continue your enrolled courses.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-xl text-center">
          No enrolled courses found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((enrollment) => (
            <MyCourseCard
              key={enrollment.id}
              enrollment={enrollment}
            />
          ))}
        </div>
      )}
    </div>
  );
}