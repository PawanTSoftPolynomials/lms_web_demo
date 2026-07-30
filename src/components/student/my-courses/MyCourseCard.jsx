"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  ChevronRight,
  CheckCircle,
  BarChart2,
  CalendarCheck,
  Activity,
  HelpCircle,
  Sparkles
} from "lucide-react";
import ResponsiveQuizPresenter from "@/components/student/quizzes/ResponsiveQuizPresenter";

export default function MyCourseCard({ enrollment }) {
    const {
        course,
    } = enrollment;

    const [quizModalOpen, setQuizModalOpen] = useState(false);

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

    const quizOptions = [
        {
            id: "new",
            title: "New Quizzes",
            desc: "View and attempt recently assigned quizzes for this course.",
            href: `/student/quizzes?courseId=${course.id}&tab=new`,
            icon: ClipboardList,
            border: "border-purple-500/20",
            bg: "bg-purple-500/10",
            color: "text-purple-400"
        },
        {
            id: "completed",
            title: "Completed",
            desc: "Review your submitted quizzes, scores, and correct answers.",
            href: `/student/quizzes?courseId=${course.id}&tab=completed`,
            icon: CheckCircle,
            border: "border-emerald-500/20",
            bg: "bg-emerald-500/10",
            color: "text-emerald-400"
        },
        {
            id: "self_generate",
            title: "Self Generate",
            desc: "Create custom practice quizzes from your course question banks.",
            href: `/student/quizzes?courseId=${course.id}&tab=self_generate`,
            icon: Sparkles,
            border: "border-amber-500/20",
            bg: "bg-amber-500/10",
            color: "text-amber-400"
        },
        {
            id: "reports",
            title: "Reports",
            desc: "Analyze your average scores, passing rates, and performance trends.",
            href: `/student/quizzes?courseId=${course.id}&tab=reports`,
            icon: BarChart2,
            border: "border-blue-500/20",
            bg: "bg-blue-500/10",
            color: "text-blue-400"
        }
    ];

    return (
        <>
            <div className="max-w-sm w-full rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 sm:p-6 shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-slate-700 hover:-translate-y-1 select-none">
                {/* Center-aligned Card Header */}
                <div className="pb-3 text-center border-b border-slate-800/50">
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug truncate" title={course.title}>
                        {course.title}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                        Theory, Practical
                    </span>
                </div>

                {/* Single Column Layout formatted to fit card tightly without unused space */}
                <div className="space-y-1 my-3">
                    {links.map((link, idx) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={idx}
                                href={link.href}
                                onClick={(e) => handleRowClick(e, link.label)}
                                className="flex items-center gap-2.5 sm:gap-3 text-xs font-bold text-slate-200 hover:text-white transition group py-2 px-2.5 sm:px-3 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 min-h-[44px]"
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

            {/* Responsive Quiz Presenter: Desktop = Modal, Mobile = Full-Screen Dedicated View */}
            <ResponsiveQuizPresenter
                isOpen={quizModalOpen}
                onClose={() => setQuizModalOpen(false)}
                title="Quiz Center"
                subtitle={`Select an option for ${course.title}.`}
            >
                {/* MOBILE VIEW (< sm): 2 x 2 Responsive Action Grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:hidden">
                    {quizOptions.map((opt) => {
                        const Icon = opt.icon;
                        return (
                            <Link
                                key={opt.id}
                                href={opt.href}
                                onClick={() => setQuizModalOpen(false)}
                                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:bg-slate-850 hover:border-slate-700 active:scale-[0.97] active:border-orange-500 transition-all duration-150 min-h-[100px] text-center shadow-md select-none group cursor-pointer"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${opt.border} ${opt.bg} ${opt.color} mb-2 shadow-sm shrink-0 group-active:border-orange-400`}>
                                    <Icon size={20} className="stroke-[2]" />
                                </div>
                                <span className="text-xs font-black text-white tracking-tight leading-tight">
                                    {opt.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* DESKTOP VIEW (>= sm): Standard Detailed Card Grid */}
                <div className="hidden sm:grid grid-cols-2 gap-4 text-left">
                    {quizOptions.map((opt) => {
                        const Icon = opt.icon;
                        return (
                            <Link
                                key={opt.id}
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
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
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
            </ResponsiveQuizPresenter>
        </>
    );
}