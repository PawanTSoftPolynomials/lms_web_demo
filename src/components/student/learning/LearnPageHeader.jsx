"use client";

import { PanelLeftOpen, StickyNote } from "lucide-react";

import ProgressBar from "@/components/student/courses/ProgressBar";

// Sticky sub-header for the learning workspace — course-map toggle, the
// lesson/topic currently playing in the content player, and the Sticky
// Notes trigger. The shared dashboard Navbar (logo/nav/search/chat/
// notifications/profile) already renders above this on every Student page,
// including this one, so this stays scoped to what's unique to the
// immersive learning workspace instead of duplicating those controls.
export default function LearnPageHeader({
  courseSidebarOpen,
  onOpenSidebar,
  selectedLesson,
  topicTitle,
  course,
  courseProgress = null,
  isProgressUnavailable = false,
  isStickyNotesOpen,
  onToggleStickyNotes,
}) {
  // Backend roll-up for the whole course. `applicable` is the server's own
  // "this course has items that count" flag — when it is false the course has
  // nothing tracked yet, and showing "0% complete" would read as the student
  // having failed to start rather than there being nothing to start.
  const showProgress = !!courseProgress && courseProgress.applicable;
  const percent = courseProgress?.progressPercent ?? 0;

  return (
    <header className="sticky top-0 bg-[#07080f]/80 backdrop-blur-md border-b border-[#1e2030]/40 py-3 px-4 sm:px-6 flex items-center justify-between z-30 select-none">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {!courseSidebarOpen && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="hidden xl:flex shrink-0 h-9 w-9 items-center justify-center rounded-full border border-primary/50 bg-background text-primary shadow-md transition hover:bg-primary/10 hover:border-primary hover:text-orange-300 cursor-pointer"
            aria-label="Show course map"
            title="Show course map"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate block">
            LEARNING WORKSPACE
          </span>
          <h2 className="text-sm font-bold text-foreground truncate">
            {selectedLesson ? `Lesson: ${selectedLesson.title}` : course?.title || "Course Overview"}
          </h2>
          {topicTitle && (
            <p className="text-xs text-muted-foreground truncate">Topic: {topicTitle}</p>
          )}
        </div>
      </div>

      {/* COURSE PROGRESS — the workspace's persistent "where am I in this
          course" readout. Percentage and counts come straight from the backend
          roll-up; nothing is computed here. Hidden below sm, where the header
          only has room for the lesson title and the notes toggle. */}
      {isProgressUnavailable && (
        <span className="hidden sm:block shrink-0 mr-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Progress unavailable
        </span>
      )}

      {showProgress && (
        <div className="hidden sm:flex shrink-0 items-center gap-3 mr-3 min-w-0">
          <div className="text-right min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block leading-none">
              Progress
            </span>
            <span className="text-xs font-bold text-foreground leading-none">
              {percent}%
              <span className="text-muted-foreground font-semibold">
                {" "}
                · {courseProgress.completedItems}/{courseProgress.totalItems}
              </span>
            </span>
          </div>
          <div className="w-24 lg:w-32" aria-label="Course progress">
            <ProgressBar value={percent} size="xs" variant="gradient" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onToggleStickyNotes}
        className={`shrink-0 h-9 w-9 flex items-center justify-center rounded-full border transition cursor-pointer ${
          isStickyNotesOpen
            ? "bg-muted border-transparent text-primary"
            : "border-border bg-background/60 text-muted-foreground hover:text-primary hover:border-primary/40"
        }`}
        title={isStickyNotesOpen ? "Hide Sticky Notes" : "Open Sticky Notes"}
        aria-label={isStickyNotesOpen ? "Hide Sticky Notes" : "Open Sticky Notes"}
        aria-pressed={isStickyNotesOpen}
      >
        <StickyNote size={16} />
      </button>
    </header>
  );
}
