"use client";

import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  SquareCode,
} from "lucide-react";

const BUTTONS = [
  { id: "heading", icon: Heading2, label: "Heading" },
  { id: "bold", icon: Bold, label: "Bold" },
  { id: "italic", icon: Italic, label: "Italic" },
  { id: "link", icon: Link2, label: "Link" },
  { id: "bulletList", icon: List, label: "Bullet List" },
  { id: "numberedList", icon: ListOrdered, label: "Numbered List" },
  { id: "quote", icon: Quote, label: "Quote" },
  { id: "inlineCode", icon: Code, label: "Inline Code" },
  { id: "codeBlock", icon: SquareCode, label: "Code Block" },
  { id: "hr", icon: Minus, label: "Horizontal Rule" },
];

/** Inserts Markdown syntax into the editor's textarea — never generates HTML. */
export default function MarkdownToolbar({ onAction }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-background/60 px-2 py-1.5">
      {BUTTONS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          onClick={() => onAction(id)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-primary cursor-pointer"
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
