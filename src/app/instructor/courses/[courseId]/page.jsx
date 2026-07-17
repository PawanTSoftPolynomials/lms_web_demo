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
  PlayCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import { useInstructorCourse } from "@/hooks/queries/instructor/useInstructorCourse";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useDeleteModule } from "@/hooks/queries/instructor/useDeleteModule";
import { useStudentEngagement, useConceptMastery } from "@/hooks/queries/instructor/useInstructorDashboard";

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

  const {
    data: engagementData = [],
    isLoading: engagementLoading,
  } = useStudentEngagement(courseId);

  const {
    data: conceptMasteryData = [],
    isLoading: masteryLoading,
  } = useConceptMastery(courseId);

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

  const handleDelete = async (e, mod) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this module and all its lessons?")) {
      return;
    }
    try {
      await deleteModuleMutation.mutateAsync(mod.id);
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
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-655 text-slate-950 font-extrabold uppercase text-xs tracking-wider transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const isPublished = course.status === "Published" || course.status === "PUBLISHED";
  const activeModules = modules || [];
  const lessonsCount = activeModules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0);
  const totalEnrolls = course.enrollments?.length ?? 0;

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      {/* 1. Course Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Logo */}
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

            {/* Header Details */}
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
                    {new Date(course.createdAt ?? "2026-07-01").toLocaleDateString("en-US", {
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
                    {new Date(course.updatedAt ?? "2026-07-03").toLocaleDateString("en-US", {
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
              onClick={() => router.push(`/instructor/courses/edit/${courseId}`)}
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
              onClick={() => router.push(`/instructor/modules/create/${courseId}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-white bg-orange-500 hover:bg-orange-655 rounded-xl shadow-sm transition"
            >
              <Plus size={12} />
              Add Module
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Statistics Cards */}
      <div className="grid gap-4 grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <p className="text-[9px] font-extrabold uppercase tracking-wider">Total Modules</p>
            <Layers size={16} className="text-orange-500" />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight text-white leading-none">
              {activeModules.length}
            </h4>
            <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Modules added</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <p className="text-[9px] font-extrabold uppercase tracking-wider">Total Lessons</p>
            <PlayCircle size={16} className="text-blue-500" />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight text-white leading-none">
              {lessonsCount}
            </h4>
            <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Lessons structured</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <p className="text-[9px] font-extrabold uppercase tracking-wider">Students Enrolled</p>
            <GraduationCap size={16} className="text-purple-500" />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight text-white leading-none">
              {totalEnrolls}
            </h4>
            <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Enrolled learners</p>
          </div>
        </div>
      </div>

      {/* 3. Spline Chart & Concept Mastery Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
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
              <AreaChart data={engagementData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} />
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
                <Area type="monotone" name="Active Students" dataKey="active" stroke="#a855f7" strokeWidth={2} fill="url(#colorActive)" />
                <Area type="monotone" name="New Enrollments" dataKey="enrollments" stroke="#f97316" strokeWidth={2} fill="url(#colorEnrollments)" />
                <Area type="monotone" name="Lesson Completion" dataKey="completions" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCompletions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Footers */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800/40 pt-4 text-center">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Active Students</p>
              <p className="mt-1 text-sm font-bold text-white">
                {Math.round(engagementData[engagementData.length - 1]?.active ?? 0)}
              </p>
              <p className="mt-0.5 text-[8px] font-bold text-emerald-400">↑ {totalEnrolls > 0 ? "15%" : "0%"}</p>
            </div>
            <div className="border-l border-slate-850">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">New Enrollments</p>
              <p className="mt-1 text-sm font-bold text-white">
                {Math.round(engagementData[engagementData.length - 1]?.enrollments ?? 0)}
              </p>
              <p className="mt-0.5 text-[8px] font-bold text-emerald-400">↑ {totalEnrolls > 0 ? "8%" : "0%"}</p>
            </div>
            <div className="border-l border-slate-850">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Lessons Done</p>
              <p className="mt-1 text-sm font-bold text-white">
                {Math.round(engagementData[engagementData.length - 1]?.completions ?? 0)}
              </p>
              <p className="mt-0.5 text-[8px] font-bold text-emerald-400">↑ {totalEnrolls > 0 ? "12%" : "0%"}</p>
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
                onClick={() => router.push(`/instructor/courses/analytics/${courseId}`)}
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
                        <span className="text-slate-500 font-medium">({concept.mastered ?? 0}/{(concept.total ?? totalEnrolls) || 100})</span>
                        <span className={isStrong ? "text-purple-400" : isWeak ? "text-amber-400" : "text-slate-400"}>
                          {concept.rate}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-850">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isStrong ? "bg-purple-500" : isWeak ? "bg-amber-500/85" : "bg-blue-500/80"
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
                ? Math.round(conceptMasteryData.reduce((sum, c) => sum + c.rate, 0) / conceptMasteryData.length)
                : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Course Curriculum Accordion Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-350 mb-4 pl-1">
          Course Syllabus
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="pb-3 pl-3">Module / Lesson</th>
                <th className="pb-3 text-center w-28">Items</th>
                <th className="pb-3 text-center w-28">Duration</th>
                <th className="pb-3 w-28">Status</th>
                <th className="pb-3 text-right pr-3 w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/40">
              {activeModules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
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
                      <tr className="border-b border-slate-800/40 hover:bg-slate-800/10 transition duration-200 align-middle">
                        <td className="py-3.5 pl-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleModule(mod.id)}
                              className="text-slate-500 hover:text-white p-1 rounded transition"
                            >
                              {modExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <button
                              onClick={() => router.push(`/instructor/courses/${courseId}/modules/${mod.id}`)}
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
                          {modLessons.length ? `${modLessons.length * 15} min` : "45 min"}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                              mod.isPublished
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {mod.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === mod.id ? null : mod.id);
                            }}
                            className="text-slate-500 hover:text-white transition p-1 hover:bg-slate-800/60 rounded-lg"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeDropdown === mod.id && (
                            <div className="absolute right-3 mt-1.5 w-32 rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-xl z-20 text-left">
                              <button
                                onClick={() => router.push(`/instructor/lessons/create/${mod.id}`)}
                                className="w-full text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-slate-805 px-2 py-1.5 rounded-lg transition text-left"
                              >
                                Add Lesson
                              </button>
                              <button
                                onClick={() => router.push(`/instructor/modules/edit/${mod.id}`)}
                                className="w-full text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-1.5 rounded-lg transition text-left"
                              >
                                Edit Module
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, mod)}
                                className="w-full text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-355 hover:bg-red-950/20 px-2 py-1.5 rounded-lg transition text-left"
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
                          <td colSpan={5} className="py-1 px-0 border-b border-slate-800/40 bg-slate-900/10">
                            <div className="space-y-1 py-1">
                              {!modLessons.length ? (
                                <div className="pl-12 py-3 text-[9px] text-slate-500 uppercase font-semibold">
                                  No lessons added to this module.
                                </div>
                              ) : (
                                modLessons.map((lesson, lIdx) => {
                                  const lessonExpanded = !!expandedLessons[lesson.id];
                                  const lessonContents = lesson.contents || [];

                                  return (
                                    <div key={lesson.id} className="space-y-1">
                                      <div className="flex items-center justify-between py-2 hover:bg-slate-800/20 rounded-lg transition">
                                        <div className="pl-8 flex items-center gap-2">
                                          <button
                                            onClick={() => toggleLesson(lesson.id)}
                                            className="text-slate-500 hover:text-white p-1 rounded transition"
                                          >
                                            {lessonExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                          </button>
                                          <FileText size={13} className="text-slate-400 shrink-0" />
                                          <button
                                            onClick={() => router.push(`/instructor/lessons/${lesson.id}`)}
                                            className="font-semibold text-slate-300 hover:text-orange-400 text-left transition text-xs"
                                          >
                                            Lesson {lIdx + 1}: {lesson.title}
                                          </button>
                                        </div>

                                        <div className="flex items-center justify-end w-full max-w-[290px] mr-12 text-right">
                                          <div className="w-24 text-center shrink-0">
                                            <span className="rounded-xl border border-slate-805 bg-slate-900/80 px-2.5 py-0.5 text-[9px] font-bold text-slate-400">
                                              {lessonContents.length} Contents
                                            </span>
                                          </div>
                                          <div className="w-24 text-center shrink-0 font-bold text-slate-500 text-[10px]">
                                            {lessonContents.length ? `${lessonContents.length * 15} min` : "0 min"}
                                          </div>
                                          <div className="w-28 text-left shrink-0 pl-1">
                                            <span
                                              className={`rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                                lesson.isPublished
                                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                              }`}
                                            >
                                              {lesson.isPublished ? "Published" : "Draft"}
                                            </span>
                                          </div>
                                          <div className="w-16 text-right shrink-0 pr-1.5 relative">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === lesson.id ? null : lesson.id);
                                              }}
                                              className="text-slate-650 hover:text-white transition"
                                            >
                                              <MoreVertical size={14} />
                                            </button>

                                            {activeDropdown === lesson.id && (
                                              <div className="absolute right-3 mt-1.5 w-32 rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-xl z-20 text-left">
                                                <button
                                                  onClick={() => router.push(`/instructor/lessons/edit/${lesson.id}`)}
                                                  className="w-full text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-1.5 rounded-lg transition text-left"
                                                >
                                                  Edit Lesson
                                                </button>
                                                <button
                                                  onClick={() => router.push(`/instructor/contents/create/${lesson.id}`)}
                                                  className="w-full text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-1.5 rounded-lg transition text-left"
                                                >
                                                  Add Content
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Lesson Contents Expanded Detail */}
                                      {lessonExpanded && (
                                        <div className="pl-16 pr-12 py-2 space-y-1.5">
                                          {lessonContents.length === 0 ? (
                                            <p className="text-[9px] text-slate-500 uppercase font-semibold">No contents added to this lesson.</p>
                                          ) : (
                                            lessonContents.map((content, cIdx) => (
                                              <div key={content.id} className="flex justify-between items-center bg-slate-950/20 border border-slate-850/55 rounded-xl p-2.5">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-[9px] text-slate-500 font-bold">Content {cIdx + 1}:</span>
                                                  <Link
                                                    href={`/instructor/contents/view/${content.id}`}
                                                    className="text-xs font-semibold text-slate-300 hover:text-orange-400 transition"
                                                  >
                                                    {content.title}
                                                  </Link>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                  <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                                                    {content.type}
                                                  </span>
                                                  <button
                                                    onClick={() => router.push(`/instructor/contents/edit/${content.id}`)}
                                                    className="text-[9px] text-slate-505 hover:text-orange-400 transition font-bold"
                                                  >
                                                    Edit
                                                  </button>
                                                </div>
                                              </div>
                                            ))
                                          )}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
