"use client";

import { useMemo, useState } from "react";
import { Marp } from "@marp-team/marp-core";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { ChevronLeft, ChevronRight } from "lucide-react";

function renderSlides(markdown) {
  if (!markdown) return { slides: [], css: "" };

  try {
    const marp = new Marp({ script: false });
    const { html, css } = marp.render(markdown);

    if (typeof DOMParser !== "undefined") {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const sections = Array.from(doc.querySelectorAll("section"));
      if (sections.length > 0) {
        return { slides: sections.map((s) => s.outerHTML), css };
      }
    }
  } catch (error) {
    console.error("Marp rendering error, falling back to naive split:", error);
  }

  // Fallback: naive split on a line containing only `---`.
  const parts = markdown.split(/\n---\n|\n---\r\n/);
  return {
    slides: parts.map(
      (part) => `<section>${DOMPurify.sanitize(marked.parse(part))}</section>`,
    ),
    css: "",
  };
}

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
      <div
        className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 min-h-[220px] overflow-auto"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(slides[current], { ADD_TAGS: ["section"] }) }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Slide {current + 1} of {slides.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-30 hover:bg-slate-800"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            disabled={current === slides.length - 1}
            onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-30 hover:bg-slate-800"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
