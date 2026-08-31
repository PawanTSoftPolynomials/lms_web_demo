"use client";

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { blockRegistry } from "@/components/instructor/composer/blocks/blockRegistry";
import FlowNestedChildren from "@/components/instructor/composer/blocks/shared/FlowNestedChildren";
import { tokenizeMarkdown, groupChildrenByAnchor } from "@/components/instructor/composer/blocks/shared/flowNestingUtils";

export default function TextBlockView({ block, allLessonContents }) {
  const children = (allLessonContents || []).filter((c) => c.parentContentId === block.id);

  if (children.length === 0) {
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

  const tokens = tokenizeMarkdown(block.markdown);
  const childrenByAnchor = groupChildrenByAnchor(children, tokens.length);

  return (
    <FlowNestedChildren
      tokens={tokens}
      childrenByAnchor={childrenByAnchor}
      renderChild={(child) => {
        const entry = blockRegistry[child.blockType] || blockRegistry.unknown;
        const ChildView = entry.ViewComponent;
        return (
          <div className="rounded-lg border border-border/80 bg-background/40 p-3">
            <ChildView block={child} allLessonContents={allLessonContents} />
          </div>
        );
      }}
    />
  );
}
