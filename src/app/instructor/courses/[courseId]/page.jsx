"use client";

import { useState, useEffect, Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Plus,
  GraduationCap,
  Calendar,
  Clock,
  User,
  ChevronRight,
  ChevronDown,
  FileText,
  Trash2,
  Rocket,
  Undo2,
  LayoutGrid,
  X,
  BookOpen,
  Settings2,
  SlidersHorizontal,
  BarChart3,
  Search,
  Home,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

import Loader from "@/components/common/Loader";
import { useInstructorCourse } from "@/hooks/queries/instructor/useInstructorCourse";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useUpdateCourse } from "@/hooks/queries/instructor/useUpdateCourse";
import { useUpdateModule } from "@/hooks/queries/instructor/useUpdateModule";
import { useUpdateLesson } from "@/hooks/queries/instructor/useUpdateLesson";
import { useDeleteModule } from "@/hooks/queries/instructor/useDeleteModule";
import { useDeleteCourse } from "@/hooks/queries/instructor/useDeleteCourse";
import { useUpdateCourseStatus } from "@/hooks/queries/instructor/useUpdateCourseStatus";
import { useDeleteLesson } from "@/hooks/queries/instructor/useDeleteLesson";
import { useDeleteContent } from "@/hooks/queries/instructor/useDeleteContent";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useConceptMastery } from "@/hooks/queries/instructor/useInstructorDashboard";
import { useToast } from "@/components/ui/ToastProvider";
import { LessonComposerPanel } from "@/components/instructor/LessonComposer/LessonComposerPanel";
import { BlockSettingsPanel } from "@/components/instructor/LessonComposer/BlockSettingsPanel";

import { CourseComposerHeader } from "@/components/instructor/courses/CourseComposerHeader";
import { CourseComposerSidebar } from "@/components/instructor/courses/CourseComposerSidebar";
import { CourseOverviewView } from "@/components/instructor/courses/CourseOverviewView";
import { LessonOverviewView } from "@/components/instructor/courses/LessonOverviewView";
import { ModuleCellComposer } from "@/components/instructor/courses/ModuleCellComposer";
import { AddCellTypeModal } from "@/components/instructor/courses/AddCellTypeModal";
import { DynamicEditFormModal } from "@/components/instructor/courses/DynamicEditFormModal";

/** Finds a lesson and its parent module by lessonId across all modules */
function findModuleAndLessonById(modules, lessonId) {
  if (!modules || !lessonId) return { module: null, lesson: null };
  for (const mod of modules) {
    const found = (mod.lessons || []).find((l) => l.id === lessonId);
    if (found) return { module: mod, lesson: found };
  }
  return { module: null, lesson: null };
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId;
  const { showToast } = useToast();

  // React Query Hooks
  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useInstructorCourse(courseId);

  const {
    data: modules = [],
    isLoading: modulesLoading,
  } = useModules(courseId);

  const deleteModuleMutation = useDeleteModule();
  const deleteCourseMutation = useDeleteCourse();
  const updateCourseStatusMutation = useUpdateCourseStatus();
  const deleteLessonMutation = useDeleteLesson();
  const deleteContentMutation = useDeleteContent();
  const queryClient = useQueryClient();

  const { data: conceptMasteryData = [] } = useConceptMastery(courseId);

  // Global View Mode: 'rendered' | 'edit' (Matching composerV2.js)
  const [globalMode, setGlobalMode] = useState("rendered");

  // Active Workspace Selection: 'course' | 'lesson' | 'module'
  const [composerMode, setComposerMode] = useState("course");
  const [composeLessonId, setComposeLessonId] = useState(searchParams.get("compose") || null);
  const [composeModuleId, setComposeModuleId] = useState(null);
  const [selectedCellId, setSelectedCellId] = useState(null);

  // Edit Mode for Metadata Headers
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);

  // Editable Form States
  const [courseForm, setCourseForm] = useState({});
  const [lessonForm, setLessonForm] = useState({});
  const [moduleForm, setModuleForm] = useState({});

  // Modals state
  const [isAddCellModalOpen, setIsAddCellModalOpen] = useState(false);
  const [addCellInsertOrder, setAddCellInsertOrder] = useState(1);
  const [addCellPosition, setAddCellPosition] = useState("below");

  const [isDynamicEditFormOpen, setIsDynamicEditFormOpen] = useState(false);
  const [activeEditingCell, setActiveEditingCell] = useState(null);

  // Mobile Drawer State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const updateCourseMutation = useUpdateCourse();
  const updateModuleMutation = useUpdateModule();
  const updateLessonMutation = useUpdateLesson();

  // Sync course data into form state
  useEffect(() => {
    if (course) {
      setCourseForm({
        title: course.title || "",
        subtitle: course.subtitle || course.shortDescription || "",
        description: course.description || "",
        category: course.category || "",
        level: course.level || "Beginner",
        thumbnailUrl: course.thumbnailUrl || "",
        duration: course.duration || "",
        audience: course.audience || "",
        author: course.author || course.creator?.name || "",
      });
    }
  }, [course]);

  // Selection Handlers
  const handleSelectCourseOverview = () => {
    setComposerMode("course");
    setComposeLessonId(null);
    setComposeModuleId(null);
    setMobileSidebarOpen(false);
  };

  const handleSelectLesson = (lessonId) => {
    setComposeLessonId(lessonId);
    setComposerMode("lesson");

    const { lesson: foundLesson, module: foundModule } = findModuleAndLessonById(modules, lessonId);
    if (foundLesson) {
      setLessonForm({
        title: foundLesson.title || "",
        subtitle: foundLesson.subtitle || "",
        summary: foundLesson.summary || foundLesson.description || "",
      });
      if (foundModule) {
        setComposeModuleId(foundModule.id);
      }
    }
    setMobileSidebarOpen(false);
  };

  const handleSelectModule = (mod, lessonId = null) => {
    setComposeModuleId(mod.id);
    setComposerMode("module");
    if (lessonId) {
      setComposeLessonId(lessonId);
    }
    setModuleForm({
      title: mod.title || "",
      subtitle: mod.subtitle || mod.description || "",
    });
    setMobileSidebarOpen(false);
  };

  const { module: composingModule, lesson: composingLesson } =
    findModuleAndLessonById(modules, composeLessonId);

  const activeModuleObj = composingModule || modules.find((m) => m.id === composeModuleId);

  // Delete Handlers
  const handleDeleteModule = async (e, mod) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this module and all its contents?")) return;
    try {
      await deleteModuleMutation.mutateAsync(mod.id);
      showToast("Module deleted successfully", "success");
      handleSelectCourseOverview();
    } catch (err) {
      showToast("Failed to delete module", "error");
    }
  };

  const handleDeleteLesson = async (e, lesson, moduleId) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteLessonMutation.mutateAsync({ lessonId: lesson.id, moduleId });
      showToast("Lesson deleted successfully", "success");
      handleSelectCourseOverview();
    } catch (err) {
      showToast("Failed to delete lesson", "error");
    }
  };

  const handleTogglePublish = async () => {
    const nextStatus = course?.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await updateCourseStatusMutation.mutateAsync({ courseId, status: nextStatus });
      showToast(`Course is now ${nextStatus.toLowerCase()}`, "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  if (courseLoading || modulesLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-[#0D1021] border border-[#1A1F35] rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-white">Course Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested course could not be loaded.
        </p>
        <Link
          href="/instructor/courses"
          className="inline-block px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black transition"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  const isPublished = course.status === "PUBLISHED" || course.status === "Published";

  return (
    <div className="space-y-4 pb-16 animate-fade-in duration-300">
      {/* 1. APP HEADER (Matching composerV2.html app-header) */}
      <CourseComposerHeader
        course={course}
        courseId={courseId}
        globalMode={globalMode}
        onToggleGlobalMode={() => setGlobalMode(globalMode === "rendered" ? "edit" : "rendered")}
        onSaveCourse={async () => {
          try {
            await updateCourseMutation.mutateAsync({ courseId, courseData: courseForm });
            showToast("Course saved successfully!", "success", "Saved");
          } catch (err) {
            showToast("Failed to save course", "error");
          }
        }}
        onImportCourse={() => router.push("/instructor/courses/import")}
        isSaving={updateCourseMutation.isPending}
        isPublished={isPublished}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* 2. MAIN WORKSPACE CONTAINER (composer-container grid: 320px sidebar + notebook main workspace) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Sidebar Panel (Desktop + Mobile Slide-out Drawer) */}
        <div
          className={`${
            mobileSidebarOpen ? "fixed inset-y-0 left-0 z-50 w-80 bg-slate-950 p-4 shadow-2xl block" : "hidden lg:block"
          } w-full lg:w-[320px] shrink-0`}
        >
          <CourseComposerSidebar
            modules={modules}
            composerMode={composerMode}
            composeModuleId={composeModuleId}
            composeLessonId={composeLessonId}
            onSelectCourseOverview={handleSelectCourseOverview}
            onSelectLesson={handleSelectLesson}
            onSelectModule={handleSelectModule}
            onAddLesson={(targetModuleId) => router.push(`/instructor/lessons/create/${targetModuleId || composeModuleId || modules[0]?.id || courseId}`)}
            onAddModule={() => router.push(`/instructor/modules/create/${courseId}`)}
            onDeleteLesson={handleDeleteLesson}
            onDeleteModule={handleDeleteModule}
          />
        </div>

        {/* Center Main Workspace Notebook Area */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Workspace Header & Breadcrumbs */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <div className="text-xs font-semibold text-orange-400 mb-0.5">
                {composerMode === "course" && `Course Overview`}
                {composerMode === "lesson" && `Lesson: ${composingLesson?.title || "Lesson Overview"}`}
                {composerMode === "module" && `Module: ${activeModuleObj?.title || "Module Cells"}`}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {composerMode === "course" && (course.title || "Course Overview Header")}
                {composerMode === "lesson" && (composingLesson?.title || "Lesson Overview Header")}
                {composerMode === "module" && (activeModuleObj?.title || "Module Cells Notebook")}
              </h2>
            </div>
          </div>

          {/* Notebook Workspace Dynamic View */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl">
            {composerMode === "course" && (
              <CourseOverviewView
                course={course}
                courseForm={courseForm}
                setCourseForm={setCourseForm}
                isEditing={isEditingCourse || globalMode === "edit"}
                setIsEditing={setIsEditingCourse}
                onSaveCourseMeta={async () => {
                  try {
                    await updateCourseMutation.mutateAsync({ courseId, courseData: courseForm });
                    setIsEditingCourse(false);
                    showToast("Course details updated!", "success", "Saved");
                  } catch (err) {
                    showToast("Failed to save course", "error");
                  }
                }}
                isSaving={updateCourseMutation.isPending}
                modules={modules}
                onSelectModule={handleSelectModule}
                onAddModule={() => router.push(`/instructor/modules/create/${courseId}`)}
              />
            )}

            {composerMode === "lesson" && (
              <LessonOverviewView
                lesson={composingLesson}
                lessonForm={lessonForm}
                setLessonForm={setLessonForm}
                isEditing={isEditingLesson || globalMode === "edit"}
                setIsEditing={setIsEditingLesson}
                onSaveLessonMeta={async () => {
                  try {
                    await updateLessonMutation.mutateAsync({
                      lessonId: composeLessonId,
                      lessonData: lessonForm,
                    });
                    setIsEditingLesson(false);
                    showToast("Lesson updated!", "success", "Saved");
                  } catch (err) {
                    showToast("Failed to save lesson", "error");
                  }
                }}
                isSaving={updateLessonMutation.isPending}
                modules={modules.filter((m) =>
                  (m.lessons || []).some((l) => l.id === composeLessonId)
                )}
                onSelectModule={handleSelectModule}
                onAddModule={() => router.push(`/instructor/modules/create/${courseId}`)}
              />
            )}

            {composerMode === "module" && activeModuleObj && (() => {
              const effectiveLessonId = composeLessonId || activeModuleObj.lessons?.[0]?.id || modules.flatMap(m => m.lessons || [])[0]?.id;
              return (
                <LessonComposerPanel
                  lessonId={effectiveLessonId}
                  selectedCellId={selectedCellId}
                  onSelectCell={setSelectedCellId}
                />
              );
            })()}
          </div>
        </main>
      </div>

      {/* Modals Sheet & Property Editor Popups */}
      <AddCellTypeModal
        isOpen={isAddCellModalOpen}
        onClose={() => setIsAddCellModalOpen(false)}
        position={addCellPosition}
        setPosition={setAddCellPosition}
        onConfirmAddCell={(cellType, pos) => {
          setIsAddCellModalOpen(false);
          showToast(`Added ${cellType} cell ${pos}!`, "success");
        }}
      />

      <DynamicEditFormModal
        isOpen={isDynamicEditFormOpen}
        onClose={() => setIsDynamicEditFormOpen(false)}
        cellData={activeEditingCell}
        onSave={(data) => {
          setIsDynamicEditFormOpen(false);
          showToast("Properties saved!", "success");
        }}
      />
    </div>
  );
}
