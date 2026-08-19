"use client";

import DOMPurify from "isomorphic-dompurify";
import { renderTokenHtml } from "./flowNestingUtils";

/**
 * Pure flow-layout renderer shared by Text/Slideshow-style markdown blocks,
 * in both edit and view mode — interleaves each anchored child at its token
 * index, in normal reading order. No x/y positioning; `order`/anchor alone
 * decide placement, matching the request's "block order is the source of
 * truth, never auto-moved to the bottom" requirement.
 */
export default function FlowNestedChildren({ tokens, childrenByAnchor, renderChild, renderInsertPoint }) {
  const rowCount = Math.max(tokens.length, childrenByAnchor.size > 0 ? 1 : 0);
  const rows = [];

  for (let i = 0; i < rowCount; i += 1) {
    if (i < tokens.length) {
      const html = DOMPurify.sanitize(renderTokenHtml(tokens[i]));
      rows.push(
        <div
          key={`token-${i}`}
          className="prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />,
      );
    }

    (childrenByAnchor.get(i) || []).forEach((child) => {
      rows.push(<div key={child.id}>{renderChild(child)}</div>);
    });

    if (renderInsertPoint) {
      rows.push(<div key={`insert-${i}`}>{renderInsertPoint(i)}</div>);
    }
  }

  return <div className="space-y-3">{rows}</div>;
}
