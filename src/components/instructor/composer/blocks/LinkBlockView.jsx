"use client";

import { Link as LinkIcon, ExternalLink } from "lucide-react";

export default function LinkBlockView({ block }) {
  if (!block.url) {
    return <p className="text-slate-600 text-sm">No link URL set</p>;
  }

  return (
    <a
      href={block.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 hover:border-orange-500 transition"
    >
      <LinkIcon size={18} className="text-orange-400 shrink-0" />
      <span className="flex-1 text-sm text-slate-200 truncate">{block.title || block.url}</span>
      <ExternalLink size={16} className="text-slate-500 shrink-0" />
    </a>
  );
}
