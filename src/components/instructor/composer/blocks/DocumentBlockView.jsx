"use client";

import { FileText, Download } from "lucide-react";

export default function DocumentBlockView({ block }) {
  if (!block.url) {
    return <p className="text-slate-600 text-sm">No document URL set</p>;
  }

  return (
    <a
      href={block.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-lg border border-transparent bg-muted px-4 py-3 hover:border-primary transition"
    >
      <FileText size={20} className="text-primary shrink-0" />
      <span className="flex-1 text-sm text-foreground truncate">
        {block.title || block.originalPath || "Document"}
      </span>
      <Download size={16} className="text-muted-foreground shrink-0" />
    </a>
  );
}
