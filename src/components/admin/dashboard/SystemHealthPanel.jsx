"use client";

import { Activity, ExternalLink, ChevronRight } from "lucide-react";

export default function SystemHealthPanel({ healthData, onOpenAction }) {
  const { uptime = "99.98%", services = [] } = healthData || {};

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "healthy":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </span>
        );
      case "warning":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Warning
          </span>
        );
      case "critical":
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            Critical
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              System Health & Infrastructure Monitor
              <span className="text-xs font-semibold text-emerald-400">({uptime} Uptime)</span>
            </h3>
            <p className="text-[11px] text-slate-400">Real-time status across 8 microservice clusters</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "system_status_details", title: "Full System Status & Infrastructure Logs", data: healthData })}
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
        >
          View System Status <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Services Status Grid */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {services.map((svc, idx) => (
          <div
            key={idx}
            onClick={() => onOpenAction({ type: "service_diagnostic", title: `Diagnostic: ${svc.name}`, data: svc })}
            className="group cursor-pointer rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 transition hover:border-cyan-500/40 hover:bg-slate-950"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">{svc.name}</span>
              {getStatusBadge(svc.status)}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{svc.latency ? `Latency: ${svc.latency}` : svc.usage ? `Usage: ${svc.usage}` : svc.queueDelay ? `Queue: ${svc.queueDelay}` : "Operational"}</span>
              <span className="font-semibold text-slate-300">{svc.load || svc.deliveryRate || svc.uptime || ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
