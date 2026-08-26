"use client";

import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { getDisplayUrl } from "@/lib/blob";
import { getPriceInfo, formatPrice } from "@/lib/pricing";

export default function FeaturedCourseCard({ course, highlighted = false }) {
  if (!course) return null;

  const sessionsCount = course.lessonsCount ?? course.modules?.length ?? course.modulesCount ?? 0;
  const { isFree, effectivePrice, listPrice, currency } = getPriceInfo(course.store);

  const isLogo = course.thumbnailUrl && (
    course.thumbnailUrl.includes("gstatic.com") ||
    course.thumbnailUrl.includes("miro.medium.com") ||
    course.thumbnailUrl.includes("logo") ||
    course.thumbnailUrl.includes("brand")
  );

  return (
    <div
      className={`group rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1.5 transition-all duration-400 ${
        highlighted
          ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
          : "bg-card border border-card-border shadow-luxury-sm hover:shadow-luxury-md"
      }`}
    >
      {/* Banner Image (Fixed 16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video overflow-hidden bg-black/20 shrink-0">
        {course.thumbnailUrl ? (
          isLogo ? (
            <div className="flex h-full w-full items-center justify-center bg-black/10 p-10">
              <div className="relative h-20 w-20">
                <Image
                  src={getDisplayUrl(course.thumbnailUrl)}
                  alt={course.title}
                  fill
                  unoptimized
                  className="object-contain filter drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          ) : (
            <Image
              src={getDisplayUrl(course.thumbnailUrl)}
              alt={course.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center bg-black/10">
            <span className="text-5xl">📚</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-6 flex-1 flex flex-col">
        {course.category && (
          <span
            className={`text-[11px] font-bold tracking-wider uppercase mb-2 ${
              highlighted ? "text-primary-foreground/70" : "text-primary"
            }`}
          >
            {course.category}
          </span>
        )}

        <h3 className="text-lg font-bold tracking-tight leading-snug line-clamp-2 mb-3">
          {course.title}
        </h3>

        <div className="flex items-center justify-between gap-2">
          {course.instructorName && (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="text-[10px]">
                  {course.instructorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span
                className={`text-xs font-medium truncate ${
                  highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {course.instructorName}
              </span>
            </div>
          )}

          {sessionsCount > 0 && (
            <span
              className={`text-xs font-medium shrink-0 ${
                highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}
            >
              {sessionsCount} Sessions
            </span>
          )}
        </div>

        <div
          className={`mt-5 pt-4 flex items-center justify-between gap-3 border-t ${
            highlighted ? "border-primary-foreground/20" : "border-card-border"
          }`}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">
              {isFree ? "Free" : formatPrice(effectivePrice, currency)}
            </span>
            {listPrice && (
              <span
                className={`text-xs line-through ${
                  highlighted ? "text-primary-foreground/60" : "text-muted-foreground"
                }`}
              >
                {formatPrice(listPrice, currency)}
              </span>
            )}
          </div>

          <Link
            href={`/courses/${course.id}`}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition active:scale-[0.98] ${
              highlighted
                ? "bg-primary-foreground text-primary hover:brightness-95"
                : "bg-primary text-primary-foreground hover:brightness-110"
            }`}
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}
