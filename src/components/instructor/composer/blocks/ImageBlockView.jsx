"use client";

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export default function ImageBlockView({ block }) {
  const captionHtml = block.caption
    ? DOMPurify.sanitize(marked.parse(block.caption))
    : "";

  return (
    <div className="space-y-3">
      {block.url ? (
        <img
          src={block.url}
          alt={block.title || "Image block"}
          className="max-w-full rounded-lg shadow-sm mx-auto"
        />
      ) : (
        <p className="text-slate-600 text-sm">No image URL set</p>
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
