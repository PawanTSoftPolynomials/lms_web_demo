"use client";

import Link from "next/link";
import { PlayCircle, Award, ClipboardList, Target, BookOpen, ChevronRight } from "lucide-react";

import useAssignments from "@/hooks/queries/student/useAssignments";
import useQuizzes from "@/hooks/queries/student/useQuizzes";
import useUpcomingTasks from "@/hooks/queries/student/useUpcomingTasks";

export default function MyCourseCard({ enrollment }) {
    const {
        course,
    } = enrollment;

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
            icon: PlayCircle,
            color: "text-orange-500",
            border: "border-orange-500/15",
            bg: "bg-orange-500/5",
            status: `${totalLessons} Lessons`
        },
        {
            label: "Quizzes",
            href: `/student/quizzes/${course.id}`,
            icon: Award,
            color: "text-purple-500",
            border: "border-purple-500/15",
            bg: "bg-purple-500/5",
            status: `${totalQuizzes} Quizzes`
        },
        {
            label: "Assignments",
            href: `/student/assignments`,
            icon: ClipboardList,
            color: "text-blue-500",
            border: "border-blue-500/15",
            bg: "bg-blue-500/5",
            status: `${pendingAssignments} Pending`
        },
        {
            label: "Test",
            href: `/student/quizzes/${course.id}`,
            icon: Target,
            color: "text-emerald-500",
            border: "border-emerald-500/15",
            bg: "bg-emerald-500/5",
            status: `${pendingTests} Test${pendingTests !== 1 ? "s" : ""}`
        },
        {
            label: "Homework",
            href: `/student/assignments`,
            icon: BookOpen,
            color: "text-pink-500",
            border: "border-pink-500/15",
            bg: "bg-pink-500/5",
            status: `${pendingHomeworks} Pending`
        }
    ];

    return (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm flex flex-col justify-between hover:border-orange-500/20 hover:-translate-y-0.5 transition duration-300">
            {/* Center-aligned Card Header */}
            <div className="text-center pb-5">
                <h3 className="text-lg font-black text-white tracking-tight leading-snug truncate" title={course.title}>
                    {course.title}
                </h3>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mt-1">
                    5 Learning Resources
                </span>
            </div>

            {/* List of Navigation Links */}
            <div className="divide-y divide-slate-800/80 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/20">
                {links.map((link, idx) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={idx}
                            href={link.href}
                            className="flex items-center justify-between px-4 py-3 hover:bg-slate-900/50 transition group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${link.border} ${link.bg} ${link.color}`}>
                                    <Icon size={18} className="stroke-[2]" />
                                </div>
                                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">
                                    {link.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-400 transition">
                                    {link.status}
                                </span>
                                <ChevronRight size={13} className="text-slate-650 group-hover:text-orange-500 transition-colors" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}