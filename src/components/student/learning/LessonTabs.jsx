"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  BookOpen,
  Link2,
  ClipboardList,
  Bookmark,
  BookmarkCheck,
  Download,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useBookmarks, useCreateBookmark, useDeleteBookmark } from "@/hooks/queries/student/useBookmarks";

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

  const isLessonBookmarked = bookmarks?.some(
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

  const getBookmarkedContent = (content) => {
    if (!lesson) return null;
    return bookmarks?.find(
      (b) => b.title === content.title && b.lessonId === lesson?.id
    );
  };

  const handleBookmarkContent = async (content) => {
    if (!lesson) return;
    const existing = getBookmarkedContent(content);
    if (existing) {
      try {
        await deleteBookmarkMutation.mutateAsync(existing.id);
      } catch (error) {
        console.error(error);
      }
    } else {
      const typeMap = {
        VIDEO: "Video",
        DOCUMENT: "Document",
        LINK: "Web Link",
        PRESENTATION: "Document"
      };
      const bookmarkType = typeMap[content.type] || "Document";
      const contentUrl = content.videoUrl || content.fileUrl || content.externalUrl || "";

      try {
        await createBookmarkMutation.mutateAsync({
          type: bookmarkType,
          title: content.title || "Untitled Resource",
          detail: lesson.title || "",
          url: contentUrl,
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Select a lesson to view its details.
      </div>
    );
  }

  const instructorAttachments = (lesson.contents || []).filter(
    (c) => c.type === "FILE" || c.type === "DOCUMENT" || c.type === "HTML" || Boolean(c.fileUrl)
  );

  const instructorHtmlNotes = (lesson.contents || [])
    .filter((c) => c.type === "HTML" && c.htmlContent)
    .map((c) => c.htmlContent)
    .join("<br/>");

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BookOpen,
    },
    {
      id: "resources",
      label: "Resources",
      icon: Link2,
    },
    {
      id: "notes",
      label: "Notes",
      icon: FileText,
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: ClipboardList,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      {/* Tabs Selector Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 p-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-orange-600 text-white font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "notes" && instructorAttachments.length > 0 && (
                <span className="ml-1 rounded-full bg-orange-500/20 text-orange-400 px-1.5 py-0.2 text-[10px] font-mono border border-orange-500/30">
                  {instructorAttachments.length}
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
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-white">
                {lesson.title}
              </h2>

              <button
                onClick={handleBookmarkLesson}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold cursor-pointer transition ${
                  isLessonBookmarked
                    ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                    : "bg-slate-900/50 text-slate-300 border-slate-800 hover:border-orange-500/50"
                }`}
              >
                {isLessonBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    Bookmark Lesson
                  </>
                )}
              </button>
            </div>

            <p className="leading-7 text-slate-300">
              {lesson.description || "No description available."}
            </p>
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Learning Resources
            </h2>

            {lesson.contents?.length ? (
              <div className="space-y-3">
                {lesson.contents.map((content) => {
                  const isContentSaved = Boolean(getBookmarkedContent(content));

                  return (
                    <div
                      key={content.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4"
                    >
                      <div>
                        <p className="font-medium text-white">{content.title}</p>
                        <p className="mt-2 text-sm text-slate-400">
                          Type: {content.type}
                        </p>
                      </div>

                      <button
                        onClick={() => handleBookmarkContent(content)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold cursor-pointer transition ${
                          isContentSaved
                            ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:border-orange-500/50"
                        }`}
                      >
                        {isContentSaved ? (
                          <>
                            <BookmarkCheck className="h-3 w-3" />
                            Bookmarked
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-3 w-3" />
                            Bookmark
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400">No resources available.</p>
            )}
          </div>
        )}

        {/* NOTES TAB (INSTRUCTOR UPLOADS & ATTACHMENTS + PERSONAL NOTES) */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-orange-500" size={20} />
                <span>Instructor Notes & Lesson Attachments</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {instructorAttachments.length} Attachment(s)
              </span>
            </div>

            {/* Section 1: Instructor Class Notes & Uploaded Attachments */}
            <div className="p-5 rounded-2xl bg-[#05070E] border border-[#1A1F35] space-y-4">
             

              {/* Instructor Written HTML Notes (Only when teacher creates HTML notes) */}
              {instructorHtmlNotes && (
                <div className="p-4 rounded-xl bg-[#0D1021] border border-white/5 text-xs text-slate-200 leading-relaxed">
                  <div
                    className="prose prose-invert max-w-none text-slate-200"
                    dangerouslySetInnerHTML={{ __html: instructorHtmlNotes }}
                  />
                </div>
              )}

              {/* Instructor Uploaded File Attachments Grid */}
              {instructorAttachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {instructorAttachments.map((file, idx) => (
                    <div
                      key={file.id || idx}
                      className="p-3.5 rounded-xl bg-[#0D1021] border border-[#1A1F35] flex items-center justify-between hover:border-orange-500/40 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="h-9 w-9 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                          <Download size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-white truncate group-hover:text-orange-400 transition">
                            {file.title || "Class Attachment"}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono uppercase">
                            {file.type || "FILE"} &bull; {file.fileUrl ? "Download Ready" : "Resource"}
                          </span>
                        </div>
                      </div>

                      {file.fileUrl ? (
                        <a
                          href={file.fileUrl.startsWith("http") ? file.fileUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${file.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[11px] flex items-center gap-1 transition shadow-md shrink-0 cursor-pointer"
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No File</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#0D1021]/50 border border-dashed border-[#1A1F35] text-center text-slate-500 text-xs">
                  No file attachments uploaded for this lesson yet.
                </div>
              )}
            </div>

            {/* Section 2: Personal Student Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Your  Notes</span>
                <span className="text-[10px] text-slate-500 font-mono">Auto-saved to workspace</span>
              </label>
              <textarea
                rows={6}
                value={personalStudentNote}
                onChange={(e) => {
                  setPersonalStudentNote(e.target.value);
                  if (typeof window !== "undefined" && lesson?.id) {
                    localStorage.setItem(`student_note_${lesson.id}`, e.target.value);
                  }
                }}
                placeholder="Write your personal study notes, reminders, or code snippets here..."
                className="w-full rounded-xl border border-slate-700 bg-slate-955 p-4 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Course Quiz</h2>

            {course?.quizzes?.length ? (
              <div className="space-y-3">
                {course.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                  >
                    <h3 className="font-semibold text-white">{quiz.title}</h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {quiz.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                      <span>Passing Score: {quiz.passingScore}%</span>

                      <span>{quiz.questions?.length || 0} Questions</span>
                    </div>

                    <button className="mt-4 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-700 cursor-pointer">
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No quizzes available for this course.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
