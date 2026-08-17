"use client";

import { useState } from "react";
import Link from "next/link";

export function CourseComposerHeader({
  course,
  courseId,
  globalMode = "rendered",
  onToggleGlobalMode,
  onSaveCourse,
  onImportCourse,
  isSaving,
  isPublished,
  onToggleSidebar,
}) {
  return (
    <header className="app-header flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 shadow-xl text-slate-200">
      {/* Left: Menu Toggle + Logo */}
      <div className="flex items-center gap-3">
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

        <div className="logo-section flex items-center gap-2 cursor-pointer" onClick={() => (window.location.href = "/instructor/courses")}>
          <div className="logo-icon text-xl">🍊</div>
          <div className="logo-text font-black text-sm text-white tracking-tight">
            <span style={{ color: "coral" }}>O</span><span className="text-orange-500">Tree</span> LMS V2
          </div>

          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider border shrink-0 ${
              isPublished
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {isPublished ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>
      </div>

      {/* Right: Header Action Buttons matching composerV2.html */}
      <div className="header-actions flex items-center gap-2 shrink-0 justify-end">
        <button
          className="btn btn-outline-primary rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 transition cursor-pointer"
          id="importJsonBtn"
          onClick={onImportCourse}
        >
          Import Course
        </button>

        <button
          className={`btn btn-outline-primary rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            globalMode === "edit"
              ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
              : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
          id="previewModeToggleBtn"
          onClick={onToggleGlobalMode}
        >
          {globalMode === "edit" ? "Render All" : "Edit All"}
        </button>

        <button
          className="btn btn-primary rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs px-4 py-2 transition shadow-md cursor-pointer disabled:opacity-50"
          id="exportJsonBtn"
          onClick={onSaveCourse}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Course"}
        </button>
      </div>
    </header>
  );
}
