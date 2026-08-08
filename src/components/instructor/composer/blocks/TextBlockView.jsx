"use client";

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export default function TextBlockView({ block }) {
  const html = block.markdown
    ? DOMPurify.sanitize(marked.parse(block.markdown))
    : "";

  return (
    <div
      className="prose prose-invert prose-sm max-w-none"
      dangerouslySetInnerHTML={{
        __html: html || '<p class="text-slate-600">Empty text block</p>',
      }}
    />
  );
}
