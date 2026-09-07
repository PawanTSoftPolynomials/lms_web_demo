"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, PanelLeftOpen } from "lucide-react";

import Loader from "@/components/common/Loader";
import EmptyState from "@/components/ui/EmptyState";
import { CourseStructureSidebar } from "@/components/instructor/courses/CourseComposerSidebar";
import { CourseOverviewView } from "@/components/instructor/courses/CourseOverviewView";
import { LessonOverviewView } from "@/components/instructor/courses/LessonOverviewView";
import useCourse from "@/hooks/queries/student/useCourse";
import { normalizeCourseHierarchy } from "@/lib/courseMapper";

export default function CourseDetailsPage({ params }) {
  const { courseId } = use(params);
  const router = useRouter();

  const { data: rawCourse, isLoading, isError } = useCourse(courseId);
  const course = normalizeCourseHierarchy(rawCourse);

  const [isCourseMapOpen, setIsCourseMapOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("course");
  const [composeModuleId, setComposeModuleId] = useState(null);
  const [composeLessonId, setComposeLessonId] = useState(null);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !course) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Course not found"
        description="The requested course could not be loaded."
      />
    );
  }

  const modules = course.modules || [];
  const activeModuleObj = modules.find((m) => m.id === composeModuleId);
  const activeLessonObj = (activeModuleObj?.lessons || modules.flatMap((m) => m.lessons || [])).find(
    (l) => l.id === composeLessonId
  );

  const handleSelectCourseOverview = () => {
    setComposerMode("course");
    setComposeModuleId(null);
    setComposeLessonId(null);
  };

  const handleSelectModule = (mod, firstLessonId) => {
    setComposerMode("module");
    setComposeModuleId(mod.id);
    setComposeLessonId(firstLessonId || mod.lessons?.[0]?.id || null);
  };

  const handleSelectLesson = (lessonId) => {
    setComposerMode("lesson");
    setComposeLessonId(lessonId);
    const parentMod = modules.find((m) => (m.lessons || []).some((l) => l.id === lessonId));
    if (parentMod) setComposeModuleId(parentMod.id);
  };

  const handleStartLearning = (targetLessonId) => {
    const firstLessonId =
      targetLessonId ||
      composeLessonId ||
      modules[0]?.lessons?.[0]?.id;
    if (firstLessonId) {
      router.push(`/student/learn/${courseId}?lessonId=${firstLessonId}`);
    } else {
      router.push(`/student/learn/${courseId}`);
    }
  };

  const courseMapEffectivelyOpen = mobileSidebarOpen || isCourseMapOpen;
  const sidebarWrapperClassName = mobileSidebarOpen
    ? "fixed inset-y-0 left-0 z-50 w-80 bg-background p-4 shadow-2xl block shrink-0"
    : `hidden lg:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
        isCourseMapOpen ? "w-full lg:w-[320px]" : "w-full lg:w-0"
      }`;

  return (
    <div className="space-y-4 pb-16 animate-fade-in duration-300">
      {/* MAIN WORKSPACE CONTAINER MATCHING INSTRUCTOR VIEW */}
      <div className="relative flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Sidebar Panel */}
        <div className={sidebarWrapperClassName}>
          <CourseStructureSidebar
            modules={modules}
            composerMode={composerMode}
            composeModuleId={composeModuleId}
            composeLessonId={composeLessonId}
            isOpen={courseMapEffectivelyOpen}
            onToggleOpen={() => setIsCourseMapOpen((v) => !v)}
            onSelectCourseOverview={handleSelectCourseOverview}
            onSelectLesson={(lessonId) => {
              handleSelectLesson(lessonId);
              handleStartLearning(lessonId);
            }}
            onSelectModule={(mod) => handleSelectModule(mod)}
            onSelectTopic={(topicId, lessonId) => handleStartLearning(lessonId)}
            onSelectContent={(content, topic, lesson) => handleStartLearning(lesson?.id)}
            role="STUDENT"
          />
        </div>

        {/* Center Main Workspace Notebook Area */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Workspace Header & Breadcrumbs */}
          <div className="flex items-center justify-between pb-3 border-b border-transparent/80">
            <div className="flex items-center gap-3">
              {!isCourseMapOpen && !mobileSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsCourseMapOpen(true)}
                  className="hidden lg:flex shrink-0 h-9 w-9 items-center justify-center rounded-full border border-primary/50 bg-background text-primary shadow-md transition hover:bg-primary/10 hover:border-primary hover:text-orange-300 cursor-pointer"
                  aria-label="Show course map"
                  title="Show course map"
                >
                  <PanelLeftOpen size={16} />
                </button>
              )}
              <div>
                <div className="text-xs font-semibold text-primary mb-0.5">
                  {composerMode === "course" && `Course Overview`}
                  {composerMode === "lesson" && `Lesson: ${activeLessonObj?.title || "Lesson Overview"}`}
                  {composerMode === "module" && `Module: ${activeModuleObj?.title || "Module Overview"}`}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  {composerMode === "course" && (course.title || "Course Overview Header")}
                  {composerMode === "lesson" && (activeLessonObj?.title || "Lesson Overview Header")}
                  {composerMode === "module" && (activeModuleObj?.title || "Module Overview")}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStartLearning()}
              className="bg-primary hover:bg-orange-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              Start Learning
            </button>
          </div>

          {/* Notebook Workspace Dynamic View */}
          <div className="rounded-2xl border border-transparent bg-background/60 p-4 sm:p-6 shadow-xl">
            {composerMode === "course" && (
              <CourseOverviewView
                course={course}
                modules={modules}
                role="STUDENT"
                onSelectModule={(mod) => handleSelectModule(mod)}
                onStartLearning={() => handleStartLearning()}
              />
            )}

            {composerMode === "lesson" && activeLessonObj && (
              <LessonOverviewView
                lesson={activeLessonObj}
                modules={modules.filter((m) =>
                  (m.lessons || []).some((l) => l.id === activeLessonObj.id)
                )}
                onSelectModule={(mod) => handleSelectModule(mod)}
              />
            )}

            {composerMode === "module" && activeModuleObj && (
              <div className="space-y-4">
                <div className="border-b border-transparent pb-3">
                  <h3 className="text-xl font-bold text-foreground">{activeModuleObj.title}</h3>
                  {activeModuleObj.subtitle && (
                    <p className="text-xs text-primary italic mt-1">{activeModuleObj.subtitle}</p>
                  )}
                  <p className="text-xs text-foreground mt-2">{activeModuleObj.description || "Module overview."}</p>
                </div>
                <h4 className="text-sm font-bold text-foreground">Module Lessons:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(activeModuleObj.lessons || []).map((l, idx) => (
                    <div
                      key={l.id}
                      onClick={() => handleStartLearning(l.id)}
                      className="p-3 rounded-xl border border-transparent bg-background/80 hover:bg-background cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-primary font-bold block uppercase">
                          Lesson {idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-foreground mt-0.5">{l.title}</h5>
                      </div>
                      <span className="text-[11px] font-bold text-primary hover:underline">Start &rarr;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}