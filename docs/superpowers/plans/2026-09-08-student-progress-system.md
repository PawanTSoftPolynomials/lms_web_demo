# Student Progress System — Audit & Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task once the open decisions in §0 are confirmed.

**Goal:** Give students a hierarchical completion system where Content → Topic → Lesson → Module → Course completion is derived bottom-up, with parent completion never running ahead of its children.

**Architecture:** One leaf write target (`ContentProgress`), one shared roll-up function that recomputes every ancestor level in a single transaction, and materialized per-level rows so completion is directly queryable. Extends existing models (`ContentProgress`, `Progress`, `Enrollment`) rather than introducing a parallel system.

**Tech Stack:** Backend `c:\Orange Tree LMS\backend\lms-api` (Express 5, Prisma 6, PostgreSQL). Frontend `c:\Orange Tree LMS\frontend\lms_web_demo` (Next.js 16 App Router, React 19, TanStack Query v5, Axios).

**Repos audited:** both. This plan spans both repos; the backend is a sibling repo, not part of the frontend git tree.

---

## 0. STOP — read this before anything else

**The entire backend progress module is deleted in the working tree, uncommitted.**

`git status` in `c:\Orange Tree LMS\backend\lms-api` (branch `pawan`):

```text
 M src/app.js
 M src/modules/achievements/achievement.service.js
 M src/modules/batches/batch.service.js
 M src/modules/courses/course.service.js
 M src/modules/courses/course.validation.js
 M src/modules/dashboard/dashboard.service.js
 D src/modules/progress/progress.controller.js
 D src/modules/progress/progress.routes.js
 D src/modules/progress/progress.service.js
 D src/modules/progress/progress.validation.js
 M src/modules/students/student.controller.js
 M src/modules/students/student.route.js
 M src/modules/students/student.service.js
 D src/utils/dripAccess.js
```

`git diff --stat` = **82 insertions, 1342 deletions**. The removal is coordinated and complete: the `/progress` router is unmounted from `src/app.js`, `lesson.completed`/`lesson.locked` decoration is stripped from `getCourseById`, and completion math is removed from the admin, instructor, and student dashboards. No dangling imports remain — this was deliberate, not an accident mid-edit.

**None of it is committed.** Everything still exists in `HEAD` and is recoverable with `git checkout -- <path>` or `git show HEAD:<path>`.

**This work is unpushed and unbacked-up. It should be stashed or committed to a scratch branch before implementation begins**, or an errant `git checkout` during this work will destroy it permanently.

**Decisions — D1, D2 and R2 confirmed by the user on 2026-09-08; D3/D4/D5 follow from the requirements.**

| # | Decision | Resolution |
|---|---|---|
| D1 | Was the deletion intentional, or should the deleted files be restored as the starting point? | ✅ **CONFIRMED: restore, then extend.** Recover the 4 progress files + `dripAccess.js` from `HEAD`, then rebuild the roll-up to 5 levels. The old code already implements drip gating, certificate issuance, and the exact URL contract the frontend still calls. |
| D2 | Do topic-level **quizzes** count toward Topic completion? | ✅ **CONFIRMED: no — Contents only.** The stated rule is "all of its Contents"; `Quiz` is a sibling of `Content`, not a `Content` row. Quizzes remain ungated by the roll-up. Revisit only as a separate future phase. |
| D3 | Do **assignments** participate? | **They cannot.** `Assignment` has only `courseId` — no `moduleId`/`lessonId`/`topicId` (schema:657). Structurally incapable of belonging to a Topic. Out of scope without a schema change. |
| D4 | What happens to an **empty** Topic/Lesson/Module (zero children)? | **Not completable, and excluded from its parent's denominator.** Prevents an empty module both silently completing a course and permanently blocking it. |
| D5 | Should `POST /progress/complete` (the "Mark Complete" button) keep marking a lesson complete directly? | **No — it must cascade down.** Setting `Progress.completed = true` while the lesson's topics/contents are incomplete violates requirement 6. Redefine it to mark all descendant contents complete, then roll up. |

---

## 1. Existing architecture

### 1.1 Hierarchy (schema `prisma/schema.prisma`)

```text
Course   (:132)  status, dripContentEnabled          → modules Module[]
 └ Module (:189)  order, isPublished, courseId        → lessons Lesson[]
    └ Lesson (:207) order, isPublished, moduleId      → topics Topic[], progress Progress[]
       └ Topic (:229) order, isPublished, lessonId    → contents Content[]
          └ Content (:245) order, type ContentType    → visits ContentProgress[]
```

**Content is polymorphic and this matters.** All four parent FKs are nullable:

```prisma
courseId String?   moduleId String?   lessonId String?   topicId String?
```

A `Content` row can hang off a Course, Module, Lesson, *or* Topic. The canonical "Topic → Content" path is only one of four. `getCourseById` (`course.service.js:471`) selects **only** `topics.contents` — content attached at lesson/module/course level is never sent to the student player and is invisible to any completion denominator built from that tree.

**Quiz is also polymorphic** (`courseId` required, plus optional `moduleId`/`lessonId`/`topicId`) and is a **separate model from Content**, returned as a sibling array at module, lesson, and topic level. `ContentType` also has `ASSIGNMENT` and `CODING_EXERCISE` members, so an assignment can be represented *either* as a `Content` row *or* as an `Assignment` row — two representations of the same idea.

**Topics are not publication-filtered.** `getCourseById` filters `modules` and `lessons` by `isPublished: true` for students, but `topics` has no such filter (`course.service.js:443`). Unpublished topics are shipped to students today.

### 1.2 Backend module conventions

`src/modules/<name>/<name>.{routes,controller,service,validation}.js`. No repository layer — services call `prisma` directly via `src/config/database`. Routes mounted in `src/app.js`. Auth via `verifyToken`; roles via `checkRole([...])`; Joi bodies via `joiValidation.middleware`.

Controllers resolve `StudentProfile` from `req.user.id` themselves — `studentId` throughout the progress domain means `StudentProfile.id`, **not** `User.id`.

### 1.3 Frontend conventions

Component/page → React Query hook (`src/hooks/queries/student/`) → service (`src/services/`) → `src/lib/axios`. Query keys are flat string constants from `src/constants/queryKeys.js` (`STUDENT_PROGRESS: "student-progress"`, `MY_COURSES`, `COURSE`, `STUDENT_DASHBOARD`, `STUDENT_STATE`); nested array factories are not used anywhere.

---

## 2. Existing progress / completion behaviour

### 2.1 Tables that exist

| Model | Line | Grain | Fields | Written by code today? |
|---|---|---|---|---|
| `Progress` | 354 | **Lesson** | `completed`, `completedAt`, `@@unique([studentId, lessonId])` | **No** |
| `ContentProgress` | 274 | **Content** | `visitedAt` only — **no `completed` flag**, `@@unique([studentId, contentId])` | **No** |
| `VideoAnalytics` | 850 | **Lesson** (not content) | `watchTime`, `completed`, `lastPing` | **No** |
| `QuizSubmission` | 483 | Quiz | `score`, `percentage`, `passed`, `@@unique([studentId, quizId])` — one row per student per quiz, so no attempt history despite `Quiz.attempts` | Yes |
| `AssignmentSubmission` | 682 | Assignment | `status` default `"Submitted"`, `grade`, `feedback` | Partially |
| `StudentState` | 808 | Course | `moduleId`, `lessonId`, `contentId`, `timestamp` — the resume pointer | Yes |
| `Enrollment` | 321 | Course | `enrolledAt`, `lastAccessedAt` — **no status, no completion, no percent** | Yes |
| `Certificate` | 501 | Course | issued per student+course | Yes (manual only) |

**There is no Topic-level and no Module-level progress table anywhere.** There is no course-level completion field anywhere.

Verified by direct grep of the working tree: `prisma.progress`, `prisma.contentProgress`, and `prisma.videoAnalytics` have **zero** occurrences in `backend/lms-api/src`. `Progress` survives only as a comment in `batch.service.js:96`.

### 2.2 What the deleted module did (recoverable from `HEAD`)

`src/modules/progress/progress.service.js` @ `HEAD`:

- **`completeLesson(studentId, lessonId)`** — drip check via `buildLessonLockMap` (403 if locked) → `prisma.progress.upsert({ completed: true, completedAt })` → counts completed lessons over `getPublishedLessonIds(courseId)` → **at 100% auto-creates a `Certificate`** (`CERT-${Date.now()}`) plus a notification. Reads the prior row first so `LESSON_COMPLETED` observation fires only on a genuine transition.
- **`markContentVisited(studentId, contentIds)`** — `$transaction` of `contentProgress.upsert`s → counts visited vs `content.findMany({ where: { topic: { lessonId } } })` → **if all visited, calls `completeLesson`**. This is the only roll-up that ever existed: **Content → Lesson, skipping Topic entirely.** It derives the lesson via `contents[0].topic.lessonId`, which throws for any non-topic-attached content.
- **`getAllCoursesProgress` / `getCourseProgress`** — lesson-count percentages.

`src/utils/dripAccess.js` @ `HEAD`: `getPublishedLessonIds(courseId)` (published lessons in published modules, in course order) and `buildLessonLockMap(courseId, studentId)` (sequential unlock when `dripContentEnabled`).

Routes @ `HEAD`: `GET /progress`, `POST /progress/complete`, `POST /progress/content-visited`, plus `GET /students/:studentId/progress`.

**No Module-level or Topic-level completion has ever existed in this codebase.**

### 2.3 The current end-to-end state: broken

The frontend was never updated to match the backend removal. `src/services/progress.service.js` still calls:

```js
getProgress(courseId)      → GET  /progress?courseId=${courseId}   // no caller — dead code
updateProgress(data)       → POST /progress/complete                // 404
markContentVisited(ids)    → POST /progress/content-visited         // 404
```

Consequences in the running app:

- Every completion write from `src/app/student/learn/[courseId]/page.jsx` **404s** — both the `LessonContentBlock` IntersectionObserver auto-visit and the explicit "Mark Complete" button.
- `getStudentProgress()` (`src/services/student.service.js:27`) `GET /progress` 404s and **silently falls back** to `getStudentDashboard()` in a `catch`, so `/student/progress` renders plausible-looking numbers from a different source.
- `useLessonNavigation.js:23-24` derives `completedLessonIds` from `lesson.completed` — a field `getCourseById` no longer returns. **Every lesson renders as incomplete forever.**
- `lesson.locked` is likewise gone, so drip gating is inert and `CourseContentAccordion`'s `Lock`/`CheckCircle2` states never activate.
- Automatic certificate issuance is gone; `certificate.service.js` is INSTRUCTOR/ADMIN-manual only.
- `achievement.service.js` now counts `prisma.enrollment.count()` as `completedCourses`, so "Course Champion" awards on **enrollment**, not completion.

### 2.4 Assessment completion

- **Quiz** — `POST /quizzes/:quizId/submit` → `quiz.service.js:610`. Computes `passed = percentage >= quiz.passingScore` (`:252`) and stores it. **`passed` gates nothing**; it is read only by a dashboard KPI. Submitting touches no `Content`, `Topic`, or `Progress`.
- **Assignment** — `POST /assignments/:assignmentId/submit` → `assignment.service.js:84`. Upserts `{ status: "Submitted" }` and **discards the request body**, so the frontend's `{ notes }` is never persisted. **There is no grading endpoint at all** — no PUT/PATCH exists and `assignmentSubmission.update` appears nowhere, so `grade`/`feedback` can never become non-null via the API.
- **Video / document / text** — no watch-time, scroll, or position persistence. `VideoPlayer`'s `onTimeUpdate` drives transcript highlighting only and is never sent to the server.

### 2.5 Existing frontend progress surface (reuse targets)

| File | Role |
|---|---|
| `src/components/student/courses/ProgressBar.jsx` | **Canonical bar.** `{ value, size, variant, showLabel }`, clamps 0–100, has `role="progressbar"` + aria values. **Reuse this.** |
| `src/components/ui/ProgressBar.jsx` | Simpler duplicate (`{ value, color }`). Pre-existing duplication — do not extend, do not delete in this work. |
| `src/components/student/progress/ProgressOverview.jsx` | `{ completedLessons, totalLessons, percentage }` |
| `src/components/student/progress/ProgressStats.jsx` | wraps `StatCard` |
| `src/components/student/progress/ProgressEmpty.jsx` | empty state |
| `src/components/student/learning/CourseContentAccordion.jsx` | per-lesson `CheckCircle2`/`Lock`; takes `courseProgress`, `completedLessons`, `totalLessons` |
| `src/components/instructor/courses/CourseComposerSidebar.jsx` | already student-aware — takes `completedLessonIds` and `role`; `:724-725`. Reuse, do not fork. |
| `src/components/student/my-courses/MyCourseCard.jsx` | derives status from `enrollment.progress` |
| `src/components/dashboard/ContinueLearningRow.jsx` | reads `enrollment.progress`/`completedLessons`; uses an **inline** bar, not the shared component |

No percentage-ring component exists. No topic-level or content-level completion indicator exists anywhere.

**Continue Learning** (`src/app/student/dashboard/page.jsx`): order is whatever `GET /dashboard/student` returns; the link is always `/student/learn/${courseId}` with **no `?lessonId`**. Resume position is resolved inside the player by `useLearningStateSync` via `StudentState`. `MobileContinueCard` fabricates its label as `Lesson ${completedLessons + 1} of ${totalLessons}`.

---

## 3. Gaps against the requirements

| Req | Requirement | Status | Gap |
|---|---|---|---|
| 1 | Course COMPLETED ⟸ all Modules | ❌ | No course completion field exists. `Enrollment` has no status/completion. Old code used a lesson-count percentage, never module roll-up. |
| 2 | Module COMPLETED ⟸ all Lessons | ❌ | **No module-level progress exists at any layer.** |
| 3 | Lesson COMPLETED ⟸ all Topics | ❌ | `Progress.completed` exists but was set **directly**, never derived from topics. |
| 4 | Topic COMPLETED ⟸ all Contents | ❌ | **No topic-level progress exists.** Old roll-up jumped Content → Lesson, skipping Topic. |
| 5 | Progress initialized by default | ❌ | Lazy-only. `createEnrollment` (`enrollment.service.js:74`) writes the enrollment row and nothing else. Missing row ≡ not started ≡ 0% — indistinguishable. |
| 6 | Parent derived, never ahead of children | ❌ | `POST /progress/complete` sets a lesson complete with zero regard for its topics/contents. |
| 7 | No parallel system | ⚠️ | Two dead tables (`ContentProgress`, `VideoAnalytics`) and one dead-but-referenced (`Progress`) already coexist. Adding a third mechanism would compound this. |
| 8 | Reuse/extend existing | ⚠️ | Requires reusing `Progress`, `ContentProgress`, `Enrollment` and the deleted `/progress` URL contract rather than inventing new ones. |
| 9 | Understand before changing | ✅ | This document. |

**Additional gaps found that the requirements do not mention but that block them:**

- **G-A.** `ContentProgress` has no `completed` flag — only `visitedAt`. Leaf truth cannot be expressed today.
- **G-B.** Content attached at lesson/module/course level is unreachable by students, so it can never complete; if counted in a denominator it would deadlock the parent forever.
- **G-C.** Topics are not `isPublished`-filtered in the student tree, so the visible denominator and any published-scoped denominator would disagree.
- **G-D.** No endpoint returns a per-entity progress tree. Nothing can render topic/content checkmarks even once the data exists.
- **G-E.** The `completed / total * 100` formula was duplicated verbatim in ≥5 places. Any new work must land in exactly one shared helper.
- **G-F.** There is **no `prisma/migrations/` directory**. `package.json` defines `prisma:migrate` but no migration history exists — the DB is managed by `db push`. Schema changes therefore have no reviewable diff and no rollback path.
- **G-G.** `package.json` has **no `test` script**, despite `backend CLAUDE.md` documenting `npm test`. Tests run via `node --test test/<file>.js`.

---

## 4. Files that need modification

### Backend — `c:\Orange Tree LMS\backend\lms-api`

| File | Change |
|---|---|
| `prisma/schema.prisma` | Extend `ContentProgress`, extend `Enrollment`, add `TopicProgress`, add `ModuleProgress` (§6) |
| `src/modules/progress/progress.service.js` | **Restore from HEAD**, then rewrite roll-up to 5 levels |
| `src/modules/progress/progress.controller.js` | Restore from HEAD; add tree endpoint handler |
| `src/modules/progress/progress.routes.js` | Restore from HEAD; add `GET /progress/courses/:courseId/tree` |
| `src/modules/progress/progress.validation.js` | Restore from HEAD; extend schemas |
| `src/utils/dripAccess.js` | Restore from HEAD (unchanged — still correct) |
| `src/app.js` | Re-add `progressRoutes` require + `app.use("/progress", progressRoutes)` |
| `src/modules/courses/course.service.js` | Restore student decoration in `getCourseById` (~`:520`), extended to topic/content flags; add `isPublished` filter to `topics` (`:443`) |
| `src/modules/enrollments/enrollment.service.js` | Call `ensureProgressInitialized` inside `createEnrollment` |
| `src/modules/dashboard/dashboard.service.js` | Restore `completedLessons`/`completionRate` for the student dashboard from the new source |
| `src/modules/achievements/achievement.service.js` | Fix `completedCourses` to count real completions, not enrollments |

### Frontend — `c:\Orange Tree LMS\frontend\lms_web_demo`

| File | Change |
|---|---|
| `src/services/progress.service.js` | Add `getCourseProgressTree(courseId)`; keep existing three functions' contracts |
| `src/hooks/queries/student/useMarkContentVisited.js` | Invalidate the new tree key |
| `src/hooks/queries/student/useCompleteLesson.js` | Invalidate the new tree key |
| `src/constants/queryKeys.js` | Add one key, e.g. `COURSE_PROGRESS_TREE: "course-progress-tree"` |
| `src/app/student/learn/[courseId]/page.jsx` | Consume the tree; drive topic/content indicators |
| `src/components/student/learning/CourseContentAccordion.jsx` | Render topic + content completion state |
| `src/components/student/learning/LessonContentBlock.jsx` | Show per-content complete state |

**New files required:** none on the frontend. On the backend, only if the roll-up helper is extracted to `src/utils/progressRollup.js` (recommended — mirrors the existing `src/utils/dripAccess.js` precedent and prevents G-E recurring).

---

## 5. Database changes

Extend existing models; two new tables.

```prisma
model ContentProgress {           // EXTEND — the single leaf write target
  // existing: id, studentId, contentId, visitedAt, @@unique([studentId, contentId])
  completed   Boolean   @default(false)
  completedAt DateTime?
}

model TopicProgress {             // NEW — derived
  id          String    @id @default(cuid())
  studentId   String
  topicId     String
  completed   Boolean   @default(false)
  completedAt DateTime?
  @@unique([studentId, topicId])
  @@index([studentId])
}

model ModuleProgress {            // NEW — derived
  id          String    @id @default(cuid())
  studentId   String
  moduleId    String
  completed   Boolean   @default(false)
  completedAt DateTime?
  @@unique([studentId, moduleId])
  @@index([studentId])
}

model Enrollment {                // EXTEND — course level, reused not replaced
  completed       Boolean   @default(false)
  completedAt     DateTime?
  progressPercent Int       @default(0)
}
```

`Progress` (lesson level) is **reused as-is** — no new `LessonProgress` table. Back-relations must be added to `StudentProfile`, `Topic`, and `Module`.

**Migration risk (G-F):** there is no migration history. Confirm with the team whether to run `prisma migrate dev` (which will attempt to baseline and may propose destructive operations against an existing database) or continue with `prisma db push`. All four changes above are purely additive with defaults, so no backfill of existing rows is required — but this must be verified against a database copy, never production first.

---

## 6. API changes

| Method | Path | Status | Behaviour |
|---|---|---|---|
| `POST` | `/progress/content-visited` | restore + extend | Body `{ contentIds }` **unchanged** (frontend already sends it). Now sets `completed: true, completedAt` on each `ContentProgress`, then runs the roll-up. Returns the affected ancestor states. Must handle non-topic-attached content instead of throwing. |
| `POST` | `/progress/complete` | restore + **redefine** | Body `{ lessonId }` unchanged. **Cascades down**: marks every content under the lesson's topics complete, then rolls up. Never sets `Progress.completed` directly (req 6). |
| `GET` | `/progress` | restore | Shape `{ totalLessons, completedLessons, percentage, courses[] }` preserved — `useProgress` already normalizes it. |
| `GET` | `/progress/courses/:courseId/tree` | **new** | Per-entity flags for every module/lesson/topic/content. Closes G-D. |
| `GET` | `/courses/:courseId` | restore decoration | Re-attach `lesson.completed` + `lesson.locked`; add `topic.completed`, `content.completed`, `module.completed`. |

**Roll-up rules (the single shared helper):**

```text
content.completed  ← explicit write (video ended, dwell, or mark-complete)
topic.completed    ← topic has ≥1 content AND every content completed
lesson.completed   ← lesson has ≥1 non-empty topic AND every such topic completed
module.completed   ← module has ≥1 non-empty published lesson AND every such lesson completed
course.completed   ← course has ≥1 non-empty published module AND every such module completed
```

Scoping: published modules and published lessons only (mirrors the deleted `getPublishedLessonIds`); topics scoped by `isPublished` **once G-C is fixed in the same change**, so the tree and the denominator agree. Empty containers are excluded from the parent denominator and are never themselves completed (D4). Completion is monotonic per write but the helper must be **idempotent and re-runnable** so it can repair drift.

---

## 7. Frontend changes

1. `getCourseProgressTree(courseId)` in the existing `progress.service.js` — no new service file.
2. New query key `COURSE_PROGRESS_TREE` in the existing `queryKeys.js`; flat-string convention.
3. `useMarkContentVisited` / `useCompleteLesson` add the tree key to their existing `invalidateQueries` lists (they already invalidate `STUDENT_PROGRESS`, `STUDENT_DASHBOARD`, `MY_COURSES`, `COURSE`).
4. Learning player consumes tree flags; `useLessonNavigation` keeps deriving from `lesson.completed` (restored server-side) so its contract is unchanged.
5. Topic and content indicators in `CourseContentAccordion` / `LessonContentBlock`, reusing `student/courses/ProgressBar.jsx` and the existing `CheckCircle2` idiom. **No new components.**
6. Remove the silent `catch` fallback in `student.service.js:27` once `GET /progress` is live — it currently masks failure with dashboard data.

---

## 8. Risks / regressions

| # | Risk | Mitigation |
|---|---|---|
| R1 | **1342 lines of uncommitted work destroyed** by a stray checkout | Stash/branch **before** touching anything (§0) |
| R2 | Restoring `/progress` re-enables the auto-**certificate** path — students at 100% suddenly receive certificates and notifications | ✅ **CONFIRMED: gate behind `Course.certificatesEnabled`** (an existing schema field, `Course:144`, currently unread by the completion path). Auto-issue only when it is `true`. |
| R3 | Restoring drip gating makes previously-open lessons **locked** for existing students | Roll-up runs at init, so historical completions must be recomputed before drip is re-enabled |
| R4 | Content attached at lesson/module/course level (G-B) **deadlocks** a parent forever | Exclude non-topic content from denominators in Phase 1; surface it as a known limitation |
| R5 | Publishing a **new** module/lesson/topic silently un-completes a course that had issued a certificate | Decide explicitly: keep `Certificate` immutable once issued |
| R6 | Materialized rows **drift** from leaf truth | Exactly one roll-up function; idempotent; re-runnable repair path |
| R7 | Roll-up cost on large courses (N+1) | Recompute one course per write with grouped queries, not per-entity queries |
| R8 | `db push` with no migration history (G-F) | Test against a DB copy; additive-only changes |
| R9 | Eager init at enrollment writes many rows for large courses | `createMany({ skipDuplicates: true })` per level, one statement each |
| R10 | Fixing `achievement.service.js` changes who qualifies for existing achievements | Confirm before changing; `StudentAchievement` rows are already awarded |
| R11 | Topic `isPublished` filter (G-C) **hides topics students currently see** | Audit how many topics have `isPublished: false` before shipping |

---

## 9. Implementation order

Each phase ends with an independently testable deliverable. Do not start a phase before its predecessor passes.

- **Phase 0 — Safety.** Stash or commit the backend working tree to a scratch branch. Confirm D1–D5. *Exit: uncommitted work is recoverable and decisions are recorded.*
- **Phase 1 — Schema.** Add the four schema changes + back-relations. `prisma generate`. Verify against a DB copy. *Exit: client types exist; no app code changed yet.*
- **Phase 2 — Roll-up core.** Restore `src/utils/dripAccess.js`. Create `src/utils/progressRollup.js` with `recomputeCourseProgress(studentId, courseId)` and `ensureProgressInitialized(studentId, courseId)`. Unit-test the five rules — including empty containers (D4), unpublished scoping, and idempotency — with `node --test`. *Exit: rules proven in isolation, no routes yet.*
- **Phase 3 — Write path.** Restore the `progress` module; rewrite `markContentVisited` to set `completed` and call the roll-up; redefine `completeLesson` to cascade down. Re-mount in `app.js`. *Exit: the player's existing 404s become 200s; completion persists.*
- **Phase 4 — Initialization.** Wire `ensureProgressInitialized` into `createEnrollment`, plus an idempotent backfill for existing enrollments. *Exit: req 5 satisfied for new and existing students.*
- **Phase 5 — Read path.** Add `GET /progress/courses/:courseId/tree`; restore `getCourseById` decoration; fix the topic `isPublished` filter (G-C). *Exit: per-entity state is queryable.*
- **Phase 6 — Frontend.** Service fn, query key, hook invalidations, tree consumption, topic/content indicators. *Exit: `npm run lint` and `npm run build` pass; completion visibly persists across reload.*
- **Phase 7 — Downstream repair.** Student dashboard `completedLessons`/`completionRate`; `achievement.service.js` `completedCourses` fix (pending R10). *Exit: dashboard numbers derive from real completion.*
- **Phase 8 — Verification.** Backend `node --test test/*.js`; frontend `npm run lint` + `npm run build`; manual matrix: enroll → complete contents → topic ticks → lesson ticks → module ticks → course completes; partial-completion never completes a parent; reload persistence; drip gating.

---

## 10. Verification commands

```bash
# Backend (no `npm test` script exists — G-G)
cd "c:/Orange Tree LMS/backend/lms-api"
npx prisma generate
node --test test/content-parent-hierarchy.test.js
node --test test/                      # full suite

# Frontend
cd "c:/Orange Tree LMS/frontend/lms_web_demo"
npm run lint
npm run build
```

---

## 11. Open questions for the team

Resolved 2026-09-08: **D1** (restore then extend), **D2** (Contents only), **R2** (gate on `certificatesEnabled`).

Still open — none of these block Phases 0–2, but they must be answered before the phase named:

1. **R5** — does publishing new course material revoke a previously-completed course and its certificate? *(blocks Phase 3)*
2. **G-F** — `prisma migrate` or continue with `db push`? *(blocks Phase 1)*
3. **R11** — how many topics currently have `isPublished: false`? Determines whether the G-C filter fix hides content students can see today. *(blocks Phase 5)*
4. **R10** — fixing `achievement.service.js` changes who qualifies for existing achievements. *(blocks Phase 7)*
