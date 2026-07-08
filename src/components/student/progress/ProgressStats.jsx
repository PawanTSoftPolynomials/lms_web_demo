"use client";

import {
    BookOpen,
    CheckCircle2,
    Clock3,
} from "lucide-react";

import StatCard from "@/components/student/dashboard/StatCard";

export default function ProgressStats({
                                          totalLessons = 0,
                                          completedLessons = 0,
                                      }) {
    return (
        <div className="grid gap-5 md:grid-cols-3">
            <StatCard
                title="Total Lessons"
                value={totalLessons}
                icon={<BookOpen className="h-6 w-6" />}
            />

            <StatCard
                title="Completed"
                value={completedLessons}
                icon={<CheckCircle2 className="h-6 w-6" />}
            />

            <StatCard
                title="Remaining"
                value={Math.max(
                    totalLessons - completedLessons,
                    0
                )}
                icon={<Clock3 className="h-6 w-6" />}
            />
        </div>
    );
}