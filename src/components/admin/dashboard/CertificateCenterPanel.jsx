"use client";

import { Award, ArrowRight, ChevronRight } from "lucide-react";

export default function CertificateCenterPanel({ certificateData, onOpenAction }) {
  const {
    awaitingApproval = 0,
    generatedToday = 0,
    verificationRequests = 0,
    recentCertificates = []
  } = certificateData || {};

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/30">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Certificate Center</h3>
            <p className="text-[11px] text-slate-400">Digital signatures & verification registry</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAction({ type: "all_certificates", title: "Institutional Certificate Authority Portal" })}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
        >
          Open Verification Queue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-950 p-2.5 text-center border border-slate-800">
          <p className="text-[10px] text-slate-400">Awaiting Verification</p>
          <p className="text-base font-extrabold text-purple-400">{awaitingApproval}</p>
        </div>
        <div className="rounded-lg bg-slate-950 p-2.5 text-center border border-slate-800">
          <p className="text-[10px] text-slate-400">Issued Today</p>
          <p className="text-base font-extrabold text-emerald-400">{generatedToday}</p>
        </div>
        <div className="rounded-lg bg-slate-950 p-2.5 text-center border border-slate-800">
          <p className="text-[10px] text-slate-400">Verifications</p>
          <p className="text-base font-extrabold text-amber-400">{verificationRequests}</p>
        </div>
      </div>

      {/* Queue items */}
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {recentCertificates.map((cert) => (
          <div
            key={cert.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 transition hover:border-slate-700"
          >
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase">{cert.status}</span>
              <h4 className="text-xs font-bold text-white mt-0.5">{cert.recipient}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-1">{cert.title}</p>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <button
                onClick={() => onOpenAction({ type: "approve_certificate", title: `Review Certificate for ${cert.recipient}`, data: cert })}
                className="flex items-center gap-1.5 rounded border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-500/20 transition"
              >
                <span>Review Certificate</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
