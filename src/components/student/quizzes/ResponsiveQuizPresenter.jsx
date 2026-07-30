"use client";

import { useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";

/**
 * ResponsiveQuizPresenter
 * 
 * Shared presentation layer wrapper for Quiz modals and Quiz experiences.
 * - Desktop (>= lg): Renders as a centered Modal / Dialog overlay.
 * - Mobile (< lg): Renders as a full-screen dedicated View with a prominent Back button,
 *   preserving the underlying lesson/video context when closed.
 */
export default function ResponsiveQuizPresenter({
  isOpen,
  onClose,
  title = "Quiz",
  subtitle,
  children,
}) {
  // Prevent background body scroll when presenter is active
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] select-none">
      {/* DESKTOP PRESENTATION (>= lg): Centered Dialog Modal */}
      <div
        className="hidden lg:flex fixed inset-0 items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-[#0d0e16] shadow-[0_20px_80px_rgba(0,0,0,0.7)] flex flex-col p-6 sm:p-8 animate-in zoom-in-95 duration-200 scrollbar-thin"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6 shrink-0">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-400 font-semibold mt-2">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer shrink-0"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Business Logic Children (Quiz Experience / Options) */}
          <div className="flex-1 min-h-0 text-left">{children}</div>
        </div>
      </div>

      {/* MOBILE PRESENTATION (< lg): Full-Screen Dedicated Page View */}
      <div className="flex lg:hidden fixed inset-0 bg-[#07080f] overflow-y-auto flex-col p-4 sm:p-6 z-[9999] animate-in slide-in-from-bottom duration-200 scrollbar-none">
        {/* Mobile Top Back Navigation Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4 shrink-0 bg-[#07080f] sticky top-0 z-10 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 text-slate-200 hover:text-white text-xs font-black uppercase tracking-wider transition cursor-pointer min-h-[44px]"
          >
            <ArrowLeft size={16} className="text-orange-500" />
            <span>Back to Lesson</span>
          </button>

          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
            Quiz Screen
          </span>
        </div>

        {/* Mobile Header Title */}
        <div className="mb-4 text-left">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 font-semibold mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Business Logic Children (Full-screen Quiz Content) */}
        <div className="flex-1 min-h-0 text-left pb-8">{children}</div>
      </div>
    </div>
  );
}
