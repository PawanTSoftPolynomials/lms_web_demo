/**
 * A single `Content` row as returned by GET /contents (lms-api, prisma `Content` model).
 * `type` is typed as `string` rather than the composer's own `ContentType` union because
 * existing rows may carry any of the backend's ~17 enum values, including ones this
 * composer doesn't render a cell for yet.
 */
export interface ContentRow {
  id: string;
  order: number;
  lessonId: string;
  type: string;
  title?: string | null;
  videoUrl?: string | null;
  fileUrl?: string | null;
  htmlContent?: string | null;
  externalUrl?: string | null;
  duration?: number | null;
}

/** Shared optional props every existing-row cell component accepts for the Duplicate action & block header UI. */
export interface CellActionProps {
  onDuplicate?: () => void;
  isDuplicating?: boolean;
  badgeText?: string;
  badgeVariant?: "heading" | "text" | "code" | "image" | "video" | "document" | "default";
  onSettingsSelect?: () => void;
  /** Opens the existing Add Content picker pre-targeted to insert immediately above/below this block — see blockOrder.ts. */
  onAddAbove?: () => void;
  onAddBelow?: () => void;
  /** True while this block is the Composer's current selection — keeps its hover-only chrome visible without a mouse (the touch-device fallback, since touch has no hover). */
  isSelected?: boolean;
}

/** Shared prop contract for every cell type's "Create" form, hosted inside AddCellModal. */
export interface CreateCellFormProps {
  lessonId: string;
  /** Pre-computed `max(existing order) + 1`, matching the pattern already used by every other create flow in this app. */
  order: number;
  onCreated: () => void;
  onCancel: () => void;
}
