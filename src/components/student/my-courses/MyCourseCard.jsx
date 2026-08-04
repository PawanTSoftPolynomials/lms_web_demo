"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  ChevronRight,
  CheckCircle,
  BarChart2,
  CalendarCheck,
  Activity,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  User,
  MessageSquare
} from "lucide-react";
import ResponsiveQuizPresenter from "@/components/student/quizzes/ResponsiveQuizPresenter";

export default function MyCourseCard({ enrollment }) {
    const {
        course,
    } = enrollment;

    const [quizModalOpen, setQuizModalOpen] = useState(false);
    // Mobile & tablet: tapping the compact card opens a dedicated full-screen
    // action menu instead of cramming all 8 links into the small card.
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [menuOpen]);

    const links = [
        {
            label: "My Learning",
            href: `/student/learn/${course.id}`,
            icon: CalendarCheck,
            iconColor: "text-blue-400",
        },
        {
            label: "AI Entry Assessment",
            href: `/student/entry-assessment/${course.id}`,
            icon: Sparkles,
            iconColor: "text-orange-400",
        },
        {
            label: "My Homework",
            href: `/student/assignments?course=${encodeURIComponent(course.title)}`,
            icon: CalendarCheck,
            iconColor: "text-orange-400",
        },
        {
            label: "My Assignment",
            href: `/student/assignments?course=${encodeURIComponent(course.title)}`,
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

    // Mobile full-screen menu: same destinations/behavior as `links` above,
    // with a subtitle per row and distinct icon backgrounds — richer chrome
    // that only makes sense at full-screen size, not in the compact card.
    const mobileLinks = [
        {
            label: "My Learning",
            subtitle: "Continue your learning",
            href: `/student/learn/${course.id}`,
            icon: CalendarCheck,
            iconColor: "text-blue-400",
            iconBg: "bg-blue-500/15",
        },
        {
            label: "AI Entry Assessment",
            subtitle: "Personalize this course to your knowledge level",
            href: `/student/entry-assessment/${course.id}`,
            icon: Sparkles,
            iconColor: "text-orange-400",
            iconBg: "bg-orange-500/15",
        },
        {
            label: "My Homework",
            subtitle: "View and submit homework",
            href: `/student/assignments?course=${encodeURIComponent(course.title)}`,
            icon: CalendarCheck,
            iconColor: "text-orange-400",
            iconBg: "bg-orange-500/15",
        },
        {
            label: "My Assignment",
            subtitle: "View and submit assignments",
            href: `/student/assignments?course=${encodeURIComponent(course.title)}`,
            icon: ClipboardList,
            iconColor: "text-purple-400",
            iconBg: "bg-purple-500/15",
        },
        {
            label: "My Test",
            subtitle: "Take tests and quizzes",
            href: `/student/quizzes?courseId=${course.id}`,
            icon: CalendarCheck,
            iconColor: "text-emerald-400",
            iconBg: "bg-emerald-500/15",
        },
        {
            label: "My Assessment Activity",
            subtitle: "Track your assessment activities",
            href: `/student/quizzes?courseId=${course.id}`,
            icon: CalendarCheck,
            iconColor: "text-pink-400",
            iconBg: "bg-pink-500/15",
        },
        {
            label: "Feedback",
            subtitle: "View your feedback",
            href: `/student/feedback`,
            icon: MessageSquare,
            iconColor: "text-rose-400",
            iconBg: "bg-rose-500/15",
        },
        {
            label: "CO Outcome Summary",
            subtitle: "View CO outcomes and analytics",
            href: `/student/progress`,
            icon: BarChart2,
            iconColor: "text-amber-400",
            iconBg: "bg-amber-500/15",
        },
        {
            label: "Check Activity Status",
            subtitle: "Track all your activities",
            href: `/student/achievements`,
            icon: Activity,
            iconColor: "text-cyan-400",
            iconBg: "bg-cyan-500/15",
        },
    ];

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
            {/* Desktop (xl+): unchanged dense card, all 8 links inline */}
            <div className="hidden xl:flex max-w-sm w-full rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 sm:p-6 shadow-lg flex-col justify-between transition-all duration-300 hover:border-slate-700 hover:-translate-y-1 select-none">
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

            {/* Mobile & tablet: compact tap card — just enough to identify the
                course; the 8 actions live in the full-screen menu instead of
                being crammed into this card. */}
            <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="xl:hidden w-full rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-lg flex items-center justify-between gap-3 transition-colors duration-200 hover:border-slate-700 cursor-pointer text-left min-h-[44px]"
            >
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-white tracking-tight leading-snug truncate" title={course.title}>
                        {course.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Theory, Practical
                    </span>
                </div>
                <ChevronRight size={18} className="shrink-0 text-slate-500" />
            </button>

            {/* Full-screen course action menu — mobile & tablet only. Opened by
                tapping the compact card above; closes back to this exact list,
                no route change (matches the Quiz full-screen pattern). */}
            {menuOpen && (
                <div className="xl:hidden fixed inset-0 z-[70] bg-[#07080f] overflow-y-auto">
                    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-800/60 bg-[#07080f]/95 px-4 py-4 backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(false)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors duration-200 cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg font-black text-white tracking-tight truncate">
                                {course.title}
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 truncate">
                                Theory, Practical
                            </p>
                        </div>
                        <Link
                            href="/student/settings"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors duration-200"
                        >
                            <User size={18} />
                        </Link>
                    </div>

                    <div className="space-y-2 px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                        {mobileLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => handleRowClick(e, link.label)}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 min-h-[44px] transition-colors duration-200 hover:border-slate-700"
                                >
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${link.iconBg} ${link.iconColor}`}>
                                        <Icon size={20} className="stroke-[2]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold text-white truncate">{link.label}</h3>
                                        <p className="text-xs leading-tight text-slate-400 truncate">{link.subtitle}</p>
                                    </div>
                                    <ChevronRight size={18} className="shrink-0 text-slate-500" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

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