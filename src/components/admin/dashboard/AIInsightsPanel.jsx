"use client";

import { Sparkles, ArrowRight, ChevronRight } from "lucide-react";

export default function AIInsightsPanel({ insights = [], onOpenAction }) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-purple-900/40 bg-slate-900/90 p-5 shadow-xl transition hover:border-purple-800/60">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/30">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Operational Insights
              <span className="inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">
                4 Active Signals
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Predictive intelligence driving administrative interventions</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "ai_full_report", title: "AI Predictive Analytics Hub" })}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
        >
          AI Engine <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Insights Grid */}
      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex flex-col justify-between gap-3 rounded-lg border border-slate-800/90 bg-slate-950/70 p-3.5 transition hover:border-purple-500/40 hover:bg-slate-950"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/20">
                  {insight.impact}
                </span>
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <h4 className="text-xs font-bold text-white mt-2">{insight.title}</h4>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-3 leading-relaxed">{insight.description}</p>
            </div>

            <button
              onClick={() => onOpenAction({ type: insight.actionType, title: insight.title, data: insight })}
              className="flex items-center justify-center gap-1.5 w-full rounded-md border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/20 hover:text-white transition shadow-sm"
            >
              <span>{insight.actionText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
