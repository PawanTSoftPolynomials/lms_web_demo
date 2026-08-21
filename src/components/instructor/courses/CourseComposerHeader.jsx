"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, Settings, Copy, Archive, Trash2, Globe, FileText, CheckCircle, Sparkles } from "lucide-react";

export function CourseComposerHeader({
  course,
  courseId,
  globalMode = "rendered",
  onToggleGlobalMode,
  onSaveCourse,
  onImportCourse,
  onAiClick,
  isSaving,
  onPublishClick,
  onUnpublishClick,
  onDuplicateClick,
  onArchiveClick,
  onRestoreClick,
  onDeleteClick,
  onToggleSidebar,
  userRole = "INSTRUCTOR"
}) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const status = course?.status || "DRAFT";
  const isPublished = status === "PUBLISHED";
  const isArchived = status === "ARCHIVED";
  const isDraft = status === "DRAFT";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="app-header flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 shadow-xl text-slate-200">
      {/* Left: Menu Toggle + Logo + Course Title & Status Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="menu-toggle-btn lg:hidden inline-flex items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white cursor-pointer"
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

        <div className="logo-section flex items-center gap-2 cursor-pointer shrink-0" onClick={() => (window.location.href = "/instructor/courses")}>
          <div className="logo-icon text-xl">🍊</div>
          <div className="logo-text font-black text-sm text-white tracking-tight">
            <span style={{ color: "coral" }}>O</span><span className="text-orange-500">Tree</span> LMS
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800 shrink-0 hidden sm:block" />

        {/* Title and Status Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[280px]" title={course?.title}>
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

      {/* Right: Actions Hierarchy: Save | AI Composer | Preview | Primary Lifecycle (Publish/Unpublish/Restore) | ⋮ More Menu */}
      <div className="header-actions flex items-center gap-2 shrink-0 justify-end">
        {/* AI Composer button */}
        <button
          type="button"
          className="btn rounded-xl border border-orange-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          onClick={onAiClick}
          title="Compose course with AI Agent (Qwen3B)"
        >
          <Sparkles size={13} className="text-amber-400 fill-amber-400/20" />
          <span>AI Composer</span>
        </button>

        {/* Save button */}
        {!isArchived && (
          <button
            type="button"
            className="btn rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 transition cursor-pointer disabled:opacity-50"
            onClick={onSaveCourse}
            disabled={isSaving}
            title="Persist current course changes"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        )}

        {/* Preview / Mode toggle */}
        <button
          type="button"
          className={`btn rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            globalMode === "edit"
              ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
              : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
          onClick={onToggleGlobalMode}
          title="Toggle preview / edit mode"
        >
          {globalMode === "edit" ? "Preview" : "Edit All"}
        </button>

        {/* Primary Lifecycle Action Button */}
        {isDraft && (
          <button
            type="button"
            className="btn rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-4 py-1.5 transition shadow-md cursor-pointer"
            onClick={onPublishClick}
          >
            Publish
          </button>
        )}

        {isPublished && (
          <button
            type="button"
            className="btn rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs px-3.5 py-1.5 transition cursor-pointer"
            onClick={onUnpublishClick}
          >
            Unpublish
          </button>
        )}

        {isArchived && onRestoreClick && (
          <button
            type="button"
            className="btn rounded-xl border border-purple-500/40 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs px-3.5 py-1.5 transition cursor-pointer flex items-center gap-1.5"
            onClick={onRestoreClick}
          >
            <Archive size={13} />
            <span>Restore to Draft</span>
          </button>
        )}

        {/* More Menu Dropdown (⋮) */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            title="More Options"
          >
            <MoreVertical size={16} />
          </button>

          {moreMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-2xl z-50 text-xs text-slate-300 space-y-0.5">
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 text-left transition cursor-pointer"
                onClick={() => {
                  setMoreMenuOpen(false);
                  onSaveCourse();
                }}
              >
                <Settings size={14} className="text-slate-400" />
                <span>Course Settings</span>
              </button>

              {onDuplicateClick && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 text-left transition cursor-pointer"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onDuplicateClick();
                  }}
                >
                  <Copy size={14} className="text-slate-400" />
                  <span>Duplicate</span>
                </button>
              )}

              {/* Archive - exposed to Admin */}
              {onArchiveClick && userRole === "ADMIN" && !isArchived && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 text-left transition cursor-pointer text-purple-400"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onArchiveClick();
                  }}
                >
                  <Archive size={14} />
                  <span>Archive</span>
                </button>
              )}

              {/* Restore - exposed to Admin if archived */}
              {onRestoreClick && userRole === "ADMIN" && isArchived && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-purple-500/10 text-purple-300 text-left transition cursor-pointer"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onRestoreClick();
                  }}
                >
                  <Archive size={14} />
                  <span>Restore</span>
                </button>
              )}

              {/* Delete option - shown for drafts */}
              {onDeleteClick && (isDraft || userRole === "ADMIN") && (
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-left transition cursor-pointer border-t border-slate-900 mt-1 pt-2"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onDeleteClick();
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
