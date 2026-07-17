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

// Recharts mockup datasets for Student Engagement
const engagementData = [
  { name: "Apr 20", active: 160, enrollments: 80, completions: 50 },
  { name: "Apr 27", active: 155, enrollments: 85, completions: 52 },
  { name: "May 04", active: 165, enrollments: 95, completions: 48 },
  { name: "May 11", active: 195, enrollments: 110, completions: 55 },
  { name: "May 18", active: 220, enrollments: 125, completions: 58 },
];

// Concept Mastery dataset
const conceptMasteryList = [
  {
    name: "Servlet Lifecycle",
    mastered: 176,
    total: 248,
    rate: 71,
    level: "strong",
  },
  { name: "JSP & EL", mastered: 162, total: 248, rate: 65, level: "strong" },
  {
    name: "EJB Architecture",
    mastered: 148,
    total: 248,
    rate: 60,
    level: "neutral",
  },
  {
    name: "JPA & Hibernate",
    mastered: 138,
    total: 248,
    rate: 56,
    level: "neutral",
  },
  { name: "Transactions", mastered: 124, total: 248, rate: 50, level: "weak" },
  {
    name: "Security Concepts",
    mastered: 112,
    total: 248,
    rate: 45,
    level: "weak",
  },
];

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Accordion open/close states
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const handleDelete = async (e, module) => {
    e.stopPropagation();
    setActiveDropdown(null);
    const confirmed = window.confirm(`Delete "${module.title}"?`);
    if (!confirmed) return;

    try {
      await deleteModuleMutation.mutateAsync(module.id);
    } catch (error) {
      console.error(error);
    }
  };

  if (courseLoading || modulesLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader />
      </div>
    );
  }

  if (courseError || modulesError || !course) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-sm">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Failed to load course details
          </h2>
          <p className="text-slate-400 mb-6">
            Please check your database connection or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold uppercase text-xs tracking-wider transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const isPublished =
    course.status === "Published" || course.status === "PUBLISHED";

  // Use the course's nested modules if available, otherwise fallback to modules list
  const activeModules =
    course.modules && course.modules.length > 0 ? course.modules : modules;

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      {/* 1. Compact Course Header Card (110-130px height block) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Small Logo Square (64px) */}
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-white border border-slate-200 shrink-0 flex items-center justify-center p-1.5 shadow-sm">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <GraduationCap className="text-3xl text-slate-500" />
              )}
            </div>

            {/* Header Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="rounded-xl bg-purple-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-400 border border-purple-500/20">
                  {course.category}
                </span>
                <span
                  className={`rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                    isPublished
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {course.status}
                </span>
              </div>

              <h1 className="text-lg font-bold text-white tracking-tight leading-snug truncate">
                {course.title}
              </h1>

              {/* Sub-Metadata Footer Row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <User size={12} className="text-purple-400" />
                  <span>Instructor: {course.creator?.name ?? "John Doe"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-purple-400" />
                  <span>
                    Created:{" "}
                    {new Date(
                      course.createdAt ?? "2026-07-01",
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
                      course.updatedAt ?? "2026-07-03",
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/courses/${course.id}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/40 px-3.5 py-2 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <Eye size={13} />
              <span>Preview Course</span>
            </Link>

            <Link
              href={`/instructor/courses/edit/${course.id}`}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-orange-600 transition cursor-pointer"
            >
              <Pencil size={13} />
              <span>Edit Course</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Columns (65% / 35% Layout Grid) */}
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-6">
        {/* Left Column (65% Width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Statistics Sub-Grid (4 Cards) */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {/* Card 1: Students */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4.5 shadow-sm hover:border-slate-700/60 transition duration-305">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Total Students
                </p>
                <div className="rounded-lg bg-purple-500/10 p-2 border border-purple-500/20">
                  <GraduationCap size={15} className="text-purple-400" />
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-white">248</h3>
              <p className="mt-1.5 text-[8px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
                <span>↑ 12%</span>
                <span className="text-slate-500">from last month</span>
              </p>
            </div>

            {/* Card 2: Modules */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4.5 shadow-sm hover:border-slate-700/60 transition duration-305">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Total Modules
                </p>
                <div className="rounded-lg bg-orange-500/10 p-2 border border-orange-500/20">
                  <Layers size={15} className="text-orange-400" />
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {activeModules.length}
              </h3>
              <p className="mt-1.5 text-[8px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                <span>— No change</span>
              </p>
            </div>

            {/* Card 3: Lessons */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4.5 shadow-sm hover:border-slate-700/60 transition duration-305">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Total Lessons
                </p>
                <div className="rounded-lg bg-blue-500/10 p-2 border border-blue-500/20">
                  <BookOpen size={15} className="text-blue-400" />
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {activeModules.reduce(
                  (acc, curr) =>
                    acc + (curr.lessons?.length || curr.lessonsCount || 0),
                  0,
                ) || 24}
              </h3>
              <p className="mt-1.5 text-[8px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
                <span>↑ 8%</span>
                <span className="text-slate-500">from last month</span>
              </p>
            </div>

            {/* Card 4: Completion Rate */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4.5 shadow-sm hover:border-slate-700/60 transition duration-305">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Completion Rate
                </p>
                <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
                  <Percent size={15} className="text-emerald-400" />
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-white">68%</h3>
              <p className="mt-1.5 text-[8px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
                <span>↑ 4%</span>
                <span className="text-slate-500">from last month</span>
              </p>
            </div>
          </div>

          {/* Modules Table Directory Card (Rebuilt into Nested Accordion Tree Table) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-350">
                    Modules
                  </h3>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-extrabold text-slate-400 border border-slate-700/60">
                    {activeModules.length}
                  </span>
                </div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  Organize and manage your course content.
                </p>
              </div>

              <Link
                href={`/instructor/courses/${courseId}/modules/create`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-slate-950 text-[10px] font-black uppercase tracking-widest transition cursor-pointer"
              >
                <Plus size={12} />
                <span>Add Module</span>
              </Link>
            </div>

            {/* Tree Accordion Content */}
            {!activeModules.length ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-slate-800/80">
                <Layers size={36} className="mx-auto text-slate-600 mb-3" />
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                  No Modules Found
                </h4>
                <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">
                  Get started by creating your first course module.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs table-auto align-middle">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="py-3 pl-3"># MODULE NAME</th>
                      <th className="py-3 text-center w-24">LESSONS</th>
                      <th className="py-3 text-center w-24">DURATION</th>
                      <th className="py-3 w-28">STATUS</th>
                      <th className="py-3 pr-3 text-right w-16">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeModules.map((mod, idx) => {
                      const modExpanded = !!expandedModules[mod.id];
                      const modPublished = mod.isPublished;
                      const modLessons = mod.lessons || [];
                      const durationStr = modLessons.length
                        ? `${modLessons.length * 15} min`
                        : "45 min";

                      return (
                        <Fragment key={mod.id}>
                          {/* Module Accordion Header Row */}
                          <tr
                            key={mod.id}
                            className="border-b border-slate-800/40 hover:bg-slate-800/10 transition duration-200 align-middle"
                          >
                            <td className="py-3.5 pl-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleModule(mod.id)}
                                  className="text-slate-500 hover:text-white p-1 rounded transition"
                                >
                                  {modExpanded ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronRight size={14} />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/instructor/courses/${courseId}/modules/${mod.id}`,
                                    )
                                  }
                                  className="font-extrabold text-white hover:text-orange-400 text-left transition"
                                >
                                  Module {idx + 1}: {mod.title}
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 text-center">
                              <span className="rounded-xl border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                                {modLessons.length} Lessons
                              </span>
                            </td>
                            <td className="py-3.5 text-center font-extrabold text-slate-400">
                              {durationStr}
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`inline-flex rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                  modPublished
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {modPublished ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className="py-3.5 pr-3 text-right relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(
                                    activeDropdown === mod.id ? null : mod.id,
                                  );
                                }}
                                className="text-slate-500 hover:text-white transition p-1 hover:bg-slate-800/60 rounded-lg"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* Dropdown Menu */}
                              {activeDropdown === mod.id && (
                                <div className="absolute right-3 mt-1.5 w-32 rounded-xl border border-slate-800 bg-slate-955 p-1.5 shadow-xl z-20 text-left">
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/instructor/courses/${courseId}/quizzes`,
                                      )
                                    }
                                    className="w-full text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition"
                                  >
                                    Quizzes
                                  </button>
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/instructor/courses/${courseId}/modules/edit/${mod.id}`,
                                      )
                                    }
                                    className="w-full text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => handleDelete(e, mod)}
                                    className="w-full text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/20 px-2.5 py-1.5 rounded-lg transition"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>

                          {/* Expanded Lessons sub-list */}
                          {modExpanded && (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-1 px-0 border-b border-slate-800/40 bg-slate-900/10"
                              >
                                <div className="space-y-1 py-1">
                                  {!modLessons.length ? (
                                    <div className="pl-12 py-3 text-[10px] text-slate-500 uppercase font-semibold">
                                      No lessons added to this module.
                                    </div>
                                  ) : (
                                    modLessons.map((lesson, lIdx) => {
                                      const lessonExpanded =
                                        !!expandedLessons[lesson.id];
                                      const lessonContents =
                                        lesson.contents || [
                                          // Mock fallback contents if DB has none, matching user mockup
                                          {
                                            id: `${lesson.id}-c1`,
                                            title: "Servlets Basics",
                                            type: "DOCUMENT",
                                          },
                                          {
                                            id: `${lesson.id}-c2`,
                                            title: "JSP Basics Quiz",
                                            type: "QUIZ",
                                          },
                                          {
                                            id: `${lesson.id}-c3`,
                                            title: "JSP Practice",
                                            type: "ASSIGNMENT",
                                          },
                                        ];

                                      return (
                                        <div
                                          key={lesson.id}
                                          className="space-y-1"
                                        >
                                          {/* Lesson Row */}
                                          <div className="flex items-center justify-between py-2 hover:bg-slate-800/20 rounded-lg transition">
                                            {/* Lesson Title column */}
                                            <div className="pl-8 flex items-center gap-2">
                                              <button
                                                onClick={() =>
                                                  toggleLesson(lesson.id)
                                                }
                                                className="text-slate-500 hover:text-white p-1 rounded transition"
                                              >
                                                {lessonExpanded ? (
                                                  <ChevronDown size={12} />
                                                ) : (
                                                  <ChevronRight size={12} />
                                                )}
                                              </button>
                                              <FileText
                                                size={13}
                                                className="text-slate-400 shrink-0"
                                              />
                                              <button
                                                onClick={() =>
                                                  router.push(
                                                    `/instructor/courses/${courseId}/modules/${mod.id}/lessons/${lesson.id}`,
                                                  )
                                                }
                                                className="font-semibold text-slate-300 hover:text-orange-400 text-left transition"
                                              >
                                                Lesson {lIdx + 1}:{" "}
                                                {lesson.title}
                                              </button>
                                            </div>

                                            {/* Lesson Metadata columns mapped to headers */}
                                            <div className="flex items-center justify-end w-full max-w-[290px] mr-12 text-right">
                                              <div className="w-24 text-center shrink-0">
                                                <span className="rounded-xl border border-slate-805 bg-slate-900/80 px-2.5 py-0.5 text-[9px] font-bold text-slate-400">
                                                  {lessonContents.length}{" "}
                                                  Contents
                                                </span>
                                              </div>
                                              <div className="w-24 text-center shrink-0 font-bold text-slate-500 text-[10px]">
                                                45 min
                                              </div>
                                              <div className="w-28 text-left shrink-0 pl-1">
                                                <span className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase text-amber-400 tracking-wider">
                                                  Draft
                                                </span>
                                              </div>
                                              <div className="w-16 text-right shrink-0 pr-1.5 relative">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(
                                                      activeDropdown ===
                                                        lesson.id
                                                        ? null
                                                        : lesson.id,
                                                    );
                                                  }}
                                                  className="text-slate-600 hover:text-white transition"
                                                >
                                                  <MoreVertical size={14} />
                                                </button>

                                                {/* Lesson Dropdown */}
                                                {activeDropdown ===
                                                  lesson.id && (
                                                  <div className="absolute right-3 mt-1.5 w-32 rounded-xl border border-slate-800 bg-slate-955 p-1.5 shadow-xl z-20 text-left">
                                                    <button
                                                      onClick={() =>
                                                        router.push(
                                                          `/instructor/courses/${courseId}/modules/${mod.id}/lessons/edit/${lesson.id}`,
                                                        )
                                                      }
                                                      className="w-full text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition"
                                                    >
                                                      Edit
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        router.push(
                                                          `/instructor/courses/${courseId}/modules/${mod.id}/lessons/${lesson.id}/contents/create`,
                                                        )
                                                      }
                                                      className="w-full text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition"
                                                    >
                                                      Add Content
                                                    </button>
                                                    <button
                                                      onClick={() => {}}
                                                      className="w-full text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-955 px-2.5 py-1.5 rounded-lg transition"
                                                    >
                                                      Delete
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Nested Content Row List */}
                                          {lessonExpanded && (
                                            <div className="pl-16 ml-3 border-l border-slate-800 space-y-2 py-1 mt-0.5 mb-2">
                                              {lessonContents.map((content) => {
                                                const isQuiz =
                                                  content.type === "QUIZ" ||
                                                  content.title
                                                    .toLowerCase()
                                                    .includes("quiz");
                                                const isAssignment =
                                                  content.type ===
                                                    "ASSIGNMENT" ||
                                                  content.title
                                                    .toLowerCase()
                                                    .includes("assignment") ||
                                                  content.title
                                                    .toLowerCase()
                                                    .includes("practice");

                                                let icon = (
                                                  <FileText
                                                    size={12}
                                                    className="text-slate-500 shrink-0"
                                                  />
                                                );
                                                let labelPrefix = "Content";

                                                if (isQuiz) {
                                                  icon = (
                                                    <HelpCircle
                                                      size={12}
                                                      className="text-slate-500 shrink-0"
                                                    />
                                                  );
                                                  labelPrefix = "Quiz";
                                                } else if (isAssignment) {
                                                  icon = (
                                                    <ClipboardList
                                                      size={12}
                                                      className="text-slate-500 shrink-0"
                                                    />
                                                  );
                                                  labelPrefix = "Assignment";
                                                }

                                                // Format name: Strip prefix if user has added it
                                                const cleanTitle =
                                                  content.title.replace(
                                                    /^(content|quiz|assignment):\s*/i,
                                                    "",
                                                  );

                                                return (
                                                  <button
                                                    key={content.id}
                                                    onClick={() =>
                                                      router.push(
                                                        `/instructor/courses/${courseId}/modules/${mod.id}/lessons/${lesson.id}/contents/${content.id}`,
                                                      )
                                                    }
                                                    className="flex items-center gap-2.5 py-1 text-slate-400 hover:text-orange-400 text-left transition cursor-pointer"
                                                  >
                                                    {icon}
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                                                      {labelPrefix}:{" "}
                                                      {cleanTitle}
                                                    </span>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (35% Width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Student Engagement Chart Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-350">
                Student Engagement
              </h3>
              <div className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-955 px-2.5 py-1.5 rounded-xl border border-slate-800/60 cursor-pointer hover:text-slate-300 transition">
                <span>Last 30 days</span>
                <ChevronDown size={12} className="text-slate-600" />
              </div>
            </div>

            {/* Recharts Curved Spline Chart */}
            <div className="h-[210px] w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={engagementData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorActive"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#a855f7"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorEnrollments"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#f97316"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorCompletions"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#475569"
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                    style={{ fontSize: "9px", fontWeight: "bold" }}
                  />
                  <YAxis
                    stroke="#475569"
                    tickLine={false}
                    axisLine={false}
                    dx={-8}
                    style={{ fontSize: "9px", fontWeight: "bold" }}
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
                    fillOpacity={1}
                    fill="url(#colorActive)"
                  />
                  <Area
                    type="monotone"
                    name="New Enrollments"
                    dataKey="enrollments"
                    stroke="#f97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEnrollments)"
                  />
                  <Area
                    type="monotone"
                    name="Lesson Completion"
                    dataKey="completions"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompletions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart KPI Footers */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800/40 pt-4 text-center">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                  Active Students
                </p>
                <p className="mt-1 text-sm font-bold text-white">212</p>
                <p className="mt-0.5 text-[8px] font-bold text-emerald-400">
                  ↑ 15%
                </p>
              </div>
              <div className="border-l border-slate-850">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                  New Enrollments
                </p>
                <p className="mt-1 text-sm font-bold text-white">96</p>
                <p className="mt-0.5 text-[8px] font-bold text-emerald-400">
                  ↑ 8%
                </p>
              </div>
              <div className="border-l border-slate-850">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                  Lessons Done
                </p>
                <p className="mt-1 text-sm font-bold text-white">156</p>
                <p className="mt-0.5 text-[8px] font-bold text-emerald-400">
                  ↑ 12%
                </p>
              </div>
            </div>
          </div>

          {/* Concept Mastery Analytics Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
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

            {/* List of concept mastery horizontal lines */}
            <div className="space-y-3.5">
              {conceptMasteryList.map((concept, index) => {
                const isStrong = concept.level === "strong";
                const isWeak = concept.level === "weak";

                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-300">{concept.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">
                          ({concept.mastered}/{concept.total})
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

                    {/* Progress Bar Container */}
                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-850">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isStrong
                            ? "bg-purple-500"
                            : isWeak
                              ? "bg-amber-500/80"
                              : "bg-slate-400/80"
                        }`}
                        style={{ width: `${concept.rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Average Mastery Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-800/40 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Average Mastery Rate
              </span>
              <span className="text-xl font-bold text-purple-400 tracking-tight">
                57%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
