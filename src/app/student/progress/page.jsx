"use client";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";

import ProgressOverview from "@/components/student/progress/ProgressOverview";
import ProgressStats from "@/components/student/progress/ProgressStats";
import ProgressEmpty from "@/components/student/progress/ProgressEmpty";

import useProgress from "@/hooks/queries/student/useProgress";

export default function StudentProgressPage() {
    const {
        data,
        isLoading,
        isError,
    } = useProgress();

    if (isLoading) {
        return <Loader/>;
    }

    if (isError) {
        return (
            <div className="text-center text-red-400">
                Failed to load progress.
            </div>
        );
    }

    const progress = data?.data || data || {};

    return (
        <div className="space-y-8">
            <PageHeader
                title="Learning Progress"
                subtitle="Track your overall learning journey."
            />

            <ProgressOverview
                percentage={progress.percentage}
                completedLessons={progress.completedLessons}
                totalLessons={progress.totalLessons}
            />

            <ProgressStats
                completedLessons={progress.completedLessons}
                totalLessons={progress.totalLessons}
            />

            {progress.completedLessons === 0 && (
                <ProgressEmpty/>
            )}
        </div>
    );
}