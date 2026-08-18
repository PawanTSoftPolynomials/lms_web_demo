"use client";

import { Check, X, Loader2 } from "lucide-react";

export function PublishValidationModal({
  isOpen,
  onClose,
  onPublish,
  validation,
  isValidating,
  isPublishing,
  courseTitle
}) {
  if (!isOpen) return null;

  const canPublish = validation?.canPublish ?? false;
  const errors = validation?.errors || [];

  // Derived checklist status
  const hasTitle = !errors.some((e) => e.code === "MISSING_TITLE");
  const hasDesc = !errors.some((e) => e.code === "MISSING_DESCRIPTION");
  const hasModules = !errors.some((e) => e.code === "NO_MODULES");
  const hasLessons = !errors.some((e) => e.code === "EMPTY_MODULE");
  const hasContent = !errors.some((e) => e.code === "EMPTY_LESSON");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-black text-white">Publish Course</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Before publishing <span className="font-bold text-white">"{courseTitle}"</span>, verify all requirements:
        </p>

        {isValidating ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Loader2 size={24} className="animate-spin text-orange-500" />
            <p className="text-xs text-slate-400 font-semibold">Validating course structure...</p>
          </div>
        ) : (
          <div className="space-y-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-xs font-medium">
            <div className="flex items-center gap-2.5">
              {hasTitle ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check size={12} />
                </span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                  <X size={12} />
                </span>
              )}
              <span className={hasTitle ? "text-slate-200" : "text-red-300 font-bold"}>Course title</span>
            </div>

            <div className="flex items-center gap-2.5">
              {hasDesc ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check size={12} />
                </span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                  <X size={12} />
                </span>
              )}
              <span className={hasDesc ? "text-slate-200" : "text-red-300 font-bold"}>Course description</span>
            </div>

            <div className="flex items-center gap-2.5">
              {hasModules ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check size={12} />
                </span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                  <X size={12} />
                </span>
              )}
              <span className={hasModules ? "text-slate-200" : "text-red-300 font-bold"}>Modules</span>
            </div>

            <div className="flex items-center gap-2.5">
              {hasLessons ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check size={12} />
                </span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                  <X size={12} />
                </span>
              )}
              <span className={hasLessons ? "text-slate-200" : "text-red-300 font-bold"}>Lessons inside modules</span>
            </div>

            {/* Display specific error details */}
            {errors.map((err, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-red-400 pt-1 border-t border-slate-800/40">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 mt-0.5">
                  <X size={12} />
                </span>
                <span className="leading-snug">{err.message}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={!canPublish || isPublishing || isValidating}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-5 py-2 transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Publish</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
