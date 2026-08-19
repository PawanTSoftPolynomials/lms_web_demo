"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsMutating } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";

import Loader from "@/components/common/Loader";
import ComposerSidebar from "@/components/instructor/composer/ComposerSidebar";
import CourseMetaPanel from "@/components/instructor/composer/CourseMetaPanel";
import LessonCanvas from "@/components/instructor/composer/LessonCanvas";
import { useInstructorCourse } from "@/hooks/queries/instructor/useInstructorCourse";

function findLessonAndModule(course, lessonId) {
  for (const mod of course.modules || []) {
    const lesson = (mod.lessons || []).find((l) => l.id === lessonId);
    if (lesson) return { lesson, module: mod };
  }
  return { lesson: null, module: null };
}

export default function CourseComposer({ courseId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: course, isLoading, isError } = useInstructorCourse(courseId);

  const [view, setView] = useState("lesson");
  const [selectedLessonId, setSelectedLessonId] = useState(
    searchParams.get("lessonId") || null,
  );

  const isSaving = useIsMutating() > 0;

  useEffect(() => {
    if (!course || selectedLessonId) return;
    const firstLesson = course.modules?.[0]?.lessons?.[0];
    if (firstLesson) setSelectedLessonId(firstLesson.id);
  }, [course, selectedLessonId]);

  const selectLesson = (lessonId) => {
    setView("lesson");
    setSelectedLessonId(lessonId);
    router.replace(`/instructor/courses/${courseId}/composer?lessonId=${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="text-center py-24 text-slate-400">
        Could not load this course.
      </div>
    );
  }

  const { lesson, module: parentModule } = findLessonAndModule(course, selectedLessonId);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <LayoutTemplate size={16} className="text-orange-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Course Composer
            </p>
            <h1 className="text-sm font-bold text-white truncate">{course.title}</h1>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
            isSaving
              ? "text-amber-400 bg-amber-950/30 border border-amber-800/60"
              : "text-emerald-400 bg-emerald-950/30 border border-emerald-800/60"
          }`}
        >
          {isSaving ? "Saving…" : "Synced"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <ComposerSidebar
          course={course}
          courseId={courseId}
          selectedLessonId={selectedLessonId}
          view={view}
          onSelectLesson={selectLesson}
          onSelectSettings={() => setView("settings")}
        />

        <main className="flex-1 min-w-0 w-full rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-6">
          {view === "settings" ? (
            <CourseMetaPanel course={course} courseId={courseId} />
          ) : lesson ? (
            <LessonCanvas lesson={lesson} moduleId={parentModule.id} courseId={courseId} />
          ) : (
            <div className="text-center py-16 text-slate-500 text-sm">
              Select or add a lesson from the Course Map to start building content.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
