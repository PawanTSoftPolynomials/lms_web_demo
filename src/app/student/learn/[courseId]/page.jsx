"use client";

import {useEffect, useMemo, useState} from "react";
import {useParams} from "next/navigation";
import StickyNotesPanel from "@/components/student/sticky-notes/StickyNotesPanel";
import LearnHeader from "@/components/student/learning/LearnHeader";
import VideoPlayer from "@/components/student/learning/VideoPlayer";
import CourseSidebar from "@/components/student/learning/CourseSidebar";
import LessonTabs from "@/components/student/learning/LessonTabs";
import LessonNavigation from "@/components/student/learning/LessonNavigation";
import useCompleteLesson from "@/hooks/queries/student/useCompleteLesson";
import {useCourse} from "@/hooks/queries/student";
import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

export default function LearnPage() {
    const {courseId} = useParams();
    const {data, isLoading, isError} = useCourse(courseId);
    const completeLessonMutation = useCompleteLesson();

    const course = data?.data || data;

    const lessons = useMemo(() => {
    const modules = course?.modules || [];

    return modules.flatMap((module) =>
        (module.lessons || []).map((lesson) => ({
            ...lesson,
            duration:
                lesson.duration || "N/A",
        }))
    );
}, [course]);

    const [selectedLesson, setSelectedLesson] = useState(null);
    const [currentTimestamp, setCurrentTimestamp] =
    useState(0);
    useEffect(() => {
        if (!selectedLesson && lessons.length > 0) {
            setSelectedLesson(lessons[0]);
        }
    }, [lessons, selectedLesson]);

    const markComplete = async () => {
        if (!selectedLesson?.id) return;
        completeLessonMutation.mutate(selectedLesson.id);
    };

    if (isLoading) {
        return <Loader/>;
    }

    if (isError || !course) {
        return <Card className="text-slate-300">Course not found.</Card>;
    }

    return (
        <div className="space-y-6">
            <LearnHeader
                course={course}
                progress={0}
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <VideoPlayer
                   content={selectedLesson?.contents?.[0]}
                   onTimeUpdate={setCurrentTimestamp}
                  />
                   <StickyNotesPanel
        lessonId={selectedLesson?.id}
        currentTimestamp={currentTimestamp}
    />

                <CourseSidebar
                    modules={course.modules || []}
                    activeLesson={selectedLesson}
                    setActiveLesson={setSelectedLesson}
                    completedLessons={[]}
                />
            </div>

            <LessonTabs
                lesson={selectedLesson}
                course={course}
            />

            <LessonNavigation
                activeLesson={selectedLesson}
                previousLesson={null}
                nextLesson={null}
                onPrevious={() => {
                }}
                onNext={() => {
                }}
                onComplete={markComplete}
                isCompleting={
                    completeLessonMutation.isPending
                }
            />
        </div>
    );
}