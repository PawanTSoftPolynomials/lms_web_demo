"use client";

import {
    BookOpen,
    GraduationCap,
    Award,
    TrendingUp,
} from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";

import StatCard from "@/components/student/dashboard/StatCard";
import CourseCard from "@/components/student/courses/CourseCard";

import useDashboard from "@/hooks/queries/student/useDashboard";

export default function StudentDashboardPage() {
    const {
        data,
        isLoading,
        isError,
    } = useDashboard();

    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return (
            <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold text-white">
                    Unable to load dashboard
                </h2>

                <p className="mt-2 text-slate-400">
                    Please try again later.
                </p>
            </Card>
        );
    }

    const stats = data?.stats ?? {};
    const enrolledCourses =
        data?.enrolledCoursesList ?? [];

    return (
        <div className="space-y-8">
            <PageHeader
                title="Student Dashboard"
                subtitle="Track your learning progress and continue your enrolled courses."
            />

            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Enrolled Courses"
                    value={stats.enrolledCourses ?? 0}
                    icon={
                        <BookOpen className="h-6 w-6" />
                    }
                />

                <StatCard
                    title="Completed Lessons"
                    value={
                        stats.completedLessons ?? 0
                    }
                    icon={
                        <GraduationCap className="h-6 w-6" />
                    }
                />

                <StatCard
                    title="Certificates"
                    value={stats.certificates ?? 0}
                    icon={
                        <Award className="h-6 w-6" />
                    }
                />

                <StatCard
                    title="Completion Rate"
                    value={`${
                        stats.completionRate ?? 0
                    }%`}
                    icon={
                        <TrendingUp className="h-6 w-6" />
                    }
                />
            </section>

            <section className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">
                            Continue Learning
                        </h2>

                        <p className="text-sm text-slate-400">
                            Resume your enrolled courses.
                        </p>
                    </div>
                </div>

                {enrolledCourses.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {enrolledCourses.map(
                            (enrollment) => (
                                <CourseCard
                                    key={enrollment.id}
                                    enrollment={enrollment}
                                />
                            )
                        )}
                    </div>
                ) : (
                    <Card className="p-10 text-center">
                        <h3 className="text-lg font-semibold text-white">
                            No enrolled courses
                        </h3>

                        <p className="mt-2 text-slate-400">
                            Browse available courses and start learning.
                        </p>
                    </Card>
                )}
            </section>
        </div>
    );
}