"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

const EMBLA_OPTIONS = {
  align: "start",
  containScroll: "trimSnaps",
  dragFree: false,
};

// 1 full card on mobile (dots pagination) -> 2 on tablet -> 4 + a peek on
// desktop (arrow pagination). The mobile call site is only ever mounted
// below the `sm` breakpoint, and the desktop/tablet call site only at or
// above it, so the un-prefixed class only ever matters for the former.
const SLIDE_BASIS_CLASS = "basis-full sm:basis-[47%] lg:basis-[23%]";

// Shared by the mobile and desktop dashboard trees: a fully responsive Embla
// carousel. Card design/content is untouched — this only replaces the
// container. `navVariant="arrows"` (desktop/tablet) shows Previous/Next
// buttons in the header; `navVariant="dots"` (mobile) hides them in favor of
// centered pagination dots below the card.
export default function RecommendedCoursesCarousel({
  title,
  titleClassName = "text-sm font-black text-slate-200",
  viewAllHref,
  headerClassName = "mb-4",
  viewportClassName = "",
  courses,
  isLoading,
  renderCard,
  emptyMessage = "No new recommendations right now.",
  navVariant = "arrows",
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(EMBLA_OPTIONS, [
    WheelGesturesPlugin({ forceWheelAxis: "x" }),
  ]);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback((api) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const onInit = useCallback((api) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("select", onSelect).on("reInit", onInit).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onInit).off("reInit", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollNext();
    }
  };

  const showNav = navVariant === "arrows" && !isLoading && courses && courses.length > 0;
  const showDots = navVariant === "dots" && !isLoading && scrollSnaps.length > 1;

  return (
    <div>
      <div className={`flex items-center justify-between ${headerClassName}`}>
        <h3 className={titleClassName}>{title}</h3>
        <div className="flex items-center gap-1.5">
          {showNav && canScrollPrev && (
            <button
              type="button"
              onClick={scrollPrev}
              aria-label={`Previous ${title}`}
              className="h-7 w-7 shrink-0 rounded-lg border border-[#1A1F35] bg-[#0D1021] text-slate-400 hover:text-orange-400 hover:border-orange-500/40 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
          )}
          {showNav && canScrollNext && (
            <button
              type="button"
              onClick={scrollNext}
              aria-label={`Next ${title}`}
              className="h-7 w-7 shrink-0 rounded-lg border border-[#1A1F35] bg-[#0D1021] text-slate-400 hover:text-orange-400 hover:border-orange-500/40 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          )}
          <Link
            href={viewAllHref}
            className="text-[11px] text-orange-400 font-bold hover:text-orange-300 ml-1 shrink-0"
          >
            View all
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {(navVariant === "dots" ? [1] : [1, 2, 3, 4]).map((n) => (
            <div
              key={n}
              className={`shrink-0 grow-0 min-w-0 ${SLIDE_BASIS_CLASS} h-[92px] rounded-xl bg-slate-800/50 animate-pulse`}
            />
          ))}
        </div>
      ) : !courses || courses.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">{emptyMessage}</p>
      ) : (
        <div
          ref={emblaRef}
          className={`overflow-hidden rounded-xl select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 ${viewportClassName}`}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={title}
          onKeyDown={handleKeyDown}
        >
          <div className="flex gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`min-w-0 shrink-0 grow-0 ${SLIDE_BASIS_CLASS}`}
              >
                {renderCard(course)}
              </div>
            ))}
          </div>
        </div>
      )}

      {showDots && (
        <div className="flex items-center justify-center gap-1.5 mt-3.5">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1} of ${scrollSnaps.length}`}
              aria-current={index === selectedIndex}
              className={`h-1.5 rounded-full transition-all duration-300 ease-out cursor-pointer ${
                index === selectedIndex ? "w-5 bg-orange-500" : "w-1.5 bg-slate-700"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
