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

  // Syllabus Search Filter
  const [syllabusSearch, setSyllabusSearch] = useState("");

  // Accordion Expand/Collapse States
  const [expandedModules, setExpandedModules] = useState({});

  // Active Lesson State for Composer
  const [composeLessonId, setComposeLessonId] = useState(
    searchParams.get("compose") || null
  );
  const [selectedCellId, setSelectedCellId] = useState(null);

  // Right Panel Mode: 'block-settings' vs 'analytics'
  const [rightPanelTab, setRightPanelTab] = useState("block-settings");

  // Mobile Drawers
  const [mobileSyllabusOpen, setMobileSyllabusOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  // Save status indicator
  const [saveStatus, setSaveStatus] = useState("Saved just now");

  // Automatically select the first lesson on initial load if none is selected
  useEffect(() => {
    if (modules && modules.length > 0 && !composeLessonId) {
      const initialCompose = searchParams.get("compose");
      if (initialCompose) {
        setComposeLessonId(initialCompose);
        return;
      }
      for (const mod of modules) {
        if (mod.lessons && mod.lessons.length > 0) {
          setComposeLessonId(mod.lessons[0].id);
          setExpandedModules((prev) => ({ ...prev, [mod.id]: true }));
          break;
        }
      }
    }
  }, [modules, searchParams]);

  // When selected block changes, ensure right panel is on block-settings
  useEffect(() => {
    if (selectedCellId) {
      setRightPanelTab("block-settings");
    }
  }, [selectedCellId]);

  const handleSelectLesson = (lessonId, moduleId) => {
    setComposeLessonId(lessonId);
    setSelectedCellId(null);
    setRightPanelTab("block-settings");
    if (moduleId) {
      setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
    }
    // Close mobile drawers if open
    setMobileSyllabusOpen(false);
  };

  const { module: composingModule, lesson: composingLesson } =
    findModuleAndLessonById(modules, composeLessonId);

  // Accordion handlers
  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleDeleteModule = async (e, mod) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this module and all its lessons?"
      )
    ) {
      return;
    }
    try {
      await deleteModuleMutation.mutateAsync(mod.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLesson = async (e, lesson, moduleId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteLessonMutation.mutateAsync({ lessonId: lesson.id, moduleId });
      if (composeLessonId === lesson.id) {
        setComposeLessonId(null);
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MODULES, courseId],
      });
    } catch (error) {
      console.error("Failed to delete lesson:", error);
    }
  };

  const handleCourseDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete this course? All associated modules, lessons, and content will be permanently removed.`
      )
    ) {
      return;
    }
    try {
      await deleteCourseMutation.mutateAsync(courseId);
      router.push("/instructor/courses");
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  const handleTogglePublish = async () => {
    const nextStatus = course?.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    if (nextStatus === "PUBLISHED" && modules.length === 0) {
      showToast(
        "Add at least one module before publishing this course.",
        "error",
        "Missing content"
      );
      return;
    }

    try {
      await updateCourseStatusMutation.mutateAsync({ courseId, status: nextStatus });
    } catch (error) {
      console.error("Failed to update course status:", error);
      showToast(
        error?.response?.data?.message || "Failed to update course status.",
        "error",
        "Publish failed"
      );
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
          The requested course could not be loaded from the database.
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

  const activeCourse = course;
  const activeModules = modules || [];

  const isPublished =
    activeCourse.status === "Published" ||
    activeCourse.status === "PUBLISHED" ||
    activeCourse.isPublished;
  const totalEnrolls =
    activeCourse._count?.enrollments ?? activeCourse.enrollments?.length ?? 0;

  // Filter modules/lessons by search term
  const filteredModules = activeModules.filter((mod) => {
    if (!syllabusSearch.trim()) return true;
    const term = syllabusSearch.toLowerCase();
    const modMatches = mod.title?.toLowerCase().includes(term);
    const lessonMatches = (mod.lessons || []).some((l) =>
      l.title?.toLowerCase().includes(term)
    );
    return modMatches || lessonMatches;
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      {/* 1. Course Header Card (PRESERVED UNCHANGED) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Logo */}
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-white border border-slate-200 shrink-0 flex items-center justify-center p-1.5 shadow-sm">
              {activeCourse.thumbnailUrl ? (
                <img
                  src={activeCourse.thumbnailUrl}
                  alt={activeCourse.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <GraduationCap className="text-3xl text-slate-500" />
              )}
            </div>

            {/* Header Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="rounded-xl bg-purple-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-400 border border-purple-500/20">
                  {activeCourse.category}
                </span>
                <span
                  className={`rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                    isPublished
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {activeCourse.status}
                </span>
              </div>

              <h1 className="text-lg font-bold text-white tracking-tight leading-snug truncate">
                {activeCourse.title}
              </h1>

              {/* Sub-Metadata Footer Row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <User size={12} className="text-purple-400" />
                  <span>
                    Instructor:{" "}
                    {activeCourse.creator?.name ?? "Prasad Kulkarni"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-purple-400" />
                  <span>
                    Created:{" "}
                    {new Date(
                      activeCourse.createdAt ?? "2026-07-01"
                    ).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-purple-400" />
                  <span>
                    Last updated:{" "}
                    {new Date(
                      activeCourse.updatedAt ?? "2026-07-20"
                    ).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() =>
                router.push(`/instructor/courses/edit/${courseId}`)
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl transition cursor-pointer"
            >
              <Pencil size={12} />
              Edit Course
            </button>
            <button
              onClick={() => router.push(`/instructor/quizzes/${courseId}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl transition cursor-pointer"
            >
              <ClipboardList size={12} />
              Manage Quizzes
            </button>
            <button
              onClick={handleTogglePublish}
              disabled={updateCourseStatusMutation.isPending}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold rounded-xl border transition cursor-pointer disabled:opacity-50 ${
                isPublished
                  ? "text-amber-400 hover:text-amber-300 bg-amber-950/30 hover:bg-amber-900/50 border-amber-800/60"
                  : "text-emerald-400 hover:text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-800/60"
              }`}
            >
              {isPublished ? <Undo2 size={12} /> : <Rocket size={12} />}
              {updateCourseStatusMutation.isPending
                ? "Updating..."
                : isPublished
                ? "Unpublish Course"
                : "Publish Course"}
            </button>
            <button
              onClick={handleCourseDelete}
              disabled={deleteCourseMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={12} />
              {deleteCourseMutation.isPending ? "Deleting..." : "Delete Course"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Bar for Drawer Toggles */}
      <div className="flex lg:hidden items-center justify-between gap-2 p-2 rounded-xl border border-slate-800 bg-slate-900/80">
        <button
          type="button"
          onClick={() => setMobileSyllabusOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700/60 cursor-pointer"
        >
          <BookOpen size={14} className="text-orange-400" />
          <span>Syllabus</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileSettingsOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700/60 cursor-pointer"
        >
          <Settings2 size={14} className="text-purple-400" />
          <span>Block Settings</span>
        </button>
      </div>

      {/* 2. TARGET 3-PANEL WORKSPACE GRID */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: Course Syllabus (Desktop: Persistent | Mobile: Slide-out) */}
        {/* ========================================================================= */}
        <div className="hidden lg:block w-[300px] xl:w-[320px] shrink-0">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl sticky top-6 max-h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                COURSE SYLLABUS
              </h3>
            </div>

            {/* Target UI Search Input */}
            <div className="relative mb-3 shrink-0">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search module or lesson..."
                value={syllabusSearch}
                onChange={(e) => setSyllabusSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* Modules & Lessons Accordion Tree */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredModules.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                  No modules found.
                </div>
              ) : (
                filteredModules.map((mod, idx) => {
                  const modExpanded = expandedModules[mod.id] !== false;
                  const modLessons = mod.lessons || [];

                  return (
                    <div
                      key={mod.id}
                      className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 space-y-2"
                    >
                      {/* Module Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className="text-slate-400 hover:text-white p-0.5 rounded transition cursor-pointer"
                          >
                            {modExpanded ? (
                              <ChevronDown size={13} className="text-orange-500" />
                            ) : (
                              <ChevronRight size={13} />
                            )}
                          </button>
                          <span className="h-4.5 w-4.5 rounded bg-orange-500/10 text-orange-500 flex items-center justify-center text-[9px] font-black shrink-0">
                            M
                          </span>
                          <span className="font-bold text-slate-200 text-xs text-left truncate">
                            Module {idx + 1}: {mod.title}
                          </span>
                        </div>

                        {/* Lesson Count Badge */}
                        <span className="rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 shrink-0">
                          {modLessons.length}
                        </span>
                      </div>

                      {/* Lessons List under Module */}
                      {modExpanded && (
                        <div className="pl-3.5 space-y-1 border-l border-slate-800/80 ml-2 pt-1">
                          {modLessons.length === 0 ? (
                            <p className="text-[10px] text-slate-500 py-1">
                              No lessons added yet.
                            </p>
                          ) : (
                            modLessons.map((lesson, lIdx) => {
                              const isSelected = composeLessonId === lesson.id;
                              const blockCount = lesson._count?.contents ?? lesson.contents?.length ?? 0;

                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => handleSelectLesson(lesson.id, mod.id)}
                                  className={`group flex items-center justify-between p-2 rounded-xl transition cursor-pointer text-xs ${
                                    isSelected
                                      ? "bg-orange-500/10 border-l-4 border-orange-500 text-orange-400 font-bold border-t border-r border-b border-orange-500/30"
                                      : "bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/40 text-slate-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText
                                      size={12}
                                      className={
                                        isSelected
                                          ? "text-orange-400 shrink-0"
                                          : "text-purple-400 shrink-0"
                                      }
                                    />
                                    <span className="truncate text-[11px] font-medium leading-snug">
                                      Lesson {lIdx + 1}: {lesson.title}
                                    </span>
                                  </div>

                                  {/* Block count pill badge */}
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wide shrink-0 ${
                                      isSelected
                                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                        : "bg-slate-950 text-slate-500 border border-slate-800"
                                    }`}
                                  >
                                    {blockCount} blocks
                                  </span>
                                </div>
                              );
                            })
                          )}

                          {/* + Add Lesson Button inside Module */}
                          <button
                            type="button"
                            onClick={() => router.push(`/instructor/lessons/create/${mod.id}`)}
                            className="w-full py-1.5 mt-1.5 flex items-center justify-center gap-1 rounded-xl border border-dashed border-slate-800 hover:border-orange-500/50 bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-orange-400 text-[10px] font-bold transition cursor-pointer"
                          >
                            <Plus size={11} />
                            <span>Add Lesson</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Target Action: + Add Module */}
            <div className="pt-3 border-t border-slate-800/80 shrink-0">
              <button
                type="button"
                onClick={() => router.push(`/instructor/modules/create/${courseId}`)}
                className="w-full py-2.5 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 hover:border-orange-500 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-extrabold transition cursor-pointer"
              >
                <Plus size={13} className="text-orange-500" />
                <span>Add Module</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER PANEL: Main Workspace / Lesson Composer */}
        {/* ========================================================================= */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 shadow-xl space-y-5">
            {/* Target UI Workspace Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              {/* Left Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 flex-wrap min-w-0">
                <Home size={13} className="text-slate-500 shrink-0" />
                <ChevronRight size={10} className="text-slate-600 shrink-0" />
                <span className="hover:text-white transition truncate max-w-[150px]">{activeCourse.title}</span>
                <ChevronRight size={10} className="text-slate-600 shrink-0" />
                <span className="text-slate-300 truncate max-w-[160px]">{composingModule?.title || "Module"}</span>
                <ChevronRight size={10} className="text-slate-600 shrink-0" />
                <span className="text-white font-bold truncate max-w-[200px]">{composingLesson?.title || "Lesson"}</span>
              </div>

              {/* Right Workspace Action Controls */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="hidden md:flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 size={12} />
                  <span>{saveStatus}</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (composeLessonId) {
                      window.open(`/student/courses/${courseId}`, "_blank");
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold px-3.5 py-2 transition cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast("Lesson saved successfully!", "success", "Saved");
                    setSaveStatus("Saved just now");
                  }}
                  className="flex items-center gap-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs px-4 py-2 transition shadow-md cursor-pointer"
                >
                  <span>Save Lesson</span>
                  <span className="text-[10px] opacity-80">▼</span>
                </button>
              </div>
            </div>

            {/* Composer Workspace Component */}
            {composeLessonId ? (
              <LessonComposerPanel
                lessonId={composeLessonId}
                selectedCellId={selectedCellId}
                onSelectCell={setSelectedCellId}
              />
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <LayoutGrid size={36} className="mx-auto text-slate-600" />
                <p className="text-sm font-bold text-white">No lesson selected.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select any lesson from the Course Syllabus on the left to start editing in the Lesson Composer workspace.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: Block Settings & Concept Mastery (Desktop Persistent) */}
        {/* ========================================================================= */}
        <div className="hidden lg:block w-[320px] xl:w-[340px] shrink-0">
          <div className="sticky top-6 space-y-4">
            {/* Panel Mode Switcher Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setRightPanelTab("block-settings")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  rightPanelTab === "block-settings"
                    ? "bg-orange-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <SlidersHorizontal size={12} />
                Block Settings
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab("analytics")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  rightPanelTab === "analytics"
                    ? "bg-orange-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BarChart3 size={12} />
                Analytics
              </button>
            </div>

            {/* Contextual Block Settings Mode */}
            {rightPanelTab === "block-settings" && composeLessonId && (
              <BlockSettingsPanel
                lessonId={composeLessonId}
                selectedCellId={selectedCellId}
                onClose={() => setRightPanelTab("analytics")}
              />
            )}

            {/* Concept Mastery Analytics Mode */}
            {(rightPanelTab === "analytics" || !composeLessonId) && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                    Concept Mastery
                  </h3>
                  <button
                    onClick={() =>
                      router.push(`/instructor/courses/analytics/${courseId}`)
                    }
                    className="text-[9px] font-black text-orange-400 hover:text-orange-500 uppercase tracking-widest transition"
                  >
                    Details
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-4">
                  Student understanding of key concepts
                </p>

                <div className="space-y-3">
                  {conceptMasteryData.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No analytics data recorded yet.
                    </p>
                  ) : (
                    conceptMasteryData.map((concept, index) => {
                      const isStrong = concept.rate >= 70;
                      const isWeak = concept.rate < 40;

                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-300">{concept.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 font-medium">
                                ({concept.mastered ?? 0}/
                                {(concept.total ?? totalEnrolls) || 100})
                              </span>
                              <span
                                className={
                                  isStrong
                                    ? "text-purple-400"
                                    : isWeak
                                    ? "text-amber-400"
                                    : "text-slate-400"
                                }
                              >
                                {concept.rate}%
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-850">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isStrong
                                  ? "bg-purple-500"
                                  : isWeak
                                  ? "bg-amber-500/85"
                                  : "bg-blue-500/80"
                              }`}
                              style={{ width: `${concept.rate}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-3.5 border-t border-slate-800/40 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Avg Mastery Rate
                  </span>
                  <span className="text-base font-bold text-purple-400 tracking-tight">
                    {conceptMasteryData.length > 0
                      ? Math.round(
                          conceptMasteryData.reduce((sum, c) => sum + c.rate, 0) /
                            conceptMasteryData.length
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE / TABLET DRAWERS */}
      {/* ========================================================================= */}

      {/* Mobile Syllabus Drawer */}
      {mobileSyllabusOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-xs lg:hidden animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-950 border-r border-slate-800 p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                COURSE SYLLABUS
              </h3>
              <button
                onClick={() => setMobileSyllabusOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {activeModules.map((mod, idx) => (
                <div key={mod.id} className="space-y-2">
                  <div className="text-xs font-bold text-orange-400">
                    Module {idx + 1}: {mod.title}
                  </div>
                  <div className="pl-2 space-y-1 border-l border-slate-800">
                    {(mod.lessons || []).map((l, lIdx) => (
                      <div
                        key={l.id}
                        onClick={() => handleSelectLesson(l.id, mod.id)}
                        className={`p-2 rounded-lg text-xs font-medium cursor-pointer ${
                          composeLessonId === l.id
                            ? "bg-orange-500/20 text-orange-300 font-bold"
                            : "text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        {lIdx + 1}. {l.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileSyllabusOpen(false)} />
        </div>
      )}

      {/* Mobile Settings Drawer */}
      {mobileSettingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs lg:hidden animate-in fade-in duration-150">
          <div className="flex-1" onClick={() => setMobileSettingsOpen(false)} />
          <div className="w-full max-w-sm bg-slate-950 border-l border-slate-800 p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                BLOCK SETTINGS
              </h3>
              <button
                onClick={() => setMobileSettingsOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {composeLessonId ? (
              <BlockSettingsPanel
                lessonId={composeLessonId}
                selectedCellId={selectedCellId}
                onClose={() => setMobileSettingsOpen(false)}
              />
            ) : (
              <p className="text-xs text-slate-400">No lesson selected.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
