"use client";

import { Minus, Plus } from "lucide-react";

import { renderColumnContent } from "./renderColumnContent";
import {
  DEFAULT_SLIDE_BACKGROUND,
  MAX_SLIDE_COLUMNS,
  MIN_SLIDE_COLUMNS,
  createColumn,
  type ColumnContentType,
  type SlideColumn,
} from "./slideElementTypes";

interface SlideColumnsViewProps {
  columns: SlideColumn[];
  /** Slide-level property, applied to the layout container. */
  backgroundColor?: string;
}

/**
 * Read-only renderer for a slide's columns — a compact PPT-style viewport
 * (max-width ~1000px, 16:9 preferred shape via `aspect-video`), not a huge
 * content block and not a scrollable document. `aspect-ratio` here is only
 * a *preferred* size for `height: auto`: with no explicit height and no
 * `overflow: hidden`, a slide with content taller than 16:9 grows past that
 * ratio to fit it rather than clipping or scrolling — short slides stay
 * compact, long ones just aren't locked to a box too small for them.
 * Columns stack vertically below `sm` for narrow instructor-panel widths
 * (the reference Composer's row layout has no such breakpoint and clips on
 * small screens).
 */
export function SlideColumnsView({ columns, backgroundColor = DEFAULT_SLIDE_BACKGROUND }: SlideColumnsViewProps) {
  if (columns.length === 0) {
    return (
      <div
        className="mx-auto flex aspect-video w-full max-w-[1000px] items-center justify-center rounded-xl border border-slate-800 p-8 text-center text-xs italic text-slate-500"
        style={{ backgroundColor }}
      >
        No columns configured.
      </div>
    );
  }

  return (
    <div
      className="mx-auto aspect-video w-full max-w-[1000px] rounded-xl border border-slate-800 p-5 sm:p-6 shadow-inner"
      style={{ backgroundColor }}
    >
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-0">
            {column.content ? (
              <div
                className="prose prose-invert prose-sm max-w-none break-words"
                dangerouslySetInnerHTML={{ __html: renderColumnContent(column) }}
              />
            ) : (
              <p className="text-xs italic text-slate-500">Empty column</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SlideColumnsEditorProps {
  columns: SlideColumn[];
  /** Slide-level property, applied to the layout container so the editor preview matches the viewer. */
  backgroundColor: string;
  onChange: (columns: SlideColumn[]) => void;
}

const COLUMN_TYPES: ColumnContentType[] = ["markdown", "html"];

/**
 * Column-count stepper (1-4, equal-width — the reference has no custom
 * width support either) + one card per column with a Markdown/HTML toggle,
 * a raw text area, and a live sanitized preview underneath. Reducing the
 * count drops trailing columns; increasing appends a blank one — the
 * reference never exposed a column-editing UI at all (only a render-time
 * fallback fed by hand-authored sample JSON), so this editing flow is new.
 * This is the only slide-editing surface — no drag/drop, no positioned
 * elements, just Markdown/HTML per column with a live preview.
 */
export function SlideColumnsEditor({ columns, backgroundColor, onChange }: SlideColumnsEditorProps) {
  const addColumn = () => {
    if (columns.length >= MAX_SLIDE_COLUMNS) return;
    onChange([...columns, createColumn()]);
  };

  const removeColumn = () => {
    if (columns.length <= MIN_SLIDE_COLUMNS) return;
    onChange(columns.slice(0, -1));
  };

  const updateColumn = (id: string, patch: Partial<SlideColumn>) => {
    onChange(columns.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300">Columns</label>
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-0.5">
          <button
            type="button"
            onClick={removeColumn}
            disabled={columns.length <= MIN_SLIDE_COLUMNS}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer disabled:cursor-not-allowed"
            aria-label="Remove column"
          >
            <Minus size={12} />
          </button>
          <span className="w-6 text-center text-xs font-bold text-white">{columns.length}</span>
          <button
            type="button"
            onClick={addColumn}
            disabled={columns.length >= MAX_SLIDE_COLUMNS}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer disabled:cursor-not-allowed"
            aria-label="Add column"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      <div
        className="flex flex-col sm:flex-row gap-4 rounded-xl border border-slate-800 p-3 sm:p-4"
        style={{ backgroundColor }}
      >
        {columns.map((column, idx) => (
          <div
            key={column.id}
            className="flex-1 min-w-0 space-y-2 rounded-lg border border-slate-800 bg-slate-950/70 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Column {idx + 1}
              </span>
              <div className="flex items-center gap-0.5 rounded-lg border border-slate-800 bg-slate-900 p-0.5">
                {COLUMN_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateColumn(column.id, { contentType: type })}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition ${
                      column.contentType === type
                        ? "bg-orange-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={column.content}
              onChange={(e) => updateColumn(column.id, { content: e.target.value })}
              rows={5}
              placeholder={column.contentType === "markdown" ? "Write markdown…" : "Write HTML…"}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs text-white outline-none focus:border-orange-500 font-mono leading-relaxed resize-y"
            />

            <div className="rounded-lg border border-slate-800/60 bg-black/20 p-2.5">
              <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">Preview</p>
              {column.content ? (
                <div
                  className="prose prose-invert prose-sm max-w-none break-words text-slate-300"
                  dangerouslySetInnerHTML={{ __html: renderColumnContent(column) }}
                />
              ) : (
                <p className="text-[11px] italic text-slate-600">Nothing to preview yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
