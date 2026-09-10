import { groupLessonContentForDocumentView } from "./contentDocument.js";

/**
 * The whole-course Prev/Next sequence for the student learning player —
 * every stop the player can land on, in exactly the order the Course Map
 * lists rows at each level (CourseComposerSidebar's ParentContentRows):
 * sorted by `order`, ties broken by creation time, then content before
 * child rows (Lessons/Topics) before quizzes. Next therefore walks the
 * Course Map top to bottom; it used to put a level's own content before
 * its children, which disagreed with the map and stranded students.
 *
 * Course-level rows come first (the Course Map shows them above the module
 * tree). Within a Module, its own content/quizzes are interleaved with its
 * Lessons; within a Lesson that has Topics, its own content/quizzes are
 * interleaved with its Topics. Consecutive own items of one kind form one
 * unit. Each Topic, and each zero-Topic Lesson, is a `placeholder` unit —
 * the page derives those blocks from selectedLesson/selectedTopicId itself.
 *
 * Keys: `topic:<id>` and `lesson:<id>` for placeholders, and
 * `<course|module|lesson>-<content|quiz>:<id>:<n>` for a level's own items
 * (the prefix is what the player's unit label reads).
 */
const RANK = { content: 1, child: 2, quiz: 3 };

function mapOrder(a, b) {
  const orderDiff = (a.item.order ?? 0) - (b.item.order ?? 0);
  if (orderDiff !== 0) return orderDiff;
  if (a.item.createdAt && b.item.createdAt) {
    const timeDiff = new Date(a.item.createdAt).getTime() - new Date(b.item.createdAt).getTime();
    if (timeDiff !== 0) return timeDiff;
  }
  return RANK[a.kind] - RANK[b.kind];
}

export function buildCourseUnits(course) {
  const units = [];
  if (!course) return units;

  // One level's own content and quizzes interleaved with its child rows.
  // A child row breaks the current run of own items and is handed to onChild.
  const walkLevel = ({ keyPrefix, keyId, scope, contents, quizzes, children = [], onChild }) => {
    const rows = [
      ...(contents || []).map((item) => ({ kind: "content", item })),
      ...(quizzes || []).map((item) => ({ kind: "quiz", item })),
      ...children.map((item) => ({ kind: "child", item })),
    ].sort(mapOrder);

    let run = null;
    let runIndex = 0;
    const flush = () => {
      if (!run) return;
      const blocks =
        run.kind === "content"
          ? groupLessonContentForDocumentView(run.items).map((item) => ({ kind: "content", item }))
          : run.items.map((item) => ({ kind: "quiz", item }));
      units.push({ key: `${keyPrefix}-${run.kind}:${keyId}:${runIndex++}`, scope, blocks });
      run = null;
    };

    for (const row of rows) {
      if (row.kind === "child") {
        flush();
        onChild?.(row.item);
        continue;
      }
      if (run && run.kind !== row.kind) flush();
      if (!run) run = { kind: row.kind, items: [] };
      run.items.push(row.item);
    }
    flush();
  };

  const noScope = { moduleId: null, lessonId: null, topicId: null };
  walkLevel({ keyPrefix: "course", keyId: "root", scope: noScope, contents: course.contents, quizzes: course.quizzes });

  for (const mod of course.modules || []) {
    const moduleScope = { moduleId: mod.id, lessonId: null, topicId: null };
    walkLevel({
      keyPrefix: "module",
      keyId: mod.id,
      scope: moduleScope,
      contents: mod.contents,
      quizzes: mod.quizzes,
      children: mod.lessons || [],
      onChild: (lesson) => {
        const lessonScope = { moduleId: mod.id, lessonId: lesson.id, topicId: null };
        if ((lesson.topics?.length ?? 0) === 0) {
          // A zero-Topic Lesson's own content and quizzes ARE the pathway.
          units.push({ key: `lesson:${lesson.id}`, scope: lessonScope, placeholder: true });
          return;
        }
        walkLevel({
          keyPrefix: "lesson",
          keyId: lesson.id,
          scope: lessonScope,
          contents: lesson.contents,
          quizzes: lesson.quizzes,
          children: lesson.topics,
          onChild: (topic) =>
            units.push({
              key: `topic:${topic.id}`,
              scope: { ...lessonScope, topicId: topic.id },
              placeholder: true,
            }),
        });
      },
    });
  }

  return units;
}

/**
 * The non-placeholder unit holding an item — a content id (including one
 * merged into a document block) or a quiz id. Course Map clicks on rows
 * outside the Topic/Lesson pathway resolve through this.
 */
export function findUnitContaining(units, itemId) {
  if (!itemId) return undefined;
  return (units || []).find(
    (unit) =>
      !unit.placeholder &&
      (unit.blocks || []).some((b) => b.item.id === itemId || b.item.contentIds?.includes(itemId))
  );
}
