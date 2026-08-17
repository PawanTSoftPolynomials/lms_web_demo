"use client";

import { Sparkles, Clock3, TrendingUp } from "lucide-react";

import useCourseState from "@/hooks/queries/student/useCourseState";

/**
 * Surfaces the AI Student Entry Phase's per-course baseline (Deliverable
 * #8's "Student Dashboard"). Renders nothing when no entry assessment has
 * been completed for this course yet — absence is normal, not an error,
 * and this card is additive/non-blocking to the rest of the learning page.
 */
export default function CoursePersonalizationCard({ courseId }) {
    const { data: courseState, isLoading, isError } = useCourseState(courseId);

    if (isLoading || isError || !courseState) return null;

    const { knowledgeLevel, strongConcepts = [], weakConcepts = [], timeSavedMinutes = 0, personalizedTotalMinutes = 0 } = courseState;

    return (
        <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-orange-300 flex items-center gap-2">
                    <Sparkles size={14} />
                    AI Personalization
                </h4>
                <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-[10px] font-bold text-orange-300">
                    {knowledgeLevel}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
                    <p className="flex items-center justify-center gap-1 text-sm font-bold text-white">
                        <Clock3 size={12} className="text-orange-400" />
                        {personalizedTotalMinutes}m
                    </p>
                    <p className="text-[9px] uppercase tracking-wide text-slate-500 mt-0.5">Personalized Duration</p>
                </div>
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
                    <p className="flex items-center justify-center gap-1 text-sm font-bold text-emerald-400">
                        <TrendingUp size={12} />
                        {timeSavedMinutes}m
                    </p>
                    <p className="text-[9px] uppercase tracking-wide text-slate-500 mt-0.5">Time Saved</p>
                </div>
            </div>

            {(strongConcepts.length > 0 || weakConcepts.length > 0) && (
                <p className="text-[11px] leading-relaxed text-slate-400">
                    {strongConcepts.length > 0 && (
                        <>
                            Strong in <span className="text-slate-200 font-medium">{strongConcepts.slice(0, 2).join(", ")}</span>.{" "}
                        </>
                    )}
                    {weakConcepts.length > 0 && (
                        <>
                            Extra focus on <span className="text-slate-200 font-medium">{weakConcepts.slice(0, 2).join(", ")}</span>.
                        </>
                    )}
                </p>
            )}
        </div>
    );
}
