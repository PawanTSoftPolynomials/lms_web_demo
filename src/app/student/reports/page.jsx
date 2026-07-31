"use client";

import Link from "next/link";
import { Target, Award, Flame, GraduationCap, CheckCircle, XCircle, HelpCircle, ClipboardList } from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import StatCard from "@/components/student/dashboard/StatCard";
import ProgressBar from "@/components/student/courses/ProgressBar";

import useDashboard from "@/hooks/queries/student/useDashboard";
import useProgress from "@/hooks/queries/student/useProgress";
import useQuizzes from "@/hooks/queries/student/useQuizzes";
import useAssignments from "@/hooks/queries/student/useAssignments";

export default function StudentReportsPage() {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: progressData, isLoading: progressLoading } = useProgress();
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuizzes();
  const { data: assignments = [], isLoading: assignmentsLoading } = useAssignments();

  if (dashboardLoading || progressLoading) {
    return <Loader />;
  }

  const stats = dashboardData?.stats || {};
  const courses = progressData?.courses || [];

  const attemptedQuizzes = quizzes.filter((q) => !!q.quizSubmissions?.[0]);
  const passedQuizzes = attemptedQuizzes.filter((q) => q.quizSubmissions[0].passed);
  const avgQuizPercentage = attemptedQuizzes.length
    ? Math.round(
        attemptedQuizzes.reduce((sum, q) => sum + (q.quizSubmissions[0].percentage ?? 0), 0) / attemptedQuizzes.length
      )
    : stats.avgQuizScore ?? 0;

  const assignmentBuckets = {
    Graded: assignments.filter((a) => a.status === "Graded").length,
    Submitted: assignments.filter((a) => a.status === "Submitted").length,
    Pending: assignments.filter((a) => a.status !== "Submitted" && a.status !== "Graded").length,
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Reports" subtitle="Your grades, quiz performance, and course completion at a glance." />

      {/* Overview stats */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Avg Quiz Score" value={`${avgQuizPercentage}%`} icon={<Target className="h-6 w-6" />} />
        <StatCard
          title="Lessons Completed"
          value={`${stats.completedLessons ?? 0}/${stats.totalLessons ?? 0}`}
          icon={<GraduationCap className="h-6 w-6" />}
        />
        <StatCard title="Certificates Earned" value={stats.certificatesCount ?? 0} icon={<Award className="h-6 w-6" />} />
        <StatCard title="Current Streak" value={`${stats.streak ?? 0} days`} icon={<Flame className="h-6 w-6" />} />
      </section>

      {/* Course progress report */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Course Progress</h2>
        {courses.length === 0 ? (
          <Card className="p-6 text-center text-sm text-slate-400">No enrolled courses yet.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <Card key={course.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-white">{course.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">{course.instructor}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-orange-500">{course.progress}%</span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={course.progress} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {course.completedLessons}/{course.totalLessons} lessons completed
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Quiz performance report */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Quiz Performance</h2>
        {quizzesLoading ? (
          <Card className="p-6 text-center text-sm text-slate-400">Loading quiz results…</Card>
        ) : attemptedQuizzes.length === 0 ? (
          <Card className="p-6 text-center text-sm text-slate-400">No quizzes attempted yet.</Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-3 gap-4 border-b border-slate-800 p-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-400">Attempted</p>
                <p className="mt-1 text-lg font-bold text-white">{attemptedQuizzes.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Passed</p>
                <p className="mt-1 text-lg font-bold text-emerald-500">{passedQuizzes.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Failed</p>
                <p className="mt-1 text-lg font-bold text-rose-500">{attemptedQuizzes.length - passedQuizzes.length}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400">Average Score</p>
                <p className="mt-1 text-lg font-bold text-orange-500">{avgQuizPercentage}%</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800">
              {attemptedQuizzes.map((quiz) => {
                const submission = quiz.quizSubmissions[0];
                return (
                  <Link
                    key={quiz.id}
                    href={`/student/result/${quiz.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-slate-800/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{quiz.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {submission.score}/{quiz._count?.questions ?? "—"} questions correct
                      </p>
                    </div>
                    <div
                      className={`flex shrink-0 items-center gap-1.5 text-xs font-bold ${
                        submission.passed ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {submission.passed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {submission.percentage}%
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        )}
      </section>

      {/* Assignment summary */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Assignment Summary</h2>
        {assignmentsLoading ? (
          <Card className="p-6 text-center text-sm text-slate-400">Loading assignments…</Card>
        ) : assignments.length === 0 ? (
          <Card className="p-6 text-center text-sm text-slate-400">No assignments yet.</Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Graded" value={assignmentBuckets.Graded} icon={<ClipboardList className="h-6 w-6" />} />
            <StatCard title="Submitted (awaiting grade)" value={assignmentBuckets.Submitted} icon={<HelpCircle className="h-6 w-6" />} />
            <StatCard title="Pending" value={assignmentBuckets.Pending} icon={<Target className="h-6 w-6" />} />
          </div>
        )}
      </section>
    </div>
  );
}
