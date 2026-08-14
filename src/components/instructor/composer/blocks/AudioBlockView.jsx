"use client";

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export default function AudioBlockView({ block }) {
  const captionHtml = block.caption ? DOMPurify.sanitize(marked.parse(block.caption)) : "";

  return (
    <div className="space-y-3">
      {block.url ? (
        <audio controls src={block.url} className="w-full" />
      ) : (
        <p className="text-slate-600 text-sm">No audio URL set</p>
      )}
      {captionHtml && (
        <div
          className="prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: captionHtml }}
        />
      )}
    </div>
  );
}
