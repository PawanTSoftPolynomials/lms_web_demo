"use client";

import { useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { renderSlides } from "@/components/instructor/composer/utils/slideRenderer";
import NestedBlockLayer from "@/components/instructor/composer/blocks/shared/NestedBlockLayer";

export default function SlideshowBlockView({ block }) {
  const { slides, css } = useMemo(() => renderSlides(block.markdown), [block.markdown]);
  const [index, setIndex] = useState(0);
  const current = Math.min(index, Math.max(slides.length - 1, 0));

  if (slides.length === 0) {
    return <p className="text-slate-600 text-sm">No slides yet</p>;
  }

  return (
    <div className="space-y-3">
      {css && <style>{css}</style>}
      <div className="relative rounded-lg border border-border bg-background/40 p-4 min-h-[220px] overflow-auto">
        <div
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(slides[current], { ADD_TAGS: ["section"] }) }}
        />
        <NestedBlockLayer
          block={block}
          editable={false}
          filterChildren={(child) => (child.slideIndex ?? 0) === current}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Slide {current + 1} of {slides.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            className="p-1.5 rounded-lg border border-transparent text-foreground disabled:opacity-30 hover:bg-muted"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            disabled={current === slides.length - 1}
            onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}
            className="p-1.5 rounded-lg border border-transparent text-foreground disabled:opacity-30 hover:bg-muted"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
