"use client";

import PageHeader from "@/components/layouts/PageHeader";
import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import CourseCard from "@/components/student/courses/CourseCard";

import useDashboard from "@/hooks/queries/student/useDashboard";

export default function MyCoursesPage() {
  const { data, isLoading, isError } = useDashboard();

  const courses = data?.courses || [];

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <Card className="text-slate-300">Unable to load your courses right now.</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        subtitle="Continue where you left off."
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.length > 0 ? (
          courses.map((course) => <CourseCard key={course.id} course={course} />)
        ) : (
          <p className="text-slate-400">No enrolled courses found.</p>
        )}
      </div>
    </div>
  );
}