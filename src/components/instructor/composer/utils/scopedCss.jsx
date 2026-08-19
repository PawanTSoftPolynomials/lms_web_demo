"use client";

/**
 * Composer blocks support a raw per-block CSS override (ported from the
 * CourseComposer source tool's `cssStyles` field). It's full CSS syntax,
 * not just inline `property: value` declarations, so it can't be applied
 * via a React `style` object — instead we scope it to a class unique to
 * the block and inject it as a real <style> tag.
 */
export function blockScopeClass(blockId) {
  return `composer-block-${blockId}`;
}

export function ScopedCss({ blockId, css }) {
  if (!css || !css.trim()) return null;

  return (
    <style>{`.${blockScopeClass(blockId)} { ${css} }`}</style>
  );
}
