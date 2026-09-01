"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Layers, ArrowRight } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { getDisplayUrl } from "@/lib/blob";
import { getPriceInfo, formatPrice } from "@/lib/pricing";

export default function FeaturedCourseCard({ course }) {
  if (!course) return null;

  const sessionsCount = course.lessonsCount ?? course.modules?.length ?? course.modulesCount ?? 0;
  const { isFree, effectivePrice, listPrice, currency } = getPriceInfo(course.store);
  const rating = course.rating ? Number(course.rating) : null;

  const isLogo = course.thumbnailUrl && (
    course.thumbnailUrl.includes("gstatic.com") ||
    course.thumbnailUrl.includes("miro.medium.com") ||
    course.thumbnailUrl.includes("logo") ||
    course.thumbnailUrl.includes("brand")
  );

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-luxury-sm transition-all duration-300 hover:shadow-luxury-md hover:-translate-y-1.5 motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Banner Image (Fixed 16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video shrink-0 overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          isLogo ? (
            <div className="flex h-full w-full items-center justify-center bg-muted p-10">
              <div className="relative h-20 w-20">
                <Image
                  src={getDisplayUrl(course.thumbnailUrl)}
                  alt={`${course.title} thumbnail`}
                  fill
                  unoptimized
                  className="object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                />
              </div>
            </div>
          ) : (
            <Image
              src={getDisplayUrl(course.thumbnailUrl)}
              alt={`${course.title} thumbnail`}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/20">
            <span className="text-5xl" aria-hidden="true">📚</span>
          </div>
        )}

        {course.category && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
            {course.category}
          </span>
        )}

        {course.level && (
          <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur-sm">
            {course.level}
          </span>
        )}
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold leading-snug text-foreground line-clamp-2">
          {course.title}
        </h3>

        {course.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-muted-foreground">
          {rating !== null && (
            <span className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
              {course.reviewsCount ? ` (${course.reviewsCount})` : ""}
            </span>
          )}
          {sessionsCount > 0 && (
            <span className="flex items-center gap-1">
              <Layers size={13} />
              {sessionsCount} lessons
            </span>
          )}
        </div>

        {course.instructorName && (
          <div className="mt-4 flex items-center gap-2">
            <Avatar className="size-6 shrink-0">
              <AvatarFallback className="text-[10px]">
                {course.instructorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs font-medium text-muted-foreground">
              {course.instructorName}
            </span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {isFree ? "Free" : formatPrice(effectivePrice, currency)}
            </span>
            {listPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(listPrice, currency)}
              </span>
            )}
          </div>

          <span className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition group-hover:brightness-110">
            View Course
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
