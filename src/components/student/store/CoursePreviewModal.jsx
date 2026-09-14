"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Layers, UserRound, Loader2, ArrowUpRight } from "lucide-react";

import Modal from "@/components/ui/Modal";
import useEnrollCourse from "@/hooks/queries/student/useEnrollCourse";
import { getPriceInfo, formatPrice } from "@/lib/pricing";

/**
 * Non-enrolled preview of a course — description, duration, module count,
 * instructor — with an Enroll Now action. This is the only view a
 * not-yet-enrolled student gets from the Store; the full module/lesson
 * composer at /student/courses/[courseId] is enrollment-gated separately.
 *
 * Built on the shared `Modal` (portals to document.body) rather than a
 * bare `fixed inset-0` div: this component is always mounted as a child of
 * the Store card, and that card's `hover:-translate-y-1` compiles to the
 * standalone CSS `translate` property, which — like `transform` — creates a
 * new containing block for `position: fixed` descendants. Since the card is
 * necessarily hovered when its own "View" button is clicked, an un-portaled
 * fixed overlay here would get trapped inside the card's own (tiny) box
 * instead of covering the viewport.
 */
export default function CoursePreviewModal({ course, onClose }) {
  const router = useRouter();
  const enrollMutation = useEnrollCourse();
  const [enrollError, setEnrollError] = useState("");
  const { isFree, effectivePrice, currency } = getPriceInfo(course.store);

  const modulesTotal = course._count?.modules ?? 0;
  const instructorName = course.creator?.name || "Instructor";

  // Same precedence as the public course details page: an instructor-set
  // estimate wins, falling back to a rough per-lesson estimate, since a
  // flat default used to claim the same duration for every course.
  const lessonsTotal = course._count?.lessons ?? course.stats?.lessonsCount ?? 0;
  const duration = course.estimatedLearningHours
    ? `${course.estimatedLearningHours} hours`
    : lessonsTotal > 0
      ? `${Math.max(1, Math.round((lessonsTotal * 25) / 60))} hours`
      : "Not set yet";

  const handleEnrollNow = async () => {
    if (!isFree) {
      router.push(`/courses/${course.id}`);
      return;
    }
    if (enrollMutation.isPending) return;
    setEnrollError("");
    try {
      await enrollMutation.mutateAsync(course.id);
      router.push("/student/my-courses");
    } catch (err) {
      setEnrollError(err?.response?.data?.message || "Failed to enroll. Please try again.");
    }
  };

  // React bubbles portal-rendered events through the *component* tree, not
  // the DOM tree — so a click on Modal's backdrop (which doesn't stop
  // propagation itself) would otherwise keep bubbling up to this card's own
  // onClick and immediately reopen the modal it just closed.
  const handleClose = (e) => {
    e?.stopPropagation?.();
    onClose();
  };

  return (
    <Modal open onClose={handleClose} title={course.title} size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-[10px] font-bold text-foreground">
            {course.category || "General"}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-black ${
              isFree ? "bg-emerald-500 text-slate-950" : "bg-primary text-slate-950"
            }`}
          >
            {isFree ? "FREE" : formatPrice(effectivePrice, currency)}
          </span>
        </div>

        {course.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{course.description}</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-background/60 p-3 text-center">
            <Clock size={14} className="mx-auto mb-1 text-primary" />
            <p className="text-xs font-bold text-foreground">{duration}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Duration</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-3 text-center">
            <Layers size={14} className="mx-auto mb-1 text-primary" />
            <p className="text-xs font-bold text-foreground">{modulesTotal}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Modules</p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-3 text-center">
            <BookOpen size={14} className="mx-auto mb-1 text-primary" />
            <p className="text-xs font-bold text-foreground">{course.level || "All Levels"}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Level</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserRound size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Instructor</p>
            <p className="text-xs font-bold text-foreground truncate">{instructorName}</p>
          </div>
        </div>

        {enrollError && <p className="text-[11px] font-semibold text-red-400">{enrollError}</p>}

        <div className="pt-1 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted text-foreground hover:text-foreground text-xs font-bold cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleEnrollNow}
            disabled={isFree && enrollMutation.isPending}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-orange-600 disabled:opacity-60 text-slate-950 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
          >
            {isFree && enrollMutation.isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <span>Enroll Now</span>
                <ArrowUpRight size={13} />
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
