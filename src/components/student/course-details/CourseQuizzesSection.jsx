"use client";

import Loader from "@/components/common/Loader";
import useQuizzes from "@/hooks/queries/student/useQuizzes";
import QuizTable from "@/components/student/quizzes/QuizTable";

export default function CourseQuizzesSection({ courseId }) {
    const { data: quizzes = [], isLoading } = useQuizzes(courseId);

    return (
        <div className="space-y-3">
            <div className="px-1">
                <h2 className="text-lg font-semibold text-foreground">Quizzes</h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                    {quizzes.length} {quizzes.length === 1 ? "Quiz" : "Quizzes"}
                </p>
            </div>

            {isLoading ? <Loader /> : <QuizTable quizzes={quizzes} />}
        </div>
    );
}
