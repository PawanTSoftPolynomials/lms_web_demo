"use client";

import { useState, useEffect, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Plus,
  GraduationCap,
  Layers,
  Star,
  Calendar,
  Clock,
  User,
  MoreVertical,
  Settings,
  ChevronRight,
  ChevronDown,
  BookOpen,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  PlayCircle,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import { useInstructorCourse } from "@/hooks/queries/instructor/useInstructorCourse";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useDeleteModule } from "@/hooks/queries/instructor/useDeleteModule";
import { useDeleteCourse } from "@/hooks/queries/instructor/useDeleteCourse";
import { useDeleteLesson } from "@/hooks/queries/instructor/useDeleteLesson";
import { useDeleteContent } from "@/hooks/queries/instructor/useDeleteContent";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  useStudentEngagement,
  useConceptMastery,
} from "@/hooks/queries/instructor/useInstructorDashboard";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId;

  // React Query Hooks
  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useInstructorCourse(courseId);

  const {
    data: modules = [],
    isLoading: modulesLoading,
    isError: modulesError,
  } = useModules(courseId);

  const deleteModuleMutation = useDeleteModule();
  const deleteCourseMutation = useDeleteCourse();
  const deleteLessonMutation = useDeleteLesson();
  const deleteContentMutation = useDeleteContent();
  const queryClient = useQueryClient();

  const { data: engagementData = [], isLoading: engagementLoading } =
    useStudentEngagement(courseId);

  const { data: conceptMasteryData = [], isLoading: masteryLoading } =
    useConceptMastery(courseId);

  // States
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // handlers
  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const handleDelete = async (e, mod) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this module and all its lessons?",
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
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MODULES, courseId],
      });
    } catch (error) {
      console.error("Failed to delete lesson:", error);
    }
  };

  const handleDeleteContent = async (e, content, lessonId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    try {
      await deleteContentMutation.mutateAsync({ contentId: content.id, lessonId });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MODULES, courseId],
      });
    } catch (error) {
      console.error("Failed to delete content:", error);
    }
  };

  const handleCourseDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete this course? All associated modules, lessons, and content will be permanently removed.`,
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
  const lessonsCount = activeModules.reduce(
    (acc, m) => acc + (m.lessons?.length ?? 0),
    0,
  );
  const totalEnrolls =
    activeCourse._count?.enrollments ?? activeCourse.enrollments?.length ?? 0;

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      {/* 1. Course Header Card */}
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
                      activeCourse.createdAt ?? "2026-07-01",
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
                      activeCourse.updatedAt ?? "2026-07-20",
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
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl transition"
            >
              <Pencil size={12} />
              Edit Course
            </button>
            <button
              onClick={() => router.push(`/instructor/quizzes/${courseId}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl transition"
            >
              <ClipboardList size={12} />
              Manage Quizzes
            </button>
            <button
              onClick={() =>
                router.push(`/instructor/modules/create/${courseId}`)
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-white bg-orange-500 hover:bg-orange-655 rounded-xl shadow-sm transition"
            >
              <Plus size={12} />
              Add Module
            </button>
            <button
              onClick={handleCourseDelete}
              disabled={deleteCourseMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 rounded-xl transition disabled:opacity-50"
            >
              <Trash2 size={12} />
              {deleteCourseMutation.isPending ? "Deleting..." : "Delete Course"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <p className="text-[9px] font-extrabold uppercase tracking-wider">
              Total Modules
            </p>
            <Layers size={16} className="text-orange-500" />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight text-white leading-none">
              {activeModules.length}
            </h4>
            <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Modules added
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <p className="text-[9px] font-extrabold uppercase tracking-wider">
              Total Lessons
            </p>
            <PlayCircle size={16} className="text-blue-500" />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight text-white leading-none">
              {lessonsCount}
            </h4>
            <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Lessons structured
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <p className="text-[9px] font-extrabold uppercase tracking-wider">
              Students Enrolled
            </p>
            <GraduationCap size={16} className="text-purple-500" />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight text-white leading-none">
              {totalEnrolls}
            </h4>
            <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Enrolled learners
            </p>
          </div>
        </div>
      </div>
      {/* 3. Two-Column Curriculum & Analytics Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column: Course Syllabus (Primary Section, 70% width style) */}
        <div className="flex-1 min-w-0 w-full">
          {/* 4. Course Curriculum Accordion Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-350 mb-4 pl-1">
          Course Syllabus
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="pb-3 pl-3">Module / Lesson / Content</th>
                <th className="pb-3 text-center w-28">Items / Type</th>
                <th className="pb-3 text-center w-28">Duration</th>
                <th className="pb-3 w-28">Status</th>
                <th className="pb-3 text-left w-36 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/40">
              {activeModules.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-wider"
                  >
                    No Modules Structuring This Course.
                  </td>
                </tr>
              ) : (
                activeModules.map((mod, idx) => {
                  const modExpanded = !!expandedModules[mod.id];
                  const modLessons = mod.lessons || [];

                  return (
                    <Fragment key={mod.id}>
                      {/* Module Header Row */}
                      <tr className="border-b border-slate-800/40 hover:bg-slate-800/10 bg-slate-900/10 transition duration-150 align-middle">
                        <td className="py-2.5 pl-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleModule(mod.id)}
                              className="text-slate-500 hover:text-white p-0.5 rounded transition cursor-pointer"
                            >
                              {modExpanded ? (
                                <ChevronDown size={14} className="text-orange-500" />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                            <span className="h-5 w-5 rounded bg-orange-500/10 text-orange-500 flex items-center justify-center text-[10px] font-black shrink-0">
                              M
                            </span>
                            <button
                              onClick={() =>
                                router.push(
                                  `/instructor/courses/${courseId}/modules/${mod.id}`,
                                )
                              }
                              className="font-extrabold text-slate-100 hover:text-orange-400 text-left transition text-xs cursor-pointer"
                            >
                              Module {idx + 1}: {mod.title}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="rounded-full border border-slate-805 bg-slate-950/80 px-2.5 py-0.5 text-[9px] font-bold text-slate-400">
                            {modLessons.length} Lessons
                          </span>
                        </td>
                        <td className="py-2.5 text-center font-extrabold text-slate-400 text-xs">
                          {modLessons.length
                            ? `${modLessons.length * 15} min`
                            : "45 min"}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider border ${
                              mod.isPublished
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {mod.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="py-2.5 text-left">
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              onClick={() =>
                                router.push(
                                  `/instructor/lessons/create/${mod.id}`,
                                )
                              }
                              title="Add Lesson"
                              className="p-1 rounded-lg border border-slate-800 bg-slate-955/40 text-orange-400 hover:text-orange-300 hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/instructor/courses/${courseId}/modules/${mod.id}`,
                                )
                              }
                              title="View Module"
                              className="p-1 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/instructor/modules/edit/${mod.id}`,
                                )
                              }
                              title="Edit Module"
                              className="p-1 rounded-lg border border-slate-800 bg-slate-955/40 text-slate-400 hover:text-white hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, mod)}
                              title="Delete Module"
                              className="p-1 rounded-lg border border-red-500/30 bg-slate-955/40 text-red-405 hover:text-red-300 hover:bg-red-955/20 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Render Lessons if module is expanded */}
                      {modExpanded && (
                        modLessons.length === 0 ? (
                          <tr className="border-b border-slate-800/20 bg-slate-950/5">
                            <td colSpan={5} className="py-2.5 pl-10 text-[9px] text-slate-500 uppercase font-semibold">
                              No lessons added to this module.
                            </td>
                          </tr>
                        ) : (
                          modLessons.map((lesson, lIdx) => {
                            const lessonExpanded = !!expandedLessons[lesson.id];
                            const lessonContents = lesson.contents || [];

                            return (
                              <Fragment key={lesson.id}>
                                {/* Lesson Row */}
                                <tr className="border-b border-slate-800/30 hover:bg-slate-800/20 bg-slate-950/5 transition duration-150 align-middle">
                                  <td className="py-2 pl-8">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => toggleLesson(lesson.id)}
                                        className="text-slate-500 hover:text-white p-0.5 rounded transition cursor-pointer"
                                      >
                                        {lessonExpanded ? (
                                          <ChevronDown size={12} className="text-orange-500" />
                                        ) : (
                                          <ChevronRight size={12} />
                                        )}
                                      </button>
                                      <FileText size={13} className="text-purple-400 shrink-0" />
                                      <button
                                        onClick={() =>
                                          router.push(
                                            `/instructor/lessons/${lesson.id}`,
                                          )
                                        }
                                        className="font-bold text-slate-300 hover:text-orange-400 text-left transition text-xs cursor-pointer"
                                      >
                                        Lesson {lIdx + 1}: {lesson.title}
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-2 text-center">
                                    <span className="rounded-full border border-slate-805 bg-slate-950/80 px-2.5 py-0.5 text-[8.5px] font-bold text-slate-400">
                                      {lessonContents.length} Contents
                                    </span>
                                  </td>
                                  <td className="py-2 text-center font-extrabold text-slate-400 text-xs">
                                    {lessonContents.length
                                      ? `${lessonContents.length * 15} min`
                                      : "0 min"}
                                  </td>
                                  <td className="py-2">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider border ${
                                        lesson.isPublished
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      }`}
                                    >
                                      {lesson.isPublished ? "Published" : "Draft"}
                                    </span>
                                  </td>
                                  <td className="py-2 text-left">
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <button
                                        onClick={() =>
                                          router.push(
                                            `/instructor/contents/create/${lesson.id}`,
                                          )
                                        }
                                        title="Add Content"
                                        className="p-1 rounded-lg border border-slate-800 bg-slate-955/40 text-orange-400 hover:text-orange-300 hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                                      >
                                        <Plus size={12} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          router.push(
                                            `/instructor/lessons/${lesson.id}`,
                                          )
                                        }
                                        title="View Lesson"
                                        className="p-1 rounded-lg border border-slate-800 bg-slate-955/40 text-slate-400 hover:text-white hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                                      >
                                        <Eye size={12} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          router.push(
                                            `/instructor/lessons/edit/${lesson.id}`,
                                          )
                                        }
                                        title="Edit Lesson"
                                        className="p-1 rounded-lg border border-slate-800 bg-slate-955/40 text-slate-400 hover:text-white hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                                      >
                                        <Pencil size={12} />
                                      </button>
                                      <button
                                        onClick={(e) =>
                                          handleDeleteLesson(e, lesson, mod.id)
                                        }
                                        title="Delete Lesson"
                                        className="p-1 rounded-lg border border-red-500/30 bg-slate-955/40 text-red-400 hover:text-red-300 hover:bg-red-955/20 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Render Contents if lesson is expanded */}
                                {lessonExpanded && (
                                  lessonContents.length === 0 ? (
                                    <tr className="border-b border-slate-800/10 bg-slate-950/10">
                                      <td colSpan={5} className="py-2 pl-16 text-[9px] text-slate-500 uppercase font-semibold">
                                        No contents added to this lesson.
                                      </td>
                                    </tr>
                                  ) : (
                                    lessonContents.map((content, cIdx) => {
                                      let ContentIcon = HelpCircle;
                                      let iconColor = "text-slate-400";
                                      
                                      const typeUpper = (content.type || "").toUpperCase();
                                      if (typeUpper.includes("VIDEO")) {
                                        ContentIcon = PlayCircle;
                                        iconColor = "text-red-400";
                                      } else if (typeUpper.includes("QUIZ") || typeUpper.includes("TEST")) {
                                        ContentIcon = ClipboardList;
                                        iconColor = "text-emerald-450";
                                      } else if (typeUpper.includes("DOC") || typeUpper.includes("PDF") || typeUpper.includes("FILE")) {
                                        ContentIcon = FileText;
                                        iconColor = "text-blue-450";
                                      }

                                      return (
                                        <tr key={content.id} className="border-b border-slate-800/10 hover:bg-slate-800/10 bg-slate-950/10 transition duration-150 align-middle">
                                          <td className="py-1.5 pl-14">
                                            <div className="flex items-center gap-2">
                                              <ContentIcon size={12} className={`${iconColor} shrink-0`} />
                                              <span className="text-[9px] text-slate-500 font-bold shrink-0">
                                                Content {cIdx + 1}:
                                              </span>
                                              <Link
                                                href={`/instructor/contents/view/${content.id}`}
                                                className="text-xs font-semibold text-slate-300 hover:text-orange-400 transition"
                                              >
                                                {content.title}
                                              </Link>
                                            </div>
                                          </td>
                                          <td className="py-1.5 text-center">
                                            <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[8px] font-bold text-slate-450 uppercase tracking-wide">
                                              {content.type}
                                            </span>
                                          </td>
                                          <td className="py-1.5 text-center font-extrabold text-slate-500 text-xs">
                                            —
                                          </td>
                                          <td className="py-1.5">
                                            <span className="rounded-full px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider bg-slate-950/40 text-slate-500 border border-slate-800/40">
                                              Active
                                            </span>
                                          </td>
                                          <td className="py-1.5 text-left">
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                              <button
                                                onClick={() =>
                                                  router.push(
                                                    `/instructor/contents/view/${content.id}`,
                                                  )
                                                }
                                                title="View Content"
                                                className="p-1 rounded-lg border border-slate-800 bg-slate-955/40 text-slate-400 hover:text-white hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                                              >
                                                <Eye size={12} />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  router.push(
                                                    `/instructor/contents/edit/${content.id}`,
                                                  )
                                                }
                                                title="Edit Content"
                                                className="p-1 rounded-lg border border-slate-800 bg-slate-955/40 text-slate-400 hover:text-white hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                                              >
                                                <Pencil size={12} />
                                              </button>
                                              <button
                                                onClick={(e) =>
                                                  handleDeleteContent(e, content, lesson.id)
                                                }
                                                title="Delete Content"
                                                className="p-1 rounded-lg border border-red-500/30 bg-slate-955/40 text-red-400 hover:text-red-300 hover:bg-red-955/20 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )
                                )}
                              </Fragment>
                            );
                          })
                        )
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
        </div>

        {/* Right Column: Analytics Side Widgets (30% width style) */}
        <div className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-6">
                  {/* Student Engagement AreaChart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-350 mb-1">
            Student Engagement
          </h3>
          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-4">
            Cohort activity footprint trends
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={engagementData}
                margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorEnrollments"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorCompletions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#f8fafc",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconSize={8}
                  iconType="circle"
                  style={{ fontSize: "9px", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  name="Active Students"
                  dataKey="active"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="url(#colorActive)"
                />
                <Area
                  type="monotone"
                  name="New Enrollments"
                  dataKey="enrollments"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#colorEnrollments)"
                />
                <Area
                  type="monotone"
                  name="Lesson Completion"
                  dataKey="completions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorCompletions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Footers */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800/40 pt-4 text-center">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                Active Students
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                {Math.round(
                  engagementData[engagementData.length - 1]?.active ?? 0,
                )}
              </p>
              <p className="mt-0.5 text-[8px] font-bold text-emerald-400">
                ↑ {totalEnrolls > 0 ? "15%" : "0%"}
              </p>
            </div>
            <div className="border-l border-slate-850">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                New Enrollments
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                {Math.round(
                  engagementData[engagementData.length - 1]?.enrollments ?? 0,
                )}
              </p>
              <p className="mt-0.5 text-[8px] font-bold text-emerald-400">
                ↑ {totalEnrolls > 0 ? "8%" : "0%"}
              </p>
            </div>
            <div className="border-l border-slate-850">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                Lessons Done
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                {Math.round(
                  engagementData[engagementData.length - 1]?.completions ?? 0,
                )}
              </p>
              <p className="mt-0.5 text-[8px] font-bold text-emerald-400">
                ↑ {totalEnrolls > 0 ? "12%" : "0%"}
              </p>
            </div>
          </div>
        </div>
                  {/* Concept Mastery Analytics Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-350">
                Concept Mastery
              </h3>
              <button
                onClick={() =>
                  router.push(`/instructor/courses/analytics/${courseId}`)
                }
                className="text-[9px] font-black text-orange-400 hover:text-orange-500 uppercase tracking-widest transition"
              >
                View Details
              </button>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-4">
              Student understanding of key concepts in this course
            </p>

            <div className="space-y-3">
              {conceptMasteryData.map((concept, index) => {
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
                    {/* Progress Bar */}
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
              })}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-800/40 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Average Mastery Rate
            </span>
            <span className="text-lg font-bold text-purple-400 tracking-tight">
              {conceptMasteryData.length > 0
                ? Math.round(
                    conceptMasteryData.reduce((sum, c) => sum + c.rate, 0) /
                      conceptMasteryData.length,
                  )
                : 0}
              %
            </span>
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
