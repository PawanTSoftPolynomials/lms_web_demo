"use client";

import { useState } from "react";
import { UploadButton } from "@/components/instructor/courses/UploadButton";
import { getDisplayUrl } from "@/lib/blob";

export function CourseOverviewView({
  course,
  courseForm,
  setCourseForm,
  isEditing,
  setIsEditing,
  onSaveCourseMeta,
  isSaving,
  modules = [],
  onSelectModule,
  onAddModule,
}) {
  return (
    <div className={`notebook-cell rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-md ${isEditing ? "active-cell border-orange-500/50" : ""}`}>
      {/* Left Action Bar */}
      <div className="cell-actions-left mb-3">
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #94a3b8)", textAlign: "center" }}>
          Course Meta
        </div>
      </div>

      <div className="cell-main space-y-4">
        {/* Cell Header Toolbar matching PageComponents.js */}
        <div className="cell-header flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
          <div>
            <span className="cell-badge rounded bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-400">
              Course Header
            </span>
          </div>
          <div className="cell-controls">
            <button
              className={`btn ${isEditing ? "btn-primary bg-orange-500 text-slate-950" : "btn-outline-primary border border-slate-800 text-slate-300 hover:text-white"} rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Course Title</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseTitleInput"
                    value={courseForm.title || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Subtitle</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseSubtitleInput"
                    value={courseForm.subtitle || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Abstract</label>
                <textarea
                  className="cell-textarea w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 resize-none"
                  id="courseAbstractInput"
                  rows={3}
                  value={courseForm.description || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Author / Instructor</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseAuthorInput"
                    value={courseForm.author || courseForm.instructor || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, author: e.target.value })}
                  />
                </div>
                <div className="form-group space-y-1">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400">Image URL Banner</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="cell-input flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500"
                      id="courseImageInput"
                      placeholder="https://... or click Upload"
                      value={courseForm.thumbnailUrl || ""}
                      onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                    />
                    <UploadButton
                      accept="image/*"
                      onUploadSuccess={(url) => setCourseForm((prev) => ({ ...prev, thumbnailUrl: url }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Audience Focus</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseAudienceInput"
                    value={courseForm.audience || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, audience: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseCategoryInput"
                    value={courseForm.category || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Duration Limit</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseDurationInput"
                    value={courseForm.duration || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  />
                </div>
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
                  className="btn rounded-xl bg-orange-500 px-4 py-1.5 text-xs font-black text-slate-950 hover:bg-orange-600"
                  onClick={onSaveCourseMeta}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Done"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {course?.thumbnailUrl && (
                <div className="text-center">
                  <img src={getDisplayUrl(course.thumbnailUrl)} alt={course.title} className="max-h-60 w-full object-cover rounded-xl border border-slate-800" />
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{course?.title || "Untitled Course"}</h3>
                {course?.subtitle && <p className="text-xs font-semibold text-orange-400 italic mt-1">{course.subtitle}</p>}
                <p className="text-xs text-slate-300 leading-relaxed mt-2">{course?.description || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-[11px] font-medium text-slate-300">
                <div><strong>Author:</strong> {course?.creator?.name || "LMS Architect"}</div>
                <div><strong>Category:</strong> {course?.category || "Software Development"}</div>
                <div><strong>Audience:</strong> {course?.audience || "Developers"}</div>
                <div><strong>Duration:</strong> {course?.duration || "Self-Paced"}</div>
              </div>

              {/* Module Overview Cards Grid matching PageComponents.js */}
              <h3 className="text-base font-bold text-white pt-4 border-t border-slate-800/80">
                Course Lessons & Modules
              </h3>

              <div className="lesson-modules-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {modules.map((mod, mIdx) => (
                  <div
                    key={mod.id}
                    className="module-overview-card flex flex-col p-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition"
                    onClick={() => onSelectModule(mod)}
                  >
                    <img
                      src={mod.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"}
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
