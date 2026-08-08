"use client";

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { resolveVideoEmbed } from "@/components/instructor/composer/utils/videoEmbed";

export default function VideoBlockView({ block }) {
  const embed = resolveVideoEmbed(block.url);
  const captionHtml = block.caption
    ? DOMPurify.sanitize(marked.parse(block.caption))
    : "";

  return (
    <div className="space-y-3">
      {embed.kind === "iframe" && (
        <iframe
          src={embed.src}
          className="w-full aspect-video rounded-lg border border-slate-800 bg-black"
          allowFullScreen
        />
      )}
      {embed.kind === "video" && (
        <video
          src={embed.src}
          controls
          className="w-full max-h-[420px] rounded-lg bg-black"
        />
      )}
      {embed.kind === "none" && (
        <p className="text-slate-600 text-sm">No video URL set</p>
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
