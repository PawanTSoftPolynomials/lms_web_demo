"use client";

import { splitIntoParagraphs, parseInlineEmphasis } from "@/components/student/adaptiveCopy";

/**
 * Renders the tutor's explanation as readable paragraphs instead of one
 * whitespace-pre-line wall of text — same content, better presentation.
 * `**bold**` segments (which qwen3 reliably produces for emphasis) render as
 * <strong>; nothing is added, removed, or reworded.
 */
export default function AdaptiveTutorMessage({ text }) {
  const paragraphs = splitIntoParagraphs(text);

  if (paragraphs.length === 0) return null;

  return (
    <div className="space-y-2.5 text-sm text-slate-200 leading-relaxed">
      {paragraphs.map((paragraph, pIndex) => (
        <p key={pIndex}>
          {parseInlineEmphasis(paragraph).map((segment, sIndex) =>
            segment.bold ? (
              <strong key={sIndex} className="text-white font-semibold">
                {segment.text}
              </strong>
            ) : (
              <span key={sIndex}>{segment.text}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}
