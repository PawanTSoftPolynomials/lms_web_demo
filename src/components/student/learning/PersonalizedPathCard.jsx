"use client";

import { Route, Clock3 } from "lucide-react";

import useProfile from "@/hooks/queries/student/useProfile";
import useLearningPath from "@/hooks/queries/student/useLearningPath";

const MODE_STYLES = {
    SMART_REVISION: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    STANDARD_LEARNING: "bg-slate-800 text-slate-300 border-slate-700",
    DEEP_LEARNING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const MODE_LABEL = {
    SMART_REVISION: "Smart Revision",
    STANDARD_LEARNING: "Standard Learning",
    DEEP_LEARNING: "Deep Learning",
};

const MAX_ITEMS = 5;

/**
 * Deliverable #7 ("Personalized Learning Path") of the AI Student Entry
 * Phase — every upcoming lesson annotated with its AI-recommended learning
 * mode, time, and reason, when personalization data exists for this
 * course. Renders nothing when Learning Path hasn't calculated yet, or
 * when its active course doesn't match the one being viewed — absence is
 * normal here (a brand new enrollment, or a course the student isn't
 * currently focused on), not an error.
 */
export default function PersonalizedPathCard({ courseId }) {
    const { data: profile } = useProfile();
    const studentId = profile?.studentProfile?.id;
    const { data: path, isLoading, isError } = useLearningPath(studentId);

    if (isLoading || isError || !path || path.currentCourseId !== courseId) return null;

    const items = (path.recommendedLearningOrder || []).slice(0, MAX_ITEMS);
    if (items.length === 0) return null;

    return (
        <div className="rounded-3xl border border-slate-800/80 bg-[#0d0e16]/60 backdrop-blur-md shadow-xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Route size={14} className="text-orange-500" />
                Your Personalized Path
            </h4>

            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.lessonId} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 shrink-0">
                                <Clock3 size={10} />
                                {item.recommendedMinutes ?? item.estimatedMinutes}m
                            </span>
                        </div>

                        {item.recommendedMode && (
                            <div className="flex items-center gap-2">
                                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${MODE_STYLES[item.recommendedMode] || MODE_STYLES.STANDARD_LEARNING}`}>
                                    {MODE_LABEL[item.recommendedMode] || item.recommendedMode}
                                </span>
                            </div>
                        )}

                        {item.aiPersonalizationReason && (
                            <p className="text-[10px] text-slate-500 leading-relaxed">{item.aiPersonalizationReason}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
