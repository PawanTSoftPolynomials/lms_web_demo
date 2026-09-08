"use client";

import { PanelLeftOpen, StickyNote } from "lucide-react";

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
  onOpenStickyNotes,
}) {
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
