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
import {useCourse, useStudentState, useUpdateStudentState} from "@/hooks/queries/student";
import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

export default function LearnPage() {
    const {courseId} = useParams();
    const {data, isLoading, isError} = useCourse(courseId);
    const {data: stateData, isLoading: isStateLoading} = useStudentState();
    const updateStateMutation = useUpdateStudentState();
    const completeLessonMutation = useCompleteLesson();

    const course = data?.data || data;

    const lessons = useMemo(() => {
    const modules = course?.modules || [];

    return modules.flatMap((module) =>
        (module.lessons || []).map((lesson) => ({
            ...lesson,
            moduleId: module.id,
            duration:
                lesson.duration || "N/A",
        }))
    );
}, [course]);

    const [selectedLesson, setSelectedLesson] = useState(null);
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    const [initialTime, setInitialTime] = useState(0);
    const [stateRestored, setStateRestored] = useState(false);

    // Restore state from DB on load
    useEffect(() => {
        if (isStateLoading || isLoading || stateRestored) return;

        // Try restoring from URL query param first
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const queryLessonId = urlParams.get("lessonId");
            if (queryLessonId) {
                const matchedLesson = lessons.find((l) => l.id === queryLessonId);
                if (matchedLesson) {
                    setSelectedLesson(matchedLesson);
                    setStateRestored(true);
                    return;
                }
            }
        }

        const savedState = stateData?.data || stateData;
        if (savedState && savedState.courseId === courseId && savedState.lessonId) {
            const matchedLesson = lessons.find((l) => l.id === savedState.lessonId);
            if (matchedLesson) {
                setSelectedLesson(matchedLesson);
                if (savedState.timestamp) {
                    setInitialTime(savedState.timestamp);
                    setCurrentTimestamp(savedState.timestamp);
                }
                setStateRestored(true);
                return;
            }
        }

        if (!selectedLesson && lessons.length > 0) {
            setSelectedLesson(lessons[0]);
            setStateRestored(true);
        }
    }, [lessons, selectedLesson, stateData, isStateLoading, isLoading, courseId, stateRestored]);

    // Reset initialTime to 0 when selectedLesson changes, except on mount restore
    useEffect(() => {
        if (stateRestored) {
            setInitialTime(0);
        }
    }, [selectedLesson, stateRestored]);

    // Sync state back to DB on change (debounced)
    useEffect(() => {
        if (!selectedLesson?.id || !stateRestored) return;

        const timer = setTimeout(() => {
            updateStateMutation.mutate({
                courseId,
                moduleId: selectedLesson.moduleId || null,
                lessonId: selectedLesson.id,
                contentId: selectedLesson.contents?.[0]?.id || null,
                timestamp: currentTimestamp,
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [selectedLesson, currentTimestamp, courseId, stateRestored]);

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
                   initialTime={initialTime}
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