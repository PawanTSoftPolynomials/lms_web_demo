"use client";

import QuizCard from "./QuizCard";
import EmptyQuizzes from "./EmptyQuizzes";

export default function QuizGrid({
                                     quizzes = [],
                                     courseId,
                                     onDelete,
                                 }) {
    if (!quizzes.length) {
        return (
            <EmptyQuizzes
                courseId={courseId}
            />
        );
    }

    return (
        <div
            className="
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-3
      "
        >
            {quizzes.map((quiz) => (
                <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}