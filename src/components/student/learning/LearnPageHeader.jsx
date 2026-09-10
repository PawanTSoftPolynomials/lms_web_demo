"use client";

import { ListTree, PanelLeftOpen, StickyNote } from "lucide-react";
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
  courseProgress,
  isProgressUnavailable,
  onOpenStickyNotes,
  // Below xl the header identifies the course and the module being studied,
  // and the course map is a drawer rather than a rail — the lesson's own
  // title/number/topic live in the page body so the content leads.
  moduleTitle,
  onOpenCourseMap,
}) {
  // Straight passthrough of the backend roll-up (see lib/progressIndex.js) —
  // `applicable` is the backend's own "this course has tracked items" flag,
  // so an empty/untracked course shows neither state instead of a stray 0%.
  const showProgress = !isProgressUnavailable && !!courseProgress?.applicable;
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
          <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">
            LEARNING WORKSPACE
          </span>
          <h2 className="hidden xl:block text-sm font-bold text-foreground truncate">
            {selectedLesson ? `Lesson: ${selectedLesson.title}` : course?.title || "Course Overview"}
          </h2>
          {topicTitle && (
            <p className="hidden xl:block text-xs text-muted-foreground truncate">Topic: {topicTitle}</p>
          )}

          {/* Below xl: course, then the module it belongs to. */}
          <h2 className="xl:hidden text-sm font-bold text-foreground truncate">
            {course?.title || "Course"}
          </h2>
          {moduleTitle && (
            <p className="xl:hidden text-[11px] text-muted-foreground truncate">{moduleTitle}</p>
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
            {/* The backend denominator is every applicable Content, Quiz and
                Assignment in the published tree, at all four levels — not
                Content alone — so the count is labelled "items". Calling it
                anything narrower would misdescribe what it counts. */}
            <span className="text-xs font-bold text-foreground leading-none whitespace-nowrap">
              {percent}%
              <span className="text-muted-foreground font-semibold">
                {" "}
                · {courseProgress.completedItems}/{courseProgress.totalItems} items
              </span>
            </span>
          </div>
          <div className="w-24 lg:w-32" aria-label="Course progress">
            <ProgressBar value={percent} size="xs" variant="gradient" />
          </div>
        </div>
      )}

      {/* Course map, below xl only: one tap to the full hierarchy, rather than
          a rail permanently taking the narrow screen's width. */}
      <button
        type="button"
        onClick={onOpenCourseMap}
        className="xl:hidden shrink-0 mr-2 inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/5 px-2.5 py-2 text-xs font-bold text-primary transition hover:bg-primary/10 cursor-pointer"
        aria-label="Open course map"
      >
        <ListTree size={14} className="shrink-0" aria-hidden="true" />
        Course Map
      </button>

      <button
        type="button"
        onClick={onOpenStickyNotes}
        className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition cursor-pointer"
        title="Sticky Notes"
        aria-label="Open Sticky Notes"
      >
        <StickyNote size={16} />
      </button>
    </header>
  );
}
