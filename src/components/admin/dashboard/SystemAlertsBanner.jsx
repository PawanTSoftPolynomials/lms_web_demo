"use client";

import { AlertTriangle, AlertCircle, ShieldAlert, ArrowRight, X } from "lucide-react";

export default function SystemAlertsBanner({ alerts = [], onOpenAction }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert) => {
        const isCritical = alert.type === "critical";

        return (
          <div
            key={alert.id}
            className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all shadow-md ${
              isCritical
                ? "border-rose-500/40 bg-rose-950/25 text-rose-200 ring-1 ring-rose-500/20"
                : "border-amber-500/40 bg-amber-950/25 text-amber-200 ring-1 ring-amber-500/20"
            }`}
          >
            {/* Left: Icon & Alert info */}
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  isCritical ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {isCritical ? <ShieldAlert className="h-4 w-4 animate-pulse" /> : <AlertTriangle className="h-4 w-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                      isCritical ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {alert.type} SYSTEM ALERT
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">{alert.time}</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-1">{alert.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{alert.message}</p>
              </div>
            </div>

            {/* Right: Resolution Trigger */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() =>
                  onOpenAction({
                    type: alert.actionType || "alert_resolve",
                    title: `Resolve Alert: ${alert.title}`,
                    data: alert
                  })
                }
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                  isCritical
                    ? "bg-rose-600 text-white hover:bg-rose-500"
                    : "bg-amber-600 text-white hover:bg-amber-500"
                }`}
              >
                <span>{alert.actionText || "Investigate Alert"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
