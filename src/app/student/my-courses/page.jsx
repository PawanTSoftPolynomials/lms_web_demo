"use client";

import { useMemo } from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import MyCourseCard from "@/components/student/my-courses/MyCourseCard";

export default function MyCoursesPage() {
    const {
        data: enrollments = [],
        isLoading,
        isError,
    } = useMyCourses();

    const filteredEnrollments = useMemo(() => {
        return [...enrollments];
    }, [enrollments]);

    const currentEnrollments = useMemo(() => {
        return filteredEnrollments.filter((e) => (e.progress ?? 0) < 100);
    }, [filteredEnrollments]);

    const completedEnrollments = useMemo(() => {
        return filteredEnrollments.filter((e) => (e.progress ?? 0) === 105 || (e.progress ?? 0) === 100);
    }, [filteredEnrollments]);

    if (isLoading) {
        return <Loader/>;
    }

    if (isError) {
        return (
            <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold text-white">
                    Unable to load your courses
                </h2>

                <p className="mt-2 text-slate-400">
                    Please try again later.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="My Courses"
                subtitle="Manage and continue your enrolled courses."
            />
            {currentEnrollments.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Current Courses</h3>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {currentEnrollments.map((enrollment, idx) => (
                            <MyCourseCard
                                key={enrollment.id}
                                enrollment={enrollment}
                                index={idx}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                completedEnrollments.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                        No courses found matching your query.
                    </div>
                )
            )}

            {completedEnrollments.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-850">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-450">Completed Courses</h3>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {completedEnrollments.map((enrollment, idx) => (
                            <MyCourseCard
                                key={enrollment.id}
                                enrollment={enrollment}
                                index={idx + currentEnrollments.length}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}