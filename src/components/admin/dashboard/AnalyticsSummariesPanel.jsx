"use client";

import { BarChart3, TrendingUp, AlertTriangle, ArrowRight, BookOpen, Users, Award } from "lucide-react";

export default function AnalyticsSummariesPanel({ summaries = [], onOpenAction }) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/30">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Operational Analytics & Intelligence</h3>
            <p className="text-[11px] text-slate-400">Contextual summaries driving administrative actions</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "full_analytics_hub", title: "Institutional Analytics & Data Intelligence Hub" })}
          className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
        >
          Analytics Hub <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Summaries Grid */}
      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {summaries.map((sum, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 transition hover:border-slate-700 hover:bg-slate-950"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-orange-400 uppercase">
                  {sum.category}
                </span>
                <span className="text-xs font-extrabold text-white">{sum.metric}</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-2">{sum.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">{sum.subtitle}</p>
            </div>

            <button
              onClick={() => onOpenAction({ type: "view_report", title: `Report: ${sum.title}`, data: sum })}
              className="flex items-center justify-between text-xs font-bold text-orange-400 hover:text-orange-300 border-t border-slate-800/80 pt-2 transition"
            >
              <span>{sum.linkText || "View Report →"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
