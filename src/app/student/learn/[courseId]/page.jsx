"use client";

import {useState} from "react";
import {useParams} from "next/navigation";

import LearnHeader from "@/components/student/learn/LearnHeader";
import LearnSidebar from "@/components/student/learn/LearnSidebar";
import ContentViewer from "@/components/student/learn/ContentViewer";

import useCourse from "@/hooks/queries/students/useCourse";

export default function LearnPage() {
    const {courseId} = useParams();

    // const [activeLesson, setActiveLesson] = useState(null);

    const {
        data: course,
        isLoading,
        error,
    } = useCourse(courseId);

    const [activeLesson, setActiveLesson] = useState(null);

    if (!activeLesson && course) {
        const lesson =
            course.modules?.[0]?.lessons?.[0] ?? null;

        if (lesson) {
            setActiveLesson(lesson);
        }
    }
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">
                Loading course...
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="h-screen flex items-center justify-center bg-zinc-950 text-red-400">
                Course not found.
            </div>
        );
    }

    return (
        <div className="h-screen bg-zinc-950 flex overflow-hidden">
            <LearnSidebar
                course={course}
                activeLesson={activeLesson}
                setActiveLesson={setActiveLesson}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <LearnHeader
                    course={course}
                    activeLesson={activeLesson}
                />

                <ContentViewer
                    lesson={activeLesson}
                />
            </div>
        </div>
    );
}