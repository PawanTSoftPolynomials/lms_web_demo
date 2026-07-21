import Link from "next/link";
import { ArrowRight, BookOpen, Clock, PlayCircle } from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ContinueLearningCard({ enrollment }) {
    if (!enrollment) return null;

    const { course, enrolledAt, progress = 0 } = enrollment;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
            
            <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/25 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                        Resume Spotlight
                    </span>
                    <span className="text-xs text-slate-450 font-bold">{progress}% Complete</span>
                </div>

                <div>
                    <h2 className="text-xl font-black text-white tracking-tight leading-snug">
                        {course.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-xs text-slate-400 leading-relaxed">
                        {course.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Enrolled: {new Date(enrolledAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-md space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-855">
                        <div
                            className="bg-orange-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto">
                <Link href={`/student/learn/${course.id}`}>
                    <button className="w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-655 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm">
                        Continue Learning
                        <ArrowRight size={14} />
                    </button>
                </Link>
            </div>
        </div>
    );
}