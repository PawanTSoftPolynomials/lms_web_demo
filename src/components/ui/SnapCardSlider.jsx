"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Responsive card slider: below `md` the items lay out as a horizontal
 * scroll-snap carousel with pagination dots; from `md` up the very same
 * container becomes a CSS grid. One DOM, two behaviours, switched purely by
 * Tailwind breakpoints — no viewport JavaScript and no mobile-only component.
 *
 * Lifted verbatim from the My Courses page carousel so the Browse/Explore
 * page can reuse the identical interaction instead of becoming a fourth copy
 * of the same scroll/rAF/dots logic (the Instructor Courses and Instructor
 * Browse pages still carry their own inline copies).
 *
 * Deliberately knows nothing about courses: callers pass their own items and
 * render their own cards, and supply the desktop-only grid/item classes so
 * each page keeps the column counts its cards were designed for.
 */
export default function SnapCardSlider({
  items = [],
  getKey,
  renderItem,
  /** Desktop-only column classes, e.g. "md:grid-cols-3 lg:grid-cols-4". */
  gridClassName = "",
  /** Desktop-only per-item sizing, e.g. "md:max-w-72". */
  itemClassName = "",
  isLoading = false,
  skeletonCount = 6,
  skeleton = null,
  emptyState = null,
  dotsLabel = "Slides",
  getDotLabel,
}) {
  // Rides the native scroll-snap: no state drives the scroll position itself,
  // we only observe where it landed so the dots can highlight the centred card.
  const sliderRef = useRef(null);
  const scrollRaf = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const keyOf = (item, i) => getKey?.(item, i) ?? i;
  const firstKey = items.length ? keyOf(items[0], 0) : null;

  // Snap back to the first card whenever the list is replaced under us
  // (a filter change, a new page), so the dots never point past the end.
  useEffect(() => {
    sliderRef.current?.scrollTo({ left: 0 });
    setActiveSlide(0);
  }, [firstKey]);

  useEffect(() => () => {
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
  }, []);

  const handleSliderScroll = (e) => {
    const el = e.currentTarget;
    if (scrollRaf.current) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActiveSlide(closest);
    });
  };

  const goToSlide = (i) => {
    const child = sliderRef.current?.children[i];
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <>
      <div
        ref={sliderRef}
        onScroll={!isLoading && items.length > 0 ? handleSliderScroll : undefined}
        className={`flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-none pb-1 md:gap-4 md:pb-0 md:grid md:overflow-visible md:snap-none ${gridClassName}`}
      >
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className={`w-full shrink-0 px-[6%] md:px-0 md:w-full md:shrink ${itemClassName}`}
              >
                {skeleton}
              </div>
            ))
          : items.length === 0
          ? <div className="w-full col-span-full">{emptyState}</div>
          : items.map((item, i) => (
              <div
                key={keyOf(item, i)}
                className={`w-full shrink-0 snap-center px-[6%] md:px-0 md:w-full md:shrink ${itemClassName}`}
              >
                {renderItem(item, i)}
              </div>
            ))}
      </div>

      {!isLoading && items.length > 1 && (
        <div
          className="flex md:hidden items-center justify-center gap-1.5 pt-3"
          role="tablist"
          aria-label={dotsLabel}
        >
          {items.map((item, i) => (
            <button
              key={keyOf(item, i)}
              role="tab"
              aria-selected={i === activeSlide}
              aria-label={getDotLabel ? getDotLabel(item, i) : `Go to slide ${i + 1}`}
              onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeSlide ? "w-2 h-2 bg-primary" : "w-1.5 h-1.5 bg-slate-600"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
