"use client";

import Link from "next/link";
import { ChevronDown, HelpCircle, MessageSquare, Star, StickyNote } from "lucide-react";

import AskInstructorCard from "@/components/student/learning/AskInstructorCard";
import StickyNotesPanel from "@/components/student/sticky-notes/StickyNotesPanel";

// The learning workspace's side panel: four buttons, each showing or hiding
// its own feature below. One section is open at a time (the column is narrow);
// clicking the open one collapses it.
const FEATURES = [
  { id: "ask", label: "Ask instructor", icon: HelpCircle },
  { id: "notes", label: "Sticky notes", icon: StickyNote },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "reviews", label: "Reviews", icon: Star },
];

/** A short pointer to a page that has its own full form. */
function LinkSection({ title, description, href, cta }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      <Link
        href={href}
        className="mt-3 inline-flex min-h-[36px] items-center rounded-lg bg-primary px-3.5 text-xs font-bold text-slate-950 transition hover:bg-orange-600"
      >
        {cta}
      </Link>
    </div>
  );
}

/**
 * `activeFeature` / `onChangeFeature` are owned by the learn page, so the
 * header's Notes button can open the panel straight onto Sticky notes.
 * `null` means every section is collapsed.
 */
export default function LearnSidePanel({
  activeFeature,
  onChangeFeature,
  courseId,
  lessonId,
  askTarget,
  currentTimestamp,
  onSeek,
}) {
  const toggle = (id) => onChangeFeature(activeFeature === id ? null : id);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Learning tools">
        {FEATURES.map(({ id, label, icon: Icon }) => {
          const isOpen = activeFeature === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              aria-expanded={isOpen}
              aria-controls={`learn-side-${id}`}
              className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3 text-left text-sm font-semibold transition-colors cursor-pointer ${
                isOpen
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              <Icon size={16} className="shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <ChevronDown
                size={14}
                aria-hidden
                className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          );
        })}
      </div>

      {activeFeature && (
        <div id={`learn-side-${activeFeature}`} role="region" aria-label={FEATURES.find((f) => f.id === activeFeature)?.label}>
          {activeFeature === "ask" && <AskInstructorCard inline lessonId={lessonId} target={askTarget} />}

          {activeFeature === "notes" && (
            <StickyNotesPanel lessonId={lessonId} currentTimestamp={currentTimestamp} onSeek={onSeek} />
          )}

          {activeFeature === "feedback" && (
            <LinkSection
              title="Share feedback"
              description="Tell us what's working in this course and what isn't."
              href={`/student/feedback?courseId=${courseId}`}
              cta="Give feedback"
            />
          )}

          {activeFeature === "reviews" && (
            <LinkSection
              title="Rate this course"
              description="Leave a rating and see what other students think."
              href={`/student/reviews?courseId=${courseId}`}
              cta="Rate this course"
            />
          )}
        </div>
      )}
    </div>
  );
}
