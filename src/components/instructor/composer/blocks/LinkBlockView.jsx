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
      className="flex items-center gap-3 rounded-lg border border-transparent bg-muted px-4 py-3 hover:border-primary transition"
    >
      <LinkIcon size={18} className="text-primary shrink-0" />
      <span className="flex-1 text-sm text-foreground truncate">{block.title || block.url}</span>
      <ExternalLink size={16} className="text-muted-foreground shrink-0" />
    </a>
  );
}
