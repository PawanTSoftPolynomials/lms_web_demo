"use client";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import ProgressCard from "@/components/students/ProgressCard";

import useProgress from "@/hooks/queries/students/useProgress";

export default function ProgressPage() {
  const { data, isLoading, isError } = useProgress();

  const stats = data?.stats || {};
  const courses = data?.courses || [];

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <Card className="text-slate-300">Unable to load progress right now.</Card>;
  }

  const totalProgress = stats?.completionRate || 0;
  const completedCourses = courses.filter((course) => course.progress >= 100).length;

  return (
    <div className="space-y-8">
      <PageHeader title="Learning Progress" subtitle="Track your course completion." />

      <Card>
        <h2 className="text-xl font-semibold text-white">Overall Progress</h2>
        <div className="mt-4">
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div className="bg-orange-500 h-4 rounded-full" style={{ width: `${totalProgress}%` }} />
          </div>
          <p className="mt-3 text-orange-400 text-lg font-bold">{totalProgress}% Completed</p>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.length > 0 ? (
          courses.map((course) => <ProgressCard key={course.id} course={course} />)
        ) : (
          <p className="text-slate-400">No progress available.</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <h2 className="text-xl font-semibold text-white">Courses Completed</h2>
          <p className="text-4xl text-green-500 mt-4">{completedCourses}</p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white">Certificates Earned</h2>
          <p className="text-4xl text-orange-500 mt-4">{stats?.certificates || 0}</p>
        </Card>
      </div>
    </div>
  );
}
