"use client";

import LessonCard from "./LessonCard";
import EmptyLessons from "./EmptyLessons";

export default function LessonGrid({
                                       lessons = [],
                                       onDelete,
                                   }) {
    if (!lessons.length) {
        return <EmptyLessons/>;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => (
                <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}