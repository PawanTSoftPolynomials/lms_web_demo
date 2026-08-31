"use client";

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/** Shared textarea + live markdown preview, used by every block that authors markdown text. */
export default function MarkdownField({
  label,
  value,
  onChange,
  rows = 5,
  placeholder = "Write markdown…",
}) {
  const html = value ? DOMPurify.sanitize(marked.parse(value)) : "";

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-foreground">{label}</label>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-lg border border-transparent bg-muted px-3 py-2 text-sm font-mono outline-none focus:border-primary resize-y"
        />
        <div
          className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm prose prose-invert prose-sm max-w-none overflow-auto"
          style={{ minHeight: `${rows * 1.5}rem` }}
          dangerouslySetInnerHTML={{ __html: html || '<p class="text-slate-600">Preview…</p>' }}
        />
      </div>
    </div>
  );
}
