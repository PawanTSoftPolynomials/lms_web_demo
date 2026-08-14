"use client";

import { useState } from "react";
import { ChevronRight, Pencil, Plus } from "lucide-react";

export function ModuleOverviewEditor({
  module,
  moduleForm,
  setModuleForm,
  isEditingModule,
  setIsEditingModule,
  onSaveModuleMeta,
  isSaving,
  onSelectLesson,
  onAddLesson,
}) {
  if (!module) return null;

  return (
    <div className="space-y-5 animate-fade-in duration-200">
      {/* Module Header & Metadata Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="text-xs font-black uppercase tracking-widest text-orange-400">
            Module Details
          </span>

          <button
            type="button"
            onClick={() => setIsEditingModule(!isEditingModule)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Pencil size={12} />
            <span>{isEditingModule ? "Cancel Editing" : "Edit Module"}</span>
          </button>
        </div>

        {isEditingModule ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Module Title
              </label>
              <input
                type="text"
                value={moduleForm.title || ""}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Subtitle / Overview
              </label>
              <textarea
                rows={2}
                value={moduleForm.subtitle || ""}
                onChange={(e) => setModuleForm({ ...moduleForm, subtitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onSaveModuleMeta}
                disabled={isSaving}
                className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-orange-600 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Module Details"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-white">{module.title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {module.subtitle || module.description || "No overview configured for this module."}
            </p>
          </div>
        )}
      </div>

      {/* Module Lessons Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
            Lessons in this Module
          </h3>

          <button
            type="button"
            onClick={() => onAddLesson(module.id)}
            className="flex items-center gap-1 text-xs font-extrabold text-orange-400 hover:text-orange-300 transition cursor-pointer"
          >
            <Plus size={14} /> Add Lesson
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(module.lessons || []).map((l, lIdx) => (
            <div
              key={l.id}
              onClick={() => onSelectLesson(l.id, module.id)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-orange-500/60 hover:bg-slate-900/80 transition cursor-pointer shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[9px] font-black uppercase text-purple-400">
                    Lesson {lIdx + 1}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {l._count?.contents ?? l.contents?.length ?? 0} Content Blocks
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition truncate">
                  {l.title}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-extrabold text-slate-400 group-hover:text-white">
                <span>Open Block Composer</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition text-orange-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
