"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Layers, UserRound, Star, ArrowUpRight, Loader2 } from "lucide-react";

import useEnrollCourse from "@/hooks/queries/student/useEnrollCourse";

/** Same discount-over-list-price precedence as the course detail page's own enroll logic. */
function getPriceInfo(store) {
  const isFree = !store || store.isFree || (!store.price && !store.discountPrice);
  if (isFree) return { isFree: true, effectivePrice: 0, listPrice: null, currency: "INR" };

  const hasDiscount = store.discountPrice !== null && store.discountPrice !== undefined && store.discountPrice > 0 && store.discountPrice < store.price;

  return {
    isFree: false,
    effectivePrice: hasDiscount ? store.discountPrice : store.price,
    listPrice: hasDiscount ? store.price : null,
    currency: store.currency || "INR",
  };
}

function formatPrice(amount, currency) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

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
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-2xl cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-36 shrink-0 overflow-hidden bg-slate-800">
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
            <BookOpen size={32} className="text-slate-600" />
          </div>
        )}

        <span className="absolute top-2.5 left-2.5 rounded-md border border-white/20 bg-black/50 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
          {course.category || "General"}
        </span>

        {/* Price tag */}
        <span
          className={`absolute top-2.5 right-2.5 rounded-md px-2.5 py-1 text-[11px] font-black shadow-lg ${
            isFree ? "bg-emerald-500 text-slate-950" : "bg-orange-500 text-slate-950"
          }`}
        >
          {isFree ? "FREE" : formatPrice(effectivePrice, currency)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <h3 className="text-base font-black text-white leading-snug line-clamp-1">{course.title}</h3>
          {course.description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-400 line-clamp-2">{course.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <UserRound size={12} className="text-slate-500" />
            <span className="truncate max-w-[110px]">{instructorName}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers size={12} className="text-slate-500" />
            {modulesTotal} modules
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen size={12} className="text-slate-500" />
            {lessonsTotal} lessons
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          {avgRating > 0 ? (
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Star size={13} className="fill-orange-400 text-orange-400" />
              {avgRating.toFixed(1)}
              <span className="text-slate-500">({reviewCount})</span>
            </span>
          ) : (
            <span className="text-slate-500">New course</span>
          )}
          <span className="font-bold text-orange-400">{course.level || "All Levels"}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {!isFree && listPrice && (
            <span className="text-xs text-slate-500 line-through">{formatPrice(listPrice, currency)}</span>
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
            className="ml-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-4 py-2 text-xs font-extrabold text-slate-950 transition active:scale-95 cursor-pointer"
          >
            {isFree && enrollMutation.isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                {isFree ? "Enroll Free" : "View & Buy"}
                <ArrowUpRight size={13} />
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
