"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlayCircle,
  Award,
  ClipboardList,
  Target,
  BookOpen,
  ChevronRight,
  X,
  CheckCircle,
  PenTool,
  BarChart2,
  CalendarCheck,
  Activity,
  HelpCircle
} from "lucide-react";

import useAssignments from "@/hooks/queries/student/useAssignments";
import useQuizzes from "@/hooks/queries/student/useQuizzes";
import useUpcomingTasks from "@/hooks/queries/student/useUpcomingTasks";

const CARD_PALETTES = [
    { bg: "bg-gradient-to-br from-cyan-500 to-sky-600" },
    { bg: "bg-gradient-to-br from-rose-400 to-orange-500" },
    { bg: "bg-gradient-to-br from-amber-500 to-yellow-600" },
    { bg: "bg-gradient-to-br from-pink-500 to-rose-600" },
    { bg: "bg-gradient-to-br from-purple-500 to-indigo-600" },
    { bg: "bg-gradient-to-br from-emerald-500 to-teal-600" }
];

export default function MyCourseCard({ enrollment, index = 0 }) {
    const {
        course,
    } = enrollment;

    const [quizModalOpen, setQuizModalOpen] = useState(false);

    // Close modal on escape press
    useEffect(() => {
        if (!quizModalOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setQuizModalOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [quizModalOpen]);

    // Fetch dynamic query details
    const { data: assignments = [] } = useAssignments();
    const { data: quizzes = [] } = useQuizzes();
    const { data: upcomingTasksList = [] } = useUpcomingTasks();

    // 1. Lessons
    const totalLessons = course.lessons ?? 0;
    
    // 2. Quizzes
    const courseQuizzes = quizzes.filter(q => q.courseId === course.id);
    const totalQuizzes = courseQuizzes.length;

    // 3. Assignments
    const courseAssignments = assignments.filter(a => a.courseId === course.id);
    const pendingAssignments = courseAssignments.filter(a => a.status !== "Submitted" && a.status !== "Graded").length;

    // 4. Test
    const courseTests = upcomingTasksList.filter(t => t.courseId === course.id && (t.type || "").toUpperCase() === "EXAM");
    const pendingTests = courseTests.length;

    // 5. Homework
    const pendingHomeworks = courseAssignments.filter(a => a.status !== "Submitted").length;

    const links = [
        {
            label: "My Learning",
            href: `/student/learn/${course.id}`,
            icon: CalendarCheck,
            iconColor: "text-blue-400",
        },
        {
            label: "My Homework",
            href: `/student/assignments`,
            icon: CalendarCheck,
            iconColor: "text-orange-400",
        },
        {
            label: "My Assignment",
            href: `/student/assignments`,
            icon: CalendarCheck,
            iconColor: "text-purple-400",
        },
        {
            label: "My Test",
            href: `/student/quizzes?courseId=${course.id}`,
            icon: CalendarCheck,
            iconColor: "text-emerald-400",
        },
        {
            label: "My Assessment Activity",
            href: `/student/quizzes?courseId=${course.id}`,
            icon: CalendarCheck,
            iconColor: "text-pink-400",
        },
        {
            label: "Feedback",
            href: `/student/feedback`,
            icon: CalendarCheck,
            iconColor: "text-rose-400",
        },
        {
            label: "CO Outcome Summary",
            href: `/student/progress`,
            icon: BarChart2,
            iconColor: "text-amber-400",
        },
        {
            label: "Check Activity Status",
            href: `/student/achievements`,
            icon: Activity,
            iconColor: "text-cyan-400",
        }
    ];

    const handleRowClick = (e, label) => {
        if (label === "My Test" || label === "My Assessment Activity") {
            e.preventDefault();
            setQuizModalOpen(true);
        }
    };

    return (
        <>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-slate-700 hover:-translate-y-1 select-none">
                {/* Center-aligned Card Header */}
                <div className="pb-3 text-center">
                    <h3 className="text-base font-black text-white tracking-tight leading-snug truncate" title={course.title}>
                        {course.title}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                        Theory, Practical
                    </span>
                </div>

                {/* List of Navigation Links */}
                <div className="space-y-2.5 my-3">
                    {links.map((link, idx) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={idx}
                                href={link.href}
                                onClick={(e) => handleRowClick(e, link.label)}
                                className="flex items-center gap-3 text-xs font-bold text-slate-200 hover:text-white transition group py-0.5"
                            >
                                <Icon size={16} className={`${link.iconColor} shrink-0 stroke-[2]`} />
                                <span className="truncate">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Right Help Icon */}
                <div className="flex justify-end pt-1 text-slate-500 hover:text-white transition select-none">
                    <HelpCircle size={16} />
                </div>
            </div>

            {/* Centered Modal only for Course Card under My Courses */}
            {quizModalOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-955/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setQuizModalOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-[0_20px_80px_rgba(0,0,0,0.65)] flex flex-col p-6 sm:p-8 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                            <div className="text-left">
                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">Quiz Center</h2>
                                <p className="text-xs text-slate-400 mt-2">Select an option for {course.title}.</p>
                            </div>
                            <button
                                onClick={() => setQuizModalOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Clickable Card Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-left">
                            {[
                                {
                                    title: "New Quizzes",
                                    desc: "View and attempt recently assigned quizzes for this course.",
                                    href: `/student/quizzes?courseId=${course.id}&tab=new`,
                                    icon: ClipboardList,
                                    border: "border-purple-500/15",
                                    bg: "bg-purple-500/5",
                                    color: "text-purple-500"
                                },
                                {
                                    title: "Completed Quizzes",
                                    desc: "Review your submitted quizzes, scores, and correct answers.",
                                    href: `/student/quizzes?courseId=${course.id}&tab=completed`,
                                    icon: CheckCircle,
                                    border: "border-emerald-500/15",
                                    bg: "bg-emerald-500/5",
                                    color: "text-emerald-500"
                                },
                                {
                                    title: "Self-Generated Quizzes",
                                    desc: "Create custom practice quizzes from your course question banks.",
                                    href: `/student/quizzes?courseId=${course.id}&tab=self_generate`,
                                    icon: PenTool,
                                    border: "border-amber-500/15",
                                    bg: "bg-amber-500/5",
                                    color: "text-amber-500"
                                },
                                {
                                    title: "Quiz Reports",
                                    desc: "Analyze your average scores, passing rates, and performance trends.",
                                    href: `/student/quizzes?courseId=${course.id}&tab=reports`,
                                    icon: BarChart2,
                                    border: "border-blue-500/15",
                                    bg: "bg-blue-500/5",
                                    color: "text-blue-500"
                                }
                            ].map((opt, idx) => {
                                const Icon = opt.icon;
                                return (
                                    <Link
                                        key={idx}
                                        href={opt.href}
                                        onClick={() => setQuizModalOpen(false)}
                                        className="flex flex-col justify-between p-5 rounded-2xl border border-slate-800/85 bg-slate-950/20 hover:bg-slate-950/60 hover:border-slate-700/80 hover:-translate-y-0.5 transition duration-300 group cursor-pointer"
                                    >
                                        <div className="space-y-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${opt.border} ${opt.bg} ${opt.color}`}>
                                                <Icon size={18} className="stroke-[2]" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-white transition">
                                                    {opt.title}
                                                </h4>
                                                <p className="text-[11px] text-slate-450 leading-relaxed font-semibold mt-1">
                                                    {opt.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-800/40">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-orange-500 transition-colors flex items-center gap-1">
                                                Open <ChevronRight size={10} className="stroke-[2.5]" />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}