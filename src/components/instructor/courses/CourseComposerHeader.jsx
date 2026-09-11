"use client";

import { Sparkles } from "lucide-react";

export function CourseComposerHeader({
  onOpenAskAi,
  onToggleSidebar,
}) {
  return (
    <>
      {/* The title bar is gone — "Course Overview" already shows the course
          title in the main panel. The mobile Course Map toggle still needs a
          way in below lg (there's no other entry point to that drawer), so
          it survives as its own small floating button instead of a full bar.
          z-30 keeps it under the mobile drawer (z-50) and its backdrop
          (z-40). Status and the Publish/Unpublish/Restore/Save actions live
          on the Course Header cell in Course Overview; Ask OTree AI floats
          as its own button below. */}
      <button
        type="button"
        className="menu-toggle-btn lg:hidden fixed top-20 right-3 z-30 inline-flex shrink-0 items-center justify-center h-11 w-11 rounded-xl border border-border bg-background text-foreground shadow-xl hover:text-foreground cursor-pointer"
        id="toggleSidebarBtn"
        onClick={onToggleSidebar}
        title="Toggle Sidebar"
        aria-label="Toggle Course Map"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* ✨ Ask OTree AI — floating page-wide, not scoped to any one composer
          view, so it stays reachable however far the workspace is scrolled.
          z-40 sits above the header/drawer backdrop but below a Modal (z-9999). */}
      {onOpenAskAi && (
        <button
          type="button"
          onClick={onOpenAskAi}
          className="btn fixed bottom-5 right-5 z-40 flex h-14 w-14 shrink-0 items-center justify-center bg-primary shadow-xl transition cursor-pointer"
          /* globals.css resets every <button> to border-radius:6px via an
             unlayered :where() rule, which (cascade-layer rules, not
             specificity) beats Tailwind's layered `rounded-full` utility —
             only an inline style reliably wins here. */
          style={{ "--btn-rainbow-fill": "#7C3AED", borderRadius: "9999px" }}
          title="Ask OTree AI Assistant"
          aria-label="Ask OTree AI Assistant"
        >
          <Sparkles size={22} className="fill-current animate-pulse" />
        </button>
      )}
    </>
  );
}
