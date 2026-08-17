"use client";

import { useState } from "react";
import { ChevronRight, Pencil, Plus } from "lucide-react";

export function CourseOverviewEditor({
  course,
  courseForm,
  setCourseForm,
  isEditingCourse,
  setIsEditingCourse,
  onSaveCourseMeta,
  isSaving,
  modules = [],
  onSelectModule,
  onAddModule,
}) {
  return (
    <div className="space-y-5 animate-fade-in duration-200">
      {/* Course Header & Metadata Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-orange-400">
              Course Details & Overview
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingCourse(!isEditingCourse)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Pencil size={12} />
            <span>{isEditingCourse ? "Cancel Editing" : "Edit Details"}</span>
          </button>
        </div>

        {isEditingCourse ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={courseForm.title || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Subtitle / Short Tagline
                </label>
                <input
                  type="text"
                  value={courseForm.subtitle || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Course Abstract / Description
              </label>
              <textarea
                rows={3}
                value={courseForm.description || ""}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={courseForm.category || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Audience Focus
                </label>
                <input
                  type="text"
                  value={courseForm.audience || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, audience: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={courseForm.duration || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onSaveCourseMeta}
                disabled={isSaving}
                className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-orange-600 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Course Details"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight">{course?.title}</h2>
            {course?.subtitle && (
              <p className="text-xs font-semibold text-orange-400">{course.subtitle}</p>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">{course?.description || "No course summary provided."}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60 text-[10px] font-bold text-slate-400">
              <div>
                <span className="text-slate-500 uppercase">Category:</span>{" "}
                <span className="text-white">{course?.category || "General"}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase">Level:</span>{" "}
                <span className="text-white">{course?.level || "All Levels"}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase">Modules:</span>{" "}
                <span className="text-white">{modules.length}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase">Status:</span>{" "}
                <span className="text-emerald-400">{course?.status}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modules Overview Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
            Course Modules Map
          </h3>

          <button
            type="button"
            onClick={onAddModule}
            className="flex items-center gap-1 text-xs font-extrabold text-orange-400 hover:text-orange-300 transition cursor-pointer"
          >
            <Plus size={14} /> Add Module
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod, idx) => (
            <div
              key={mod.id}
              onClick={() => onSelectModule(mod)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-orange-500/60 hover:bg-slate-900/80 transition cursor-pointer shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[9px] font-black uppercase text-orange-400">
                    Module {idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {(mod.lessons || []).length} Lessons
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition truncate">
                  {mod.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {mod.subtitle || mod.description || "Click to view and edit module contents."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-extrabold text-slate-400 group-hover:text-white">
                <span>Explore Module</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition text-orange-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
