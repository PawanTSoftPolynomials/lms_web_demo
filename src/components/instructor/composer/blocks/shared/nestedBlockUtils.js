/**
 * Shared helpers for the "nested child block" overlay feature on
 * image/video/audio blocks. Children live entirely inside the parent
 * block's own JSON `data` (see contentBlockMapper) as `block.children` — no
 * separate Content rows, no backend changes required.
 */

export const FULL_CROP = { x: 0, y: 0, w: 100, h: 100 };

/** Block types allowed to be cropped (they render actual pixels, not just controls). */
export const CROPPABLE_TYPES = new Set(["image", "video"]);

/** Block types whose primary content is a media URL, editable inline on the overlay box itself. */
export const MEDIA_URL_TYPES = new Set(["image", "video", "audio"]);

export function clampPercent(value) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function createChildBlock(blockType, blockRegistry, extraFields) {
  const entry = blockRegistry[blockType];
  const base = entry.defaultData();
  return {
    ...base,
    id: `child-${crypto.randomUUID()}`,
    position: { x: 8, y: 8 },
    size: { w: 36, h: 28 },
    crop: CROPPABLE_TYPES.has(blockType) ? { ...FULL_CROP } : null,
    ...extraFields,
  };
}

/**
 * Returns inline styles for a wrapper/inner pair that visually crops an
 * <img>/<video> to `crop` (percent x/y/w/h of the media's natural box) using
 * the overflow-hidden + oversized-and-translated element technique — no
 * canvas processing, no backend involvement.
 */
export function getCroppedMediaStyle(crop) {
  const c = crop || FULL_CROP;
  const w = c.w || 100;
  const h = c.h || 100;
  return {
    wrapper: {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
    },
    inner: {
      position: "absolute",
      width: `${(100 * 100) / w}%`,
      height: `${(100 * 100) / h}%`,
      left: `${(-c.x * 100) / w}%`,
      top: `${(-c.y * 100) / h}%`,
      maxWidth: "none",
      objectFit: "cover",
    },
  };
}
