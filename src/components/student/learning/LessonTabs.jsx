"use client";

import DOMPurify from "isomorphic-dompurify";
import { useState, useEffect } from "react";
import {
  FileText,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Download,
} from "lucide-react";
import {
  useBookmarks,
  useCreateBookmark,
  useDeleteBookmark,
} from "@/hooks/queries/student/useBookmarks";

export default function LessonTabs({ lesson, course }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [personalStudentNote, setPersonalStudentNote] = useState("");

  useEffect(() => {
    if (lesson?.id && typeof window !== "undefined") {
      const saved = localStorage.getItem(`student_note_${lesson.id}`);
      setPersonalStudentNote(saved || "");
    }
  }, [lesson?.id]);

  const { data: bookmarks = [] } = useBookmarks();
  const createBookmarkMutation = useCreateBookmark();
  const deleteBookmarkMutation = useDeleteBookmark();

  const isLessonBookmarked =
    bookmarks?.some(
      (b) => b.lessonId === lesson?.id && b.type === "Lesson"
    ) || false;

  const handleBookmarkLesson = async () => {
    if (!lesson) return;
    if (isLessonBookmarked) {
      const bookmark = bookmarks?.find(
        (b) => b.lessonId === lesson?.id && b.type === "Lesson"
      );
      if (bookmark) {
        try {
          await deleteBookmarkMutation.mutateAsync(bookmark.id);
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      try {
        await createBookmarkMutation.mutateAsync({
          type: "Lesson",
          title: lesson.title,
          detail: course?.title || "",
          courseId: course?.id || "",
          lessonId: lesson.id,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!lesson) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-[#0d0e16]/60 p-8 text-center text-xs font-semibold text-slate-500">
        Select a lesson to view its details.
      </div>
    );
  }

  const instructorAttachments = (lesson.contents || []).filter(
    (c) =>
      c.type === "FILE" ||
      c.type === "DOCUMENT" ||
      c.type === "HTML" ||
      Boolean(c.fileUrl)
  );

  const instructorHtmlNotes = (lesson.contents || [])
    .filter((c) => c.type === "HTML" && c.htmlContent)
    .map((c) => c.htmlContent)
    .join("<br/>");

  const tabs = [
    {
      id: "overview",
      label: "Lesson Overview",
      icon: BookOpen,
    },
    {
      id: "notes",
      label: "Notes & Attachments",
      icon: FileText,
      badge: instructorAttachments.length > 0 ? instructorAttachments.length : null,
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-[#1e2030] bg-[#0d0e16]/60 backdrop-blur-md shadow-xl">
      {/* Tabs Selector Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 p-3.5 bg-slate-950/40 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer border ${
                isActive
                  ? "bg-orange-500 text-slate-950 border-orange-400 shadow-md shadow-orange-500/20"
                  : "bg-slate-900/40 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-slate-950/30 text-slate-950"
                      : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Body */}
      <div className="p-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-wide">
                  {lesson.title}
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Module Concept • Objective Overview
                </p>
              </div>

              <button
                type="button"
                onClick={handleBookmarkLesson}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition cursor-pointer shrink-0 ${
                  isLessonBookmarked
                    ? "bg-orange-500 text-slate-950 border-orange-400 shadow-md"
                    : "bg-slate-950/60 text-slate-300 border-slate-800 hover:border-orange-500/40 hover:text-white"
                }`}
              >
                {isLessonBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 fill-current" />
                    <span>Bookmarked</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    <span>Bookmark Lesson</span>
                  </>
                )}
              </button>
            </div>

            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300 font-medium">
              {lesson.description || "No specific lesson objectives provided."}
            </div>
          </div>
        )}

        {/* NOTES & ATTACHMENTS TAB */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="text-orange-500" size={16} />
                <span>Class Notes & Downloadable Files</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {instructorAttachments.length} File Attachment(s)
              </span>
            </div>

            {/* Section 1: Instructor Class Notes & Uploaded Attachments */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              {/* Written HTML Notes */}
              {instructorHtmlNotes && (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <div
                    className="prose prose-invert max-w-none text-slate-200"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(instructorHtmlNotes || "") }}
                  />
                </div>
              )}

              {/* Uploaded File Attachments Grid */}
              {instructorAttachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {instructorAttachments.map((file, idx) => (
                    <div
                      key={file.id || idx}
                      className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between hover:border-orange-500/40 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                          <Download size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition">
                            {file.title || "Class Attachment"}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono uppercase">
                            {file.type || "FILE"} &bull; Ready
                          </span>
                        </div>
                      </div>

                      {file.fileUrl ? (
                        <a
                          href={
                            file.fileUrl.startsWith("http")
                              ? file.fileUrl
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${file.fileUrl}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 transition shadow-md shrink-0 cursor-pointer"
                        >
                          <Download size={11} />
                          <span>Get</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No File</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/20 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                  No downloadable file attachments uploaded for this lesson.
                </div>
              )}
            </div>

            {/* Section 2: Personal Student Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-200">
                  Personal Scratchpad Notes
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Auto-saved to workspace
                </span>
              </div>
              <textarea
                rows={5}
                value={personalStudentNote}
                onChange={(e) => {
                  setPersonalStudentNote(e.target.value);
                  if (typeof window !== "undefined" && lesson?.id) {
                    localStorage.setItem(`student_note_${lesson.id}`, e.target.value);
                  }
                }}
                placeholder="Write personal study notes, reminders, or code snippets..."
                className="w-full rounded-2xl border border-slate-800 bg-[#07080f]/90 p-4 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition font-mono leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
