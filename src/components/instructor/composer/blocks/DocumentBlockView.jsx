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
      className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 hover:border-orange-500 transition"
    >
      <FileText size={20} className="text-orange-400 shrink-0" />
      <span className="flex-1 text-sm text-slate-200 truncate">
        {block.title || block.originalPath || "Document"}
      </span>
      <Download size={16} className="text-slate-500 shrink-0" />
    </a>
  );
}
