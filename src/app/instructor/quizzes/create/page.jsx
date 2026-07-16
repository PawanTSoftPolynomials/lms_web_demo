"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";

export default function CreateQuizSelectCoursePage() {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useInstructorCourses();

  const handleContinue = (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    router.push(`/instructor/quizzes/create/${selectedCourseId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="mx-auto max-w-md mt-10">
        <div className="py-12 text-center">
          <h2 className="text-xl font-bold text-white">Failed to Load Courses</h2>
          <p className="mt-2 text-slate-400">Please try again later.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto mt-10">
      <Link
        href="/instructor/quizzes"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={14} />
        Back to Quizzes
      </Link>

      <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
            <Folder size={22} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Select Course</h3>
          <p className="text-xs text-slate-400">
            Please choose a course under which you want to create the new quiz.
          </p>
        </div>

        <form onSubmit={handleContinue} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Course List
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none transition px-4 py-3.5 text-sm cursor-pointer"
              required
            >
              <option value="" disabled>Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={!selectedCourseId}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-sm font-extrabold py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continue to Quiz Details</span>
            <ArrowRight size={16} />
          </Button>
        </form>
      </Card>
    </div>
  );
}
