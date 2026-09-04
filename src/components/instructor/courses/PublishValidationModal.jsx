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
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-5 text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-lg font-black text-foreground">Publish Course</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition p-1 rounded-lg hover:bg-background"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Before publishing <span className="font-bold text-foreground">"{courseTitle}"</span>, verify all requirements:
        </p>

        {isValidating ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-semibold">Validating course structure...</p>
          </div>
        ) : (
          <div className="space-y-2.5 rounded-xl border border-border/80 bg-background/60 p-4 text-xs font-medium">
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
              <span className={hasTitle ? "text-foreground" : "text-red-300 font-bold"}>Course title</span>
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
              <span className={hasDesc ? "text-foreground" : "text-red-300 font-bold"}>Course description</span>
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
              <span className={hasModules ? "text-foreground" : "text-red-300 font-bold"}>Modules</span>
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
              <span className={hasLessons ? "text-foreground" : "text-red-300 font-bold"}>Lessons inside modules</span>
            </div>

            {/* Display specific error details */}
            {errors.map((err, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-red-400 pt-1 border-t border-border/40">
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
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={!canPublish || isPublishing || isValidating}
            className="rounded-xl bg-primary hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-5 py-2 transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
