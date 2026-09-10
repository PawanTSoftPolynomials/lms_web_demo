const byOrder = (list) => [...(list || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

/**
 * The whole course's Content/Quiz leaves, flattened into course order —
 * Course-direct, then per Module (its own direct content, each Lesson in
 * turn, its own quiz), then the Course's own quiz last. Mirrors courseUnits
 * in the Learn page exactly (same nesting/order rules), just built from the
 * Progress roll-up's shape instead of the course tree, since this is the
 * only place visited/completed live per item. Assignments are excluded —
 * they aren't reachable in the content player's block sequence yet.
 */
function buildLeafSequence(hierarchy) {
  const leaves = [];

  const pushLeaves = (kind, list, scope) => {
    for (const raw of byOrder(list)) {
      leaves.push({
        kind,
        id: raw.id,
        visited: raw.visited === true,
        completed: raw.completed === true,
        ...scope,
      });
    }
  };

  const noScope = { moduleId: null, lessonId: null, topicId: null };
  pushLeaves("content", hierarchy.contents, noScope);

  for (const mod of byOrder(hierarchy.modules)) {
    const moduleScope = { moduleId: mod.id, lessonId: null, topicId: null };
    pushLeaves("content", mod.contents, moduleScope);

    for (const lesson of byOrder(mod.lessons)) {
      const lessonScope = { moduleId: mod.id, lessonId: lesson.id, topicId: null };
      pushLeaves("content", lesson.contents, lessonScope);

      for (const topic of byOrder(lesson.topics)) {
        pushLeaves("content", topic.contents, { moduleId: mod.id, lessonId: lesson.id, topicId: topic.id });
      }

      pushLeaves("quiz", lesson.quizzes, lessonScope);
    }

    pushLeaves("quiz", mod.quizzes, moduleScope);
  }

  pushLeaves("quiz", hierarchy.quizzes, noScope);

  return leaves;
}

/**
 * Resolves exactly where "Continue Learning" should land the student,
 * purely from the backend's visited/completed roll-up (GET
 * /progress/courses/:courseId) — no DB-saved "last lesson" state involved.
 *
 * Finds the LAST leaf, in course order, that has been visited at all (a
 * container's own rolled-up `visited` flag isn't usable for this: it only
 * turns true once EVERY descendant is visited, which tells you a level is
 * finished, not where the student currently is — so this walks the actual
 * Content/Quiz leaves' own visited flags instead, which is exactly the
 * module -> content/lesson/quiz -> lesson -> content/quiz/topic -> topic
 * content drill-down collapses to when done in course order).
 *
 *   - visited && !completed -> that leaf IS the resume target.
 *   - visited && completed  -> nothing left to do there, so the NEXT leaf
 *     (course order) is the target instead.
 *   - nothing visited anywhere -> the course's very first leaf (a fresh
 *     student's first visit).
 *   - the whole course's last leaf is visited+completed -> that same leaf
 *     (review mode; there is no "next").
 *
 * @returns {{kind: 'content'|'quiz', id: string, moduleId: string|null,
 *   lessonId: string|null, topicId: string|null}|null} null when progress
 *   data isn't available or the course has no trackable leaves at all.
 */
export function resolveResumeTarget(progressData) {
  const hierarchy = progressData?.hierarchy;
  if (!hierarchy) return null;

  const leaves = buildLeafSequence(hierarchy);
  if (leaves.length === 0) return null;

  let lastVisitedIndex = -1;
  for (let i = 0; i < leaves.length; i++) {
    if (leaves[i].visited) lastVisitedIndex = i;
  }

  if (lastVisitedIndex === -1) return leaves[0];

  const lastVisited = leaves[lastVisitedIndex];
  if (!lastVisited.completed) return lastVisited;

  return leaves[lastVisitedIndex + 1] || lastVisited;
}
