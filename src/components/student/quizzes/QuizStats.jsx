"use client";

import {
    ClipboardList,
    HelpCircle,
    Target,
    Clock,
} from "lucide-react";

import StatCard from "@/components/student/dashboard/StatCard";

export default function QuizStats({
                                      quizzes = [],
                                  }) {
    const totalQuizzes = quizzes.length;

    const totalQuestions = quizzes.reduce(
        (sum, quiz) =>
            sum + (quiz._count?.questions ?? 0),
        0
    );

    const averagePassingScore =
        totalQuizzes > 0
            ? Math.round(
                quizzes.reduce(
                    (sum, quiz) =>
                        sum +
                        (quiz.passingScore ?? 0),
                    0
                ) / totalQuizzes
            )
            : 0;

    const averageTimeLimit =
        totalQuizzes > 0
            ? Math.round(
                quizzes.reduce(
                    (sum, quiz) =>
                        sum +
                        (quiz.timeLimit ?? 0),
                    0
                ) / totalQuizzes
            )
            : 0;

    return (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Total Quizzes"
                value={totalQuizzes}
                icon={
                    <ClipboardList className="h-6 w-6"/>
                }
            />

            <StatCard
                title="Total Questions"
                value={totalQuestions}
                icon={
                    <HelpCircle className="h-6 w-6"/>
                }
            />

            <StatCard
                title="Avg Passing Score"
                value={`${averagePassingScore}%`}
                icon={
                    <Target className="h-6 w-6"/>
                }
            />

            <StatCard
                title="Avg Time Limit"
                value={`${averageTimeLimit} min`}
                icon={
                    <Clock className="h-6 w-6"/>
                }
            />
        </section>
    );
}