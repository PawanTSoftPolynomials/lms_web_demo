"use client";

import Link from "next/link";
import { Archive, Sparkles } from "lucide-react";

export function CourseComposerHeader({
  course,
  courseId,
  onSaveCourse,
  onImportCourse,
  onOpenAskAi,
  isSaving,
  onPublishClick,
  onUnpublishClick,
  hasUnsavedChanges = false,
  onRestoreClick,
  onToggleSidebar,
}) {
  const status = course?.status || "DRAFT";
  const isPublished = status === "PUBLISHED";
  const isArchived = status === "ARCHIVED";
  const isDraft = status === "DRAFT";

  return (
    <header className="app-header flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3 shadow-xl text-foreground">
      {/* Left: Menu Toggle + Course Title & Status Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="menu-toggle-btn lg:hidden inline-flex shrink-0 items-center justify-center h-11 w-11 rounded-xl border border-border bg-background text-foreground hover:text-foreground cursor-pointer"
          id="toggleSidebarBtn"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Title and Status Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-xs sm:text-sm font-extrabold text-foreground truncate max-w-[200px] sm:max-w-[320px]" title={course?.title}>
            {course?.title || "Untitled Course"}
          </h1>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border shrink-0 ${
              isPublished
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : isArchived
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Right: Actions Hierarchy: ✨ Ask OTree AI | Save | Publish */}
      <div className="header-actions flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end mt-2 sm:mt-0">
        {/* Unified ✨ Ask OTree AI button */}
        {onOpenAskAi && (
          <button
            type="button"
            onClick={onOpenAskAi}
            className="btn shrink-0 rounded-xl bg-primary font-extrabold text-xs px-3.5 py-2.5 sm:py-1.5 transition flex items-center gap-1.5 cursor-pointer"
            style={{ "--btn-rainbow-fill": "#7C3AED" }}
            title="Ask OTree AI Assistant"
          >
            <Sparkles size={14} className="fill-current animate-pulse shrink-0" />
            <span className="whitespace-nowrap">Ask OTree AI</span>
          </button>
        )}

        {/* Save button — hidden until the course actually has unsaved
            changes, so a course sitting untouched shows no dead action. */}
        {!isArchived && hasUnsavedChanges && (
          <button
            type="button"
            className="btn shrink-0 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-bold px-3 py-2.5 sm:py-1.5 transition cursor-pointer disabled:opacity-50"
            onClick={onSaveCourse}
            disabled={isSaving}
            title="Persist current course changes"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        )}

        {/* Primary Lifecycle Action Button — forces its own row on narrow
            screens (w-full) so it never competes for space with the group
            above; sits back inline with everything else from sm: up. */}
        {isDraft && (
          <button
            type="button"
            className="btn w-full sm:w-auto shrink-0 rounded-xl bg-primary hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-4 py-2.5 sm:py-1.5 transition shadow-md cursor-pointer"
            onClick={onPublishClick}
          >
            Publish
          </button>
        )}

        {isPublished && (
          <button
            type="button"
            className="btn w-full sm:w-auto shrink-0 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs px-3.5 py-2.5 sm:py-1.5 transition cursor-pointer"
            onClick={onUnpublishClick}
          >
            Unpublish
          </button>
        )}

        {isArchived && onRestoreClick && (
          <button
            type="button"
            className="btn w-full sm:w-auto shrink-0 rounded-xl border border-purple-500/40 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs px-3.5 py-2.5 sm:py-1.5 transition cursor-pointer flex items-center justify-center sm:justify-start gap-1.5"
            onClick={onRestoreClick}
          >
            <Archive size={13} />
            <span>Restore to Draft</span>
          </button>
        )}
      </div>
    </header>
  );
}
