"use client";

import { useState } from "react";
import { getDisplayUrl } from "@/lib/blob";

export function LessonOverviewView({
  lesson,
  lessonForm,
  setLessonForm,
  isEditing,
  setIsEditing,
  onSaveLessonMeta,
  isSaving,
  modules = [],
  onSelectModule,
  onAddModule,
}) {
  if (!lesson) return null;

  return (
    <div className={`notebook-cell rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-md ${isEditing ? "active-cell border-purple-500/50" : ""}`}>
      {/* Left Action Bar */}
      <div className="cell-actions-left mb-3">
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #94a3b8)", textAlign: "center" }}>
          Lesson Meta
        </div>
      </div>

      <div className="cell-main space-y-4">
        {/* Cell Header Toolbar matching PageComponents.js */}
        <div className="cell-header flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
          <div>
            <span className="cell-badge rounded bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-400">
              Lesson Header
            </span>
          </div>
          <div className="cell-controls">
            <button
              className={`btn ${isEditing ? "btn-primary bg-purple-500 text-slate-950" : "btn-outline-primary border border-slate-800 text-slate-300 hover:text-white"} rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>
        </div>

        {/* Cell Render Area */}
        <div className="cell-render-area">
          {isEditing ? (
            <div className="space-y-4 text-xs">
              <div className="form-group">
                <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Lesson Title</label>
                <input
                  type="text"
                  className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500"
                  id="lessonTitleInput"
                  value={lessonForm.title || ""}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Lesson Subtitle</label>
                <input
                  type="text"
                  className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500"
                  id="lessonSubtitleInput"
                  value={lessonForm.subtitle || ""}
                  onChange={(e) => setLessonForm({ ...lessonForm, subtitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Lesson Summary / Objectives</label>
                <textarea
                  className="cell-textarea w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 resize-none"
                  id="lessonSummaryInput"
                  rows={4}
                  value={lessonForm.summary || lessonForm.description || ""}
                  onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-xl border border-slate-800 px-3 py-1.5 text-xs text-slate-300"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn rounded-xl bg-purple-500 px-4 py-1.5 text-xs font-black text-slate-950 hover:bg-purple-600"
                  onClick={onSaveLessonMeta}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Done"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">{lesson.title || "Untitled Lesson"}</h3>
                {lesson.subtitle && <p className="text-xs font-semibold text-orange-400 italic mt-1">{lesson.subtitle}</p>}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                <h5 className="text-xs font-bold text-white mb-1">Learning Objectives Summary:</h5>
                <p className="text-xs text-slate-400 leading-relaxed">{lesson.summary || lesson.description || "No summary configured."}</p>
              </div>

              <h5 className="text-sm font-bold text-white pt-3 border-t border-slate-800/80">Lesson Modules:</h5>

              <div className="lesson-modules-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {modules.map((mod, mIdx) => (
                  <div
                    key={mod.id}
                    className="module-overview-card flex flex-col p-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition"
                    onClick={() => onSelectModule(mod)}
                  >
                    <img
                      src={getDisplayUrl(mod.thumbnailUrl) || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"}
                      alt={mod.title}
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="text-sm font-bold text-orange-400 mb-1">{mod.title || "Untitled Module"}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{mod.subtitle || "Module details and cell content blocks."}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
