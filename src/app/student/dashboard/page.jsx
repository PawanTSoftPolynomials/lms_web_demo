"use client";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import StatCard from "@/components/students/StatCard";
import CourseCard from "@/components/students/CourseCard";

import useDashboard from "@/hooks/queries/students/useDashboard";

export default function StudentDashboard() {
  const { data, isLoading, isError } = useDashboard();

  const stats = data?.stats || {};
  const courses = data?.courses || [];

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <Card className="text-slate-300">Unable to load dashboard right now.</Card>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back"
        subtitle="Continue your learning journey."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Enrolled Courses" value={stats?.enrolledCourses || 0} />
        <StatCard title="Completed Lessons" value={stats?.completedLessons || 0} />
        <StatCard title="Certificates" value={stats?.certificates || 0} />
        <StatCard title="Completion Rate" value={`${stats?.completionRate || 0}%`} />
      </div>

      <Card className="p-0 border-0 bg-transparent shadow-none">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Continue Learning</h2>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.length > 0 ? (
            courses.map((course) => <CourseCard key={course.id} course={course} />)
          ) : (
            <p className="text-slate-400">No enrolled courses found.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
