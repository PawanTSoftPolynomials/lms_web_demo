"use client";

import { useRef, useState } from "react";
import { Eye, Pencil } from "lucide-react";

import MarkdownToolbar from "./MarkdownToolbar";
import MarkdownRenderer from "./MarkdownRenderer";

function applyWrap(textarea, value, onChange, { before, after = before, placeholder = "" }) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    const selStart = start + before.length;
    textarea.setSelectionRange(selStart, selStart + selected.length);
  });
}

function applyLinePrefix(textarea, value, onChange, prefixFn) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = value.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;

  const block = value.slice(lineStart, lineEnd);
  const newBlock = block
    .split("\n")
    .map((line, i) => prefixFn(line, i))
    .join("\n");
  const next = value.slice(0, lineStart) + newBlock + value.slice(lineEnd);
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(lineStart, lineStart + newBlock.length);
  });
}

function insertAtCursor(textarea, value, onChange, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const next = value.slice(0, start) + text + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    const pos = start + text.length;
    textarea.setSelectionRange(pos, pos);
  });
}

const ACTIONS = {
  heading: (t, v, onChange) =>
    applyLinePrefix(t, v, onChange, (line) => (line.startsWith("## ") ? line.slice(3) : `## ${line}`)),
  bold: (t, v, onChange) => applyWrap(t, v, onChange, { before: "**", placeholder: "bold text" }),
  italic: (t, v, onChange) => applyWrap(t, v, onChange, { before: "*", placeholder: "italic text" }),
  link: (t, v, onChange) =>
    applyWrap(t, v, onChange, { before: "[", after: "](https://)", placeholder: "link text" }),
  bulletList: (t, v, onChange) =>
    applyLinePrefix(t, v, onChange, (line) => (line.startsWith("- ") ? line.slice(2) : `- ${line}`)),
  numberedList: (t, v, onChange) =>
    applyLinePrefix(t, v, onChange, (line, i) =>
      /^\d+\.\s/.test(line) ? line.replace(/^\d+\.\s/, "") : `${i + 1}. ${line}`
    ),
  quote: (t, v, onChange) =>
    applyLinePrefix(t, v, onChange, (line) => (line.startsWith("> ") ? line.slice(2) : `> ${line}`)),
  inlineCode: (t, v, onChange) => applyWrap(t, v, onChange, { before: "`", placeholder: "code" }),
  codeBlock: (t, v, onChange) =>
    applyWrap(t, v, onChange, { before: "```\n", after: "\n```", placeholder: "code" }),
  hr: (t, v, onChange) => insertAtCursor(t, v, onChange, `${v.length && !v.endsWith("\n") ? "\n\n" : ""}---\n\n`),
};

/**
 * The single reusable Markdown authoring surface for Module/Lesson/Topic
 * descriptions and Content text blocks: toolbar + source textarea + live
 * preview, split side-by-side on desktop and tabbed on small screens. The
 * value it produces/consumes is always plain Markdown text — callers persist
 * it exactly as-is via their existing create/update API calls.
 */
export default function MarkdownEditor({
  value = "",
  onChange,
  placeholder = "Write in Markdown…",
  minHeight = 220,
}) {
  const textareaRef = useRef(null);
  const [mobileTab, setMobileTab] = useState("edit");

  const handleAction = (actionId) => {
    const textarea = textareaRef.current;
    const handler = ACTIONS[actionId];
    if (!textarea || !handler) return;
    handler(textarea, value, onChange);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
      <MarkdownToolbar onAction={handleAction} />

      <div className="flex sm:hidden border-b border-slate-800">
        {[
          { id: "edit", label: "Edit", icon: Pencil },
          { id: "preview", label: "Preview", icon: Eye },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobileTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-bold transition cursor-pointer ${
              mobileTab === id ? "text-orange-400 bg-slate-900" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 sm:divide-x divide-slate-800">
        <div className={mobileTab === "edit" ? "block" : "hidden sm:block"}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full resize-y bg-slate-900 px-4 py-3 font-mono text-sm text-slate-200 outline-none placeholder:text-slate-600"
          />
        </div>

        <div
          className={`overflow-y-auto bg-slate-950/60 px-4 py-3 ${mobileTab === "preview" ? "block" : "hidden sm:block"}`}
          style={{ minHeight, maxHeight: minHeight * 2 }}
        >
          <MarkdownRenderer source={value} emptyText="Nothing to preview yet." />
        </div>
      </div>
    </div>
  );
}
