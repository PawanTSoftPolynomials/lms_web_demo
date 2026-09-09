/**
 * A single `Content` row as returned by GET /contents (lms-api, prisma `Content` model).
 * `type` is typed as `string` rather than the composer's own `ContentType` union because
 * existing rows may carry any of the backend's ~17 enum values, including ones this
 * composer doesn't render a cell for yet.
 */
export interface ContentRow {
  id: string;
  order: number;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  topicId?: string | null;
  type: string;
  title?: string | null;
  videoUrl?: string | null;
  fileUrl?: string | null;
  htmlContent?: string | null;
  body?: string | null;
  externalUrl?: string | null;
  duration?: number | null;
  /** Free-form JSON metadata (backend `Content.data`) — currently only populated by the Assignment cell, which stores `{ originalFileName }` for its uploaded attachment (see AssignmentCell.tsx). */
  data?: Record<string, unknown> | null;
}

/** Which hierarchy level a Content Cell is attached to. */
export type ContentParentType = "course" | "module" | "lesson" | "topic";

/** Identifies a single parent — exactly one Content Cell owner. */
export interface ContentParent {
  parentType: ContentParentType;
  parentId: string;
}

const PARENT_FIELD_BY_TYPE: Record<ContentParentType, "courseId" | "moduleId" | "lessonId" | "topicId"> = {
  course: "courseId",
  module: "moduleId",
  lesson: "lessonId",
  topic: "topicId",
};

/** Builds the single wire field (`{ courseId }` / `{ moduleId }` / `{ lessonId }` / `{ topicId }`) a create/update payload sends for this parent. */
export function toParentField(parent: ContentParent): { courseId?: string; moduleId?: string; lessonId?: string; topicId?: string } {
  return { [PARENT_FIELD_BY_TYPE[parent.parentType]]: parent.parentId };
}

/** Reads whichever of courseId/moduleId/lessonId/topicId is set on a Content row (or any object with the same shape) and returns it as a ContentParent. Defaults to "topic" when only topicId is present, matching every row that existed before this feature. */
export function getContentParent(row: {
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  topicId?: string | null;
}): ContentParent {
  if (row.courseId) return { parentType: "course", parentId: row.courseId };
  if (row.moduleId) return { parentType: "module", parentId: row.moduleId };
  if (row.lessonId) return { parentType: "lesson", parentId: row.lessonId };
  return { parentType: "topic", parentId: row.topicId as string };
}

/** Shared optional props every existing-row cell component accepts for the Duplicate action & block header UI. */
export interface CellActionProps {
  onDuplicate?: () => void;
  isDuplicating?: boolean;
  badgeText?: string;
  badgeVariant?: "heading" | "text" | "code" | "image" | "video" | "document" | "assignment" | "default";
  onSettingsSelect?: () => void;
  /** Opens the existing Add Content picker pre-targeted to insert immediately above/below this block — see blockOrder.ts. */
  onAddAbove?: () => void;
  onAddBelow?: () => void;
  /** True while this block is the Composer's current selection — keeps its hover-only chrome visible without a mouse (the touch-device fallback, since touch has no hover). */
  isSelected?: boolean;
}

/** Shared prop contract for every cell type's "Create" form, hosted inside AddCellModal. */
export interface CreateCellFormProps {
  parent: ContentParent;
  /** Pre-computed `max(existing order) + 1`, matching the pattern already used by every other create flow in this app. */
  order: number;
  onCreated: () => void;
  onCancel: () => void;
}
