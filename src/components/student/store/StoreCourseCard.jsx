"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Layers, UserRound, Star, ArrowUpRight, Loader2 } from "lucide-react";

import useEnrollCourse from "@/hooks/queries/student/useEnrollCourse";
import { getPriceInfo, formatPrice } from "@/lib/pricing";

export default function StoreCourseCard({ course }) {
  const router = useRouter();
  const enrollMutation = useEnrollCourse();
  const [enrollError, setEnrollError] = useState("");
  const { isFree, effectivePrice, listPrice, currency } = getPriceInfo(course.store);

  const modulesTotal = course._count?.modules ?? 0;
  const lessonsTotal = course._count?.lessons ?? course.stats?.lessonsCount ?? 0;
  const avgRating = course.stats?.avgRating || 0;
  const reviewCount = course._count?.reviews || 0;
  const instructorName = course.creator?.name || "Instructor";

  const goToDetails = () => router.push(`/student/courses/${course.id}`);

  // Free courses need no checkout -- enroll immediately and drop the
  // student straight into My Courses instead of detouring through the
  // course detail/marketing page (that detour is what was landing on
  // /student/courses and lighting up the "AI Recommendations" tab, since
  // that tab's href is also /student/courses).
  const handleEnrollFree = async (e) => {
    e.stopPropagation();
    if (enrollMutation.isPending) return;
    setEnrollError("");
    try {
      await enrollMutation.mutateAsync(course.id);
      router.push("/student/my-courses");
    } catch (err) {
      setEnrollError(err?.response?.data?.message || "Failed to enroll. Please try again.");
    }
  };

  return (
    <div
      onClick={goToDetails}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-28 shrink-0 overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen size={28} className="text-slate-600" />
          </div>
        )}

        <span className="absolute top-2 left-2 rounded-md border border-white/20 bg-black/50 backdrop-blur px-1.5 py-0.5 text-[10px] font-bold text-foreground">
          {course.category || "General"}
        </span>

        {/* Price tag */}
        <span
          className={`absolute top-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-black shadow-lg ${
            isFree ? "bg-emerald-500 text-slate-950" : "bg-primary text-slate-950"
          }`}
        >
          {isFree ? "FREE" : formatPrice(effectivePrice, currency)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="text-[13px] md:text-sm font-black text-foreground leading-snug line-clamp-1">{course.title}</h3>
          {course.description && (
            <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground line-clamp-1">{course.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UserRound size={10} className="text-muted-foreground" />
            <span className="truncate max-w-[80px]">{instructorName}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers size={10} className="text-muted-foreground" />
            {modulesTotal}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen size={10} className="text-muted-foreground" />
            {lessonsTotal}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] pt-0.5">
          {avgRating > 0 ? (
            <span className="inline-flex items-center gap-1 text-foreground">
              <Star size={10} className="fill-orange-400 text-primary" />
              {avgRating.toFixed(1)}
              <span className="text-muted-foreground">({reviewCount})</span>
            </span>
          ) : (
            <span className="text-muted-foreground">New course</span>
          )}
          <span className="font-bold text-primary">{course.level || "All Levels"}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          {!isFree && listPrice && (
            <span className="text-[10px] text-muted-foreground line-through">{formatPrice(listPrice, currency)}</span>
          )}
          <button
            onClick={
              isFree
                ? handleEnrollFree
                : (e) => {
                    e.stopPropagation();
                    goToDetails();
                  }
            }
            disabled={isFree && enrollMutation.isPending}
            className="ml-auto inline-flex items-center justify-center gap-1 rounded-lg bg-primary hover:bg-orange-600 disabled:opacity-60 px-2.5 py-1.5 text-[10px] font-extrabold text-slate-950 transition active:scale-95 cursor-pointer"
          >
            {isFree && enrollMutation.isPending ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                {isFree ? "Enroll Free" : "Buy"}
                <ArrowUpRight size={12} />
              </>
            )}
          </button>
        </div>

        {enrollError && (
          <p className="text-[11px] font-semibold text-red-400 -mt-1">{enrollError}</p>
        )}
      </div>
    </div>
  );
}
