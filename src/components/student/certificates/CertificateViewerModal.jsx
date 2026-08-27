"use client";

import { Award } from "lucide-react";

export default function CertificateViewerModal({ cert, onClose, onPrint }) {
  if (!cert) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Close Backdrop click */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl z-10 flex flex-col gap-6 animate-in zoom-in-95 duration-200">

        {/* Modal Actions */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/60 print:hidden">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award size={16} className="text-orange-500" />
            Certificate Preview
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="px-3.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shadow-md shadow-orange-500/15 transition-all"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="
          relative
          w-full
          aspect-[1.414/1]
          border-[8px]
          border-double
          border-orange-500/40
          bg-slate-950
          p-12
          rounded-xl
          flex
          flex-col
          justify-between
          align-center
          text-center
          overflow-hidden
          shadow-inner
          print:border-slate-300
          print:bg-white
          print:text-black
        ">
          {/* Decorative Corner Borders */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-orange-500/30 print:border-slate-300 pointer-events-none" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-orange-500/30 print:border-slate-300 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-orange-500/30 print:border-slate-300 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-orange-500/30 print:border-slate-300 pointer-events-none" />

          {/* Certificate Header */}
          <div className="space-y-1">
            <div className="flex justify-center text-orange-500 print:text-slate-600 mb-2">
              <Award size={40} className="drop-shadow-[0_0_10px_rgba(249,115,22,0.3)] print:drop-shadow-none" />
            </div>
            <h1 className="text-xl font-bold tracking-widest uppercase text-slate-200 print:text-black">
              Certificate of Completion
            </h1>
            <p className="text-[10px] tracking-wider uppercase text-slate-400 print:text-slate-500 font-semibold">
              Orange Tree Learning Management System
            </p>
          </div>

          {/* Body */}
          <div className="space-y-4">
            <p className="text-[11px] italic text-slate-400 print:text-slate-500">
              This credential is proudly presented to
            </p>
            <h2 className="text-3xl font-extrabold text-white print:text-black border-b border-slate-800/80 pb-2 max-w-md mx-auto tracking-wide font-serif">
              {cert.user?.name}
            </h2>
            <p className="text-[11px] text-slate-400 print:text-slate-600 max-w-lg mx-auto leading-relaxed">
              for successfully satisfying all academic specifications, coursework modules, and final assessments for the study of
            </p>
            <h3 className="text-xl font-bold text-orange-400 print:text-slate-800 tracking-wide leading-tight">
              {cert.course?.title}
            </h3>
          </div>

          {/* Footer signatures & dates */}
          <div className="flex justify-between items-end border-t border-slate-800 print:border-slate-200 pt-6 max-w-xl mx-auto w-full text-left text-[10px]">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Credential ID</span>
              <span className="font-mono text-slate-300 print:text-black font-semibold">{cert.certificateNo}</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-16 h-0.5 bg-slate-800 print:bg-slate-300 mb-1" />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Authorized Seal</span>
              <span className="font-serif italic text-slate-300 print:text-black font-semibold">Orange Tree LMS</span>
            </div>

            <div className="flex flex-col gap-1 text-right">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Date of Issue</span>
              <span className="text-slate-300 print:text-black font-semibold">
                {new Date(cert.issuedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
