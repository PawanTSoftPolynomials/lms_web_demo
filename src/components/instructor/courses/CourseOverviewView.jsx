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
  onSelectQuiz,
  onAddModule,
  role = "INSTRUCTOR",
  onStartLearning,
}) {
  return (
    <div className={`notebook-cell rounded-2xl border border-[#D9D9D9] bg-[#B7C9C5] p-5 shadow-md ${isEditing ? "active-cell border-orange-500/50" : ""}`}>
      {/* Left Action Bar */}
      <div className="cell-actions-left mb-3">
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #94a3b8)", textAlign: "center" }}>
          Course Meta
        </div>
      </div>

      <div className="cell-main space-y-4">
        {/* Cell Header Toolbar matching PageComponents.js */}
        <div className="cell-header flex items-center justify-between border-b border-[#D9D9D9]/80 pb-2.5 mb-3">
          <div>
            <span className="cell-badge rounded bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-400">
              Course Header
            </span>
          </div>
          <div className="cell-controls flex items-center gap-2">
            {role === "STUDENT" && onStartLearning && (
              <button
                type="button"
                onClick={onStartLearning}
                className="btn bg-orange-500 hover:bg-orange-600 text-slate-950 rounded-xl px-4 py-1.5 text-xs font-black transition cursor-pointer"
              >
                Start Learning
              </button>
            )}
            {role === "INSTRUCTOR" && (
              <button
                className={`btn ${isEditing ? "btn-primary bg-orange-500 text-slate-950" : "btn-outline-primary border border-[#D9D9D9] text-slate-300 hover:text-white"} rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Done" : "Edit"}
              </button>
            )}
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
                    className="cell-input w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseTitleInput"
                    value={courseForm.title || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Subtitle</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseSubtitleInput"
                    value={courseForm.subtitle || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Abstract</label>
                <textarea
                  className="cell-textarea w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 resize-none"
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
                    className="cell-input w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
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
                      className="cell-input flex-1 bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500"
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
                    className="cell-input w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseAudienceInput"
                    value={courseForm.audience || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, audience: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseCategoryInput"
                    value={courseForm.category || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="cell-field-label block text-[10px] font-black uppercase text-slate-400 mb-1">Duration Limit</label>
                  <input
                    type="text"
                    className="cell-input w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-500"
                    id="courseDurationInput"
                    value={courseForm.duration || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D9D9]">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-xl border border-[#D9D9D9] px-3 py-1.5 text-xs text-slate-300"
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
              <div>
                <h3 className="text-xl font-bold text-[#6C7A6D]">{course?.title || "Untitled Course"}</h3>
                {course?.subtitle && <p className="text-xs font-semibold text-orange-400 italic mt-1">{course.subtitle}</p>}
                <p className="text-xs text-slate-300 leading-relaxed mt-2">{course?.description || "No description provided."}</p>
              </div>

              {/* Summary Metrics Bar */}
              {(() => {
                const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                const totalTopics = modules.reduce(
                  (sum, m) => sum + (m.lessons || []).reduce((tSum, l) => tSum + (l.topics?.length || 0), 0),
                  0
                );
                const courseQuizCount = Array.isArray(course?.quizzes) ? course.quizzes.length : 0;
                const moduleQuizCount = modules.reduce((sum, m) => sum + (m.quizzes?.length || 0), 0);
                const totalQuizzes = courseQuizCount + moduleQuizCount;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#D9D9D9]/80">
                    <div className="p-3 rounded-xl bg-[#B7C9C5]/80 border border-[#D9D9D9]">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Modules</span>
                      <span className="text-base font-bold text-orange-400">{modules.length}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#B7C9C5]/80 border border-[#D9D9D9]">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Lessons</span>
                      <span className="text-base font-bold text-sky-400">{totalLessons}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#B7C9C5]/80 border border-[#D9D9D9]">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Topics</span>
                      <span className="text-base font-bold text-purple-400">{totalTopics}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#B7C9C5]/80 border border-[#D9D9D9]">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Quizzes</span>
                      <span className="text-base font-bold text-emerald-400">{totalQuizzes}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-[11px] font-medium text-slate-300">
                <div><strong className="text-slate-400">Author:</strong> {course?.creator?.name || "LMS Architect"}</div>
                <div><strong className="text-slate-400">Category:</strong> {course?.category || "Software Development"}</div>
                <div><strong className="text-slate-400">Audience:</strong> {course?.audience || "Developers"}</div>
                <div><strong className="text-slate-400">Duration:</strong> {course?.duration || "Self-Paced"}</div>
              </div>

              {/* Course-Level Quizzes (when present) */}
              {Array.isArray(course?.quizzes) && course.quizzes.length > 0 && (
                <div className="pt-4 border-t border-[#D9D9D9]/80 space-y-3">
                  <h3 className="text-sm font-bold text-[#6C7A6D] flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                      Course Quizzes
                    </span>
                    Course-Level Quizzes ({course.quizzes.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.quizzes.map((quiz) => {
                      const qCount = quiz.questions?.length || quiz.quizQuestions?.length || 0;
                      return (
                        <div
                          key={quiz.id || quiz._id || `cq-${quiz.title}`}
                          className="p-3.5 rounded-xl border border-[#D9D9D9] bg-[#B7C9C5]/80 hover:border-emerald-500/40 transition space-y-1.5 cursor-pointer"
                          onClick={() => onSelectQuiz?.(quiz, null)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-[#6C7A6D] truncate">{quiz.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono shrink-0">
                              Pass: {quiz.passingScore}%
                            </span>
                          </div>
                          {quiz.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2">{quiz.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                            <span>{qCount} {qCount === 1 ? "question" : "questions"}</span>
                            {quiz.timeLimit && <span>{quiz.timeLimit} mins</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modules Header & Compact Card Grid */}
              <div className="pt-4 border-t border-[#D9D9D9]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#6C7A6D]">Course Modules ({modules.length})</h3>
                  {onAddModule && (
                    <button
                      type="button"
                      onClick={onAddModule}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 cursor-pointer"
                    >
                      + Add Module
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {modules.map((mod, mIdx) => {
                    const lessonCount = mod.lessons?.length || 0;
                    const topicCount = (mod.lessons || []).reduce((sum, l) => sum + (l.topics?.length || 0), 0);
                    const quizCount = mod.quizzes?.length || 0;
                    const padIdx = String(mIdx + 1).padStart(2, "0");

                    return (
                      <div
                        key={mod.id}
                        onClick={() => onSelectModule(mod)}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[#D9D9D9] bg-[#B7C9C5]/60 hover:bg-[#B7C9C5] hover:border-orange-500/40 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-black text-orange-400/90 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 shrink-0">
                            {padIdx}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#6C7A6D] truncate">{mod.title || "Untitled Module"}</h4>
                            <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                              {lessonCount} {lessonCount === 1 ? "Lesson" : "Lessons"} · {topicCount} {topicCount === 1 ? "Topic" : "Topics"}
                              {quizCount > 0 ? ` · ${quizCount} ${quizCount === 1 ? "Quiz" : "Quizzes"}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className="text-slate-500 text-xs font-bold shrink-0 ml-2">→</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
