"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { renderSlides } from "@/components/instructor/composer/utils/slideRenderer";
import NestedBlockLayer from "@/components/instructor/composer/blocks/shared/NestedBlockLayer";

/**
 * forwardRef so ContentBlockCard's "Add Block Inside" menu item can open
 * the picker for whichever slide is currently shown — delegates to the
 * NestedBlockLayer scoped to `current` via the imperative handle.
 */
const SlideshowBlockEdit = forwardRef(function SlideshowBlockEdit({ block, onChange }, ref) {
  const [index, setIndex] = useState(0);
  const nestedRef = useRef(null);
  const { slides, css } = useMemo(() => renderSlides(block.markdown), [block.markdown]);
  const current = Math.min(index, Math.max(slides.length - 1, 0));

  useImperativeHandle(ref, () => ({
    openPicker: () => nestedRef.current?.openPicker(),
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-foreground">
          Slide markdown — separate slides with a line containing only{" "}
          <code className="text-primary">---</code>
        </label>
        <textarea
          value={block.markdown || ""}
          onChange={(e) => onChange({ markdown: e.target.value })}
          rows={10}
          placeholder={"# Slide 1\n\nContent here\n\n---\n\n# Slide 2\n\nMore content"}
          className="w-full rounded-lg border border-transparent bg-muted px-3 py-2 text-sm font-mono outline-none focus:border-primary resize-y"
        />
      </div>

      {slides.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Live preview — drag nested blocks onto this slide
          </p>
          {css && <style>{css}</style>}
          <div className="relative rounded-lg border border-border bg-background/40 p-4 min-h-[220px] overflow-auto">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(slides[current], { ADD_TAGS: ["section"] }),
              }}
            />
            <NestedBlockLayer
              ref={nestedRef}
              block={block}
              onChange={onChange}
              editable
              filterChildren={(child) => (child.slideIndex ?? 0) === current}
              extraChildFields={{ slideIndex: current }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Slide {current + 1} of {slides.length} — nested blocks attach to whichever slide is shown here
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
      )}
    </div>
  );
});

export default SlideshowBlockEdit;
