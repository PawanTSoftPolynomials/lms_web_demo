# Portal UI Unification — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Phase 1's two proven, low-risk primitives (`Card`'s `tone="flat"` prop, and the corrected full-bleed course-grid shell) to every remaining Admin and Student page where a genuine, evidenced gap exists — nothing speculative, nothing structural, nothing touching Instructor.

**Architecture:** Four small, additive, independently-reviewable tasks. Tasks 1 and 2 are batched one-line `tone="flat"` additions (Admin's 7 sites, Student's 11 sites) — the exact same mechanical pattern Phase 1 Task 2 already proved safe across 79 `Card` call sites. Task 3 applies Phase 1's exact full-bleed shell recipe (as corrected by Phase 1's final review) to `student/store/page.jsx`, the one page in this batch that is structurally identical to `student/courses/page.jsx` (same `CourseFilters` component, same catalog-browsing intent, same grid shape). Task 4 is a single isolated typography fix — `student/settings/page.jsx`'s hand-rolled header adopts the shared `PageHeader` component, matching every other Student page.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4 (utility classes only, no new dependencies).

**Spec:** The user's own Phase 2 directive in this conversation: use Instructor as the visual reference without modifying it; apply Phase 1's established shared primitives to the remaining 9 Admin routes and ~27 (confirmed: 34) Student routes; do not redesign page structures, keep each page's existing structural layout; unify typography/spacing/cards/buttons/badges/inputs/tables/modals/tabs/filters/colors/shadows/borders/theme *where evidenced*; preserve all functionality and permissions; reuse Phase 1's shared components; do not revert the earlier mobile-responsive plan's legitimate uncommitted work; no speculative improvements; report modified files, intentionally-untouched pages with reasons, and pre-existing issues separately.

This plan is deliberately narrow relative to the ~43-page audit that produced it (see Codebase Findings) — the audit surfaced many more observations than this plan acts on, by design: only concrete, low-risk, evidenced primitive gaps are in scope. Everything else surfaced by the audit is catalogued in this plan's "Audited But Not Actioned" section for the final user-facing report, per the user's explicit request to report pre-existing issues and intentionally-different pages separately rather than fold them into this fix set.

## Global Constraints

- Do not modify any file under `src/app/instructor/**` or `src/components/instructor/**`. Instructor is the design reference and must not be redesigned.
- Do not change business logic, API calls, React Query hooks, route structure, or role permissions in any file touched. Every task is a pure JSX-structure / className change.
- Do not add new npm dependencies.
- Do not fix any of the pre-existing bugs catalogued in "Audited But Not Actioned" below (a `course`/`formData` reference bug, a missing `Button` `success` variant, a dropped `color` prop on `DashboardStatCard`, and numerous invalid/non-existent Tailwind color-shade utilities in Student's feedback/reviews/achievements/bookmarks/settings pages). These are real, but they are functional/typo bugs unrelated to Instructor-visual-parity, and fixing them (especially guessing the "correct" replacement for an invalid color shade) would be a speculative change outside this plan's evidence-based scope. Report them; do not touch them.
- Do not convert the many hand-rolled `bg-background/50 border border-transparent/80 backdrop-blur-md rounded-2xl ... shadow-luxury-md` panels (found extensively in Student's achievements/bookmarks/qa/notes/settings pages) into `<Card>` component calls. They already render visually close to `Card`'s `elevated` tone; swapping the underlying JSX structure is a bigger, riskier diff than Phase 1's "add a prop to an existing Card call" pattern and was not requested. Report as an observation for a possible future phase; do not act on it.
- Do not touch `src/components/calendar/CalendarView.jsx`. Admin's calendar route delegates to it and it has a real typography/hardcoded-color gap, but research produced a genuine, unresolved conflict about whether Instructor also uses this same component (one Phase 1 research pass said Instructor uses a separate `InstructorScheduleView`; one Phase 2 research pass said Student's calendar page uses the same shared `CalendarView` "used by Instructor too via role prop"). Given this ambiguity, touching it risks violating the "do not modify Instructor" constraint. Report the finding; do not act on it in this plan.
- After all tasks: run `npm run lint` and `npm run build` from `lms_web_demo/`. Both must pass with zero new errors.
- This work happens directly in the existing `lms_web_demo` working tree on branch `Ayan` (no worktree, per standing session instruction). Do not run `git commit` — per standing session instruction, this plan's work is implemented but left uncommitted. Do not revert or otherwise touch any file's content that originates from the earlier `2026-09-02-mobile-responsive-lms` plan's legitimate uncommitted work, except where a Phase 1/Phase 2 task explicitly targets that exact file for an unrelated, evidenced primitive fix (e.g. `student/store/page.jsx`, `student/settings/page.jsx` were not touched by that earlier plan, so this is largely moot for this plan's file set — noted for completeness per the user's explicit instruction).

## Section Cross-Reference

| Plan Task | Addresses |
|---|---|
| Task 1 | Admin: cards/panels unification (§10 of the original 24-section brief) |
| Task 2 | Student: cards/panels unification (§10) |
| Task 3 | Student: course/content-browsing grid parity (§11 Course Cards, §6 Shared Layout) |
| Task 4 | Student: typography unification (§17) |

## Codebase Findings

Three parallel research passes audited all 9 remaining Admin routes and all 34 remaining Student routes (dashboard pages and the 4+2 routes Phase 1 already touched were excluded — already aligned or already fixed). Full findings are extensive; summarized here are only the findings this plan acts on. See "Audited But Not Actioned" for everything else found.

1. **Confirmed `tone="flat"` candidates — Admin (7 sites, 6 files):** `src/components/profile/ProfileCard.jsx:19`, `src/components/profile/ProfileInfo.jsx:42`, `src/components/profile/ProfileForm.jsx:47`, `src/components/admin/student/StudentDetails.jsx:22`, `src/app/admin/courses/[courseId]/page.jsx:219` and `:240`, `src/components/admin/courses/CourseForm.jsx:49`. Every one is a bare `<Card>` (no className color/border/blur override — Phase 1's exact criterion for a safe `tone="flat"` target), confirmed by direct file reads during this planning pass.
2. **Confirmed `tone="flat"` candidates — Student (11 sites, 5 files):** `src/components/student/progress/ProgressEmpty.jsx:7`, `src/app/student/activity/page.jsx:128`, `src/app/student/assignments/page.jsx:193` and `:298`, `src/app/student/quizzes/[courseId]/page.jsx:18` and `:32`, `src/app/student/assignments/[assignmentId]/page.jsx:44,66,104,132,152` (5 sites in one file). Same criterion, same confirmation method.
3. **`student/store/page.jsx` is a genuine full-bleed candidate**, confirmed by direct read: it uses the same `CourseFilters` component as `student/courses/page.jsx` (already fixed in Phase 1), the same catalog-browsing intent (search/category/level filters over a published-course grid via `StoreCourseGrid`), and currently sits in a plain `space-y-8` wrapper with no full-bleed treatment and no panel around its grid — exactly the gap Phase 1 closed on `student/courses/page.jsx`. No other page in the 43-page audit met this bar (confirmed per-file, not assumed — see research reports).
4. **`student/settings/page.jsx` hand-rolls its own header** (`<h1 className="text-3xl font-bold tracking-tight text-foreground">`, no `PageHeader` import at all) — confirmed the only page in the whole audited set with an unresponsive, non-`PageHeader` title implementation without an accompanying design rationale (contrast with `admin/courses/[courseId]/page.jsx`'s hero-style header, or `student/learn/[courseId]/page.jsx`'s lesson-player header, both of which are deliberately distinct layouts, not oversights).

## Fix Vocabulary

- **Fix A (adopt flat tone):** At a bare `<Card>` call site (no other className color/border/blur override — a padding-only or alignment-only className is still "bare" for this purpose), add `tone="flat"`.
- **Fix C (full-bleed course-grid shell):** Identical to Phase 1's Fix C, using the corrected values from Phase 1's final-review fix wave: outer wrapper gets `"-m-3 sm:-m-6 -mt-4 sm:-mt-6 md:-mt-16 -mx-4 sm:-mx-6 md:-mx-16 -mb-8 sm:-mb-12 md:-mb-16 p-3 sm:p-6 pt-0 sm:pt-0"` prefixed onto its existing classes, plus `flex flex-col flex-1 min-h-0` appended; the grid itself gets wrapped in `<div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">`.
- **Fix E (PageHeader adoption):** Replace a hand-rolled `<h1>`/`<p>` title block with `<PageHeader title="..." subtitle="..." />`, importing `PageHeader` from `@/components/layouts/PageHeader` if not already imported.

---

### Task 1: Apply `tone="flat"` to Admin's 7 bare Card panels

**Files:**
- Modify: `src/components/profile/ProfileCard.jsx`
- Modify: `src/components/profile/ProfileInfo.jsx`
- Modify: `src/components/profile/ProfileForm.jsx`
- Modify: `src/components/admin/student/StudentDetails.jsx`
- Modify: `src/app/admin/courses/[courseId]/page.jsx`
- Modify: `src/components/admin/courses/CourseForm.jsx`

**Interfaces:**
- Consumes: `Card`'s `tone` prop, already shipped in Phase 1 (`src/components/ui/Card.jsx`). No changes needed to `Card.jsx` itself.
- Produces: nothing new for later tasks.

One batched task covering 6 files with the identical one-line change repeated 7 times — same shape, same risk profile as Phase 1 Task 2, reviewed as one unit.

- [ ] **Step 1: `src/components/profile/ProfileCard.jsx` line 19**

Find:
```jsx
    return (
        <Card>
```
Replace with:
```jsx
    return (
        <Card tone="flat">
```

- [ ] **Step 2: `src/components/profile/ProfileInfo.jsx` line 42**

Find:
```jsx
    return (
        <Card>
            <h2 className="mb-6 text-2xl font-semibold text-foreground">
                Profile Information
```
Replace with:
```jsx
    return (
        <Card tone="flat">
            <h2 className="mb-6 text-2xl font-semibold text-foreground">
                Profile Information
```

- [ ] **Step 3: `src/components/profile/ProfileForm.jsx` line 47**

Find:
```jsx
    return (
        <Card>
            <h2 className="mb-6 text-2xl font-semibold text-foreground">
                Edit Profile
```
Replace with:
```jsx
    return (
        <Card tone="flat">
            <h2 className="mb-6 text-2xl font-semibold text-foreground">
                Edit Profile
```

- [ ] **Step 4: `src/components/admin/student/StudentDetails.jsx` line 22**

Find:
```jsx
    return (
        <Card className="space-y-8">
```
Replace with:
```jsx
    return (
        <Card tone="flat" className="space-y-8">
```

- [ ] **Step 5: `src/app/admin/courses/[courseId]/page.jsx` line 219 (empty-modules-state panel)**

Find:
```jsx
                        </div>) : (<Card>
                            <div className="py-12 text-center">
                                <h2 className="text-2xl font-bold">No Modules Yet</h2>
```
Replace with:
```jsx
                        </div>) : (<Card tone="flat">
                            <div className="py-12 text-center">
                                <h2 className="text-2xl font-bold">No Modules Yet</h2>
```

- [ ] **Step 6: `src/app/admin/courses/[courseId]/page.jsx` line 240 (Course Settings panel)**

Find:
```jsx
                <Card>
                    <h2 className="mb-6 text-2xl font-bold">Course Settings</h2>
```
Replace with:
```jsx
                <Card tone="flat">
                    <h2 className="mb-6 text-2xl font-bold">Course Settings</h2>
```

Do NOT touch the third `<Card>` in this file (the Danger Zone panel at line 291, `<Card className="border border-red-900 bg-red-950/20">`) — it has its own deliberate destructive-zone color override and is explicitly excluded per Fix A's "bare" criterion.

- [ ] **Step 7: `src/components/admin/courses/CourseForm.jsx` line 49**

Find:
```jsx
    return (
        <Card>
            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
```
Replace with:
```jsx
    return (
        <Card tone="flat">
            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
```

Note: `CourseForm.jsx` is imported and rendered by both `src/app/admin/courses/create/page.jsx` and `src/app/admin/courses/edit/[courseId]/page.jsx` — this one change covers both routes, no further edits needed for either page file.

- [ ] **Step 8: Verify and lint**

Run `grep -n "<Card" ` on each of the 6 files above and confirm every occurrence identified in Steps 1-7 now reads `tone="flat"`, and that the Danger Zone `<Card>` in `admin/courses/[courseId]/page.jsx` was NOT touched. Run `npm run lint` from `lms_web_demo/` — no new errors.

---

### Task 2: Apply `tone="flat"` to Student's 11 bare Card panels

**Files:**
- Modify: `src/components/student/progress/ProgressEmpty.jsx`
- Modify: `src/app/student/activity/page.jsx`
- Modify: `src/app/student/assignments/page.jsx`
- Modify: `src/app/student/quizzes/[courseId]/page.jsx`
- Modify: `src/app/student/assignments/[assignmentId]/page.jsx`

**Interfaces:**
- Consumes: `Card`'s `tone` prop (Phase 1, unchanged).
- Produces: nothing new for later tasks.

- [ ] **Step 1: `src/components/student/progress/ProgressEmpty.jsx` line 7**

Find:
```jsx
        <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-foreground">
                Keep Learning 🚀
```
Replace with:
```jsx
        <Card tone="flat" className="p-12 text-center">
            <h3 className="text-xl font-semibold text-foreground">
                Keep Learning 🚀
```

- [ ] **Step 2: `src/app/student/activity/page.jsx` line 128**

Find:
```jsx
      {filteredEvents.length === 0 ? (
        <Card className="p-6 py-20 text-center text-muted-foreground">
          <ActivityIcon size={40} className="mx-auto mb-3 text-slate-600 opacity-40" />
```
Replace with:
```jsx
      {filteredEvents.length === 0 ? (
        <Card tone="flat" className="p-6 py-20 text-center text-muted-foreground">
          <ActivityIcon size={40} className="mx-auto mb-3 text-slate-600 opacity-40" />
```

- [ ] **Step 3: `src/app/student/assignments/page.jsx` line 193 (error state)**

Find:
```jsx
  if (isError) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Unable to load assignments
        </h2>
```
Replace with:
```jsx
  if (isError) {
    return (
      <Card tone="flat" className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Unable to load assignments
        </h2>
```

- [ ] **Step 4: `src/app/student/assignments/page.jsx` line 298 (desktop empty state)**

Find:
```jsx
              {/* Desktop (xl+): empty state */}
              <Card className="hidden xl:block p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  No assignments found
                </h2>
```
Replace with:
```jsx
              {/* Desktop (xl+): empty state */}
              <Card tone="flat" className="hidden xl:block p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  No assignments found
                </h2>
```

- [ ] **Step 5: `src/app/student/quizzes/[courseId]/page.jsx` line 18 (error state) and line 32 (empty state)**

Find:
```jsx
  if (isError) {
    return (
      <Card className="p-8 text-center text-red-400">
        Failed to load course quizzes. Please try again later.
      </Card>
    );
  }
```
Replace with:
```jsx
  if (isError) {
    return (
      <Card tone="flat" className="p-8 text-center text-red-400">
        Failed to load course quizzes. Please try again later.
      </Card>
    );
  }
```

Find:
```jsx
      {quizzes.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No quizzes available for this course yet.
        </Card>
```
Replace with:
```jsx
      {quizzes.length === 0 ? (
        <Card tone="flat" className="p-12 text-center text-muted-foreground">
          No quizzes available for this course yet.
        </Card>
```

- [ ] **Step 6: `src/app/student/assignments/[assignmentId]/page.jsx` — 5 bare `<Card>` sites (lines 44, 66, 104, 132, 152)**

Find (line 44, error state):
```jsx
  if (isError || !assignment) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Assignment not found
```
Replace with:
```jsx
  if (isError || !assignment) {
    return (
      <Card tone="flat" className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Assignment not found
```

Find (line 66, assignment details panel):
```jsx
        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
```
Replace with:
```jsx
        <div className="space-y-6">
          <Card tone="flat">
            <div className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
```

Find (line 104, submission form panel):
```jsx
          <Card>
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-foreground">Submit Your Work</h3>
```
Replace with:
```jsx
          <Card tone="flat">
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-foreground">Submit Your Work</h3>
```

Find (line 132, assignment summary sidebar):
```jsx
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-foreground">Assignment Summary</h3>
```
Replace with:
```jsx
        <div className="space-y-6">
          <Card tone="flat">
            <h3 className="text-lg font-semibold text-foreground">Assignment Summary</h3>
```

Find (line 152, Need Help panel):
```jsx
          <Card>
            <h3 className="text-lg font-semibold text-foreground">Need Help?</h3>
```
Replace with:
```jsx
          <Card tone="flat">
            <h3 className="text-lg font-semibold text-foreground">Need Help?</h3>
```

- [ ] **Step 7: Verify and lint**

Run `grep -n "<Card" ` on each of the 5 files above and confirm every site identified in Steps 1-6 now reads `tone="flat"` — 11 sites total. Run `npm run lint` from `lms_web_demo/` — no new errors.

---

### Task 3: Full-bleed shell for Student's "Store" page

**Files:**
- Modify: `src/app/student/store/page.jsx`

**Interfaces:**
- Consumes: `Card`'s `tone` prop (Phase 1).
- Produces: nothing new for later tasks.

- [ ] **Step 1: Add `tone="flat"` to the existing error-state `Card`**

Find (lines 40–47):
```jsx
  if (isError) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Unable to load the store</h2>
        <p className="mt-2 text-muted-foreground">Please try again later.</p>
      </Card>
    );
  }
```
Replace with:
```jsx
  if (isError) {
    return (
      <Card tone="flat" className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Unable to load the store</h2>
        <p className="mt-2 text-muted-foreground">Please try again later.</p>
      </Card>
    );
  }
```

- [ ] **Step 2: Apply the full-bleed outer wrapper and wrap `StoreCourseGrid` in Instructor's panel treatment**

Find (lines 49–78):
```jsx
  return (
    <div className="space-y-8">
      <PageHeader title="Store" subtitle="Browse every published course and enroll." />

      <div className="rounded-xl border border-transparent bg-background p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">All Courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} available
            {paidCount > 0 && ` • ${paidCount} paid`}
            {freeCount > 0 && ` • ${freeCount} free`}
          </p>
        </div>
      </div>

      <CourseFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        level={level}
        onLevelChange={setLevel}
        categories={categories}
        levels={levels}
      />

      <StoreCourseGrid courses={filteredCourses} />
    </div>
  );
```
Replace with:
```jsx
  return (
    <div className="-m-3 sm:-m-6 -mt-4 sm:-mt-6 md:-mt-16 -mx-4 sm:-mx-6 md:-mx-16 -mb-8 sm:-mb-12 md:-mb-16 p-3 sm:p-6 pt-0 sm:pt-0 space-y-8 flex flex-col flex-1 min-h-0">
      <PageHeader title="Store" subtitle="Browse every published course and enroll." />

      <div className="rounded-xl border border-transparent bg-background p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">All Courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} available
            {paidCount > 0 && ` • ${paidCount} paid`}
            {freeCount > 0 && ` • ${freeCount} free`}
          </p>
        </div>
      </div>

      <CourseFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        level={level}
        onLevelChange={setLevel}
        categories={categories}
        levels={levels}
      />

      <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">
        <StoreCourseGrid courses={filteredCourses} />
      </div>
    </div>
  );
```

Only three things changed: the error Card's tone, the outer `<div>`'s className (full-bleed prefix + flex parity, using the exact values Phase 1's final review corrected — NOT the original unfixed Instructor values), and `<StoreCourseGrid>` now sits inside a bordered panel matching `student/courses/page.jsx`'s post-Phase-1 treatment exactly. `PageHeader`, the "All Courses" summary banner, and `CourseFilters` are untouched — same props, same position, same existing box styling (the summary banner keeps its own `bg-background` box outside the new panel, avoiding the card-in-card double-boxing Phase 1 explicitly avoided on `courses/page.jsx`).

- [ ] **Step 3: Run lint and a dev-server smoke check**

Run `npm run lint` from `lms_web_demo/` — no new errors. If a dev server is available, visit `/student/store` at 1440px and confirm: edge-to-edge layout matching `/student/courses`, grid inside a bordered panel, PageHeader/summary-banner/filters unchanged in position and styling. Check at 375px and 768px for no horizontal overflow (the corrected margin recipe was independently re-verified arithmetic-clean in Phase 1's final review — this is a sanity check, not new risk).

---

### Task 4: Adopt `PageHeader` on Student's "Settings" page

**Files:**
- Modify: `src/app/student/settings/page.jsx`

**Interfaces:**
- Consumes: `PageHeader` from `src/components/layouts/PageHeader.jsx` (existing, unmodified shared component).
- Produces: nothing new for later tasks.

- [ ] **Step 1: Add the `PageHeader` import**

Find (line 12, the last existing import):
```jsx
import { SETTINGS_TABS } from "@/features/student/constants/settingsConfig";
```
Replace with:
```jsx
import { SETTINGS_TABS } from "@/features/student/constants/settingsConfig";
import PageHeader from "@/components/layouts/PageHeader";
```

- [ ] **Step 2: Replace the hand-rolled header block**

Find (lines 119–125):
```jsx
      {/* 1. Header Banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, preferences and application settings.
        </p>
      </div>
```
Replace with:
```jsx
      {/* 1. Header Banner */}
      <PageHeader
        title="Settings"
        subtitle="Manage your account, preferences and application settings."
      />
```

Nothing else in the file changes — the tabs strip, tab content, and all form logic below are untouched. `PageHeader`'s own `mb-4 sm:mb-8` replaces the removed block's implicit spacing (the surrounding container is `space-y-6`, so the header's own margin is additive on top of that spacing, matching how every other `PageHeader`-using Student page already composes with its container's `space-y-*`).

- [ ] **Step 3: Run lint and a dev-server smoke check**

Run `npm run lint` from `lms_web_demo/` — no new errors. If a dev server is available, visit `/student/settings` at 1440px, 768px, and 375px and confirm the title/subtitle now scale responsively (`text-xl` on mobile stepping up to `text-3xl` on desktop, matching every other Student page) instead of the fixed `text-3xl` it had before, and that the tabs strip below is unaffected.

---

## Final Verification (whole-plan)

After all 4 tasks:

1. Run `npm run lint` from `lms_web_demo/` — zero new errors.
2. Run `npm run build` from `lms_web_demo/` — must succeed (exit 0), all routes compile.
3. Confirm via `git status --short -- <the 11 files this plan touched>` that exactly these files show as modified, and nothing under `src/app/instructor/**` or `src/components/instructor/**` appears.
4. Report to the user in three parts, per their explicit request:
   - **Modified files** (this plan's 11 files, listed).
   - **Pages intentionally left different, with reasons** — drawn from "Audited But Not Actioned" below: every page confirmed NOT a full-bleed candidate (with the specific structural reason: task-flow page, tabbed sub-page, list+sidebar layout, personal-record grid vs. catalog grid, etc.), and `CalendarView.jsx`'s deliberate exclusion pending the Instructor-usage ambiguity.
   - **Pre-existing issues found, reported separately, not fixed** — the `course`/`formData` bug in `CourseForm.jsx`, the missing `Button` `success` variant, the dropped `color` prop on `DashboardStatCard`, the extensive invalid-Tailwind-color-shade findings (concentrated in `feedback`, `reviews`, and scattered across `achievements`/`bookmarks`/`settings`), the `learn/[courseId]/page.jsx` hardcoded `bg-[#07080f]` hex values, and — the single largest finding — `student/messages/page.jsx` being entirely light-mode-hardcoded and bypassing the token system wholesale (flagged by the research as deserving its own future workstream, not a drive-by fix).

## Audited But Not Actioned

(For the controller's own reference when writing the final report — not implementation steps.)

- **Full-bleed: confirmed NOT applicable** to all of: `admin/dashboard` (already has its own established dashboard shell), `admin/analytics` (stub), `admin/calendar` (schedule/filter utility, not a grid), `admin/profile`, `admin/students/[studentId]`, `admin/courses/[courseId]` (CRUD/detail hybrid), `admin/courses/create` and `admin/courses/edit/[courseId]` (forms), `student/batches` (KPI strip + filters + pagination, not a plain grid), all 7 `student/batches/[batchId]/*` sub-tabs (tabbed, no header of their own), `student/attempt/[quizId]` and `student/learn/[courseId]` (focused task-flow pages — explicitly higher regression risk if touched), `student/courses/[courseId]` (two-pane workspace), `student/messages` (fixed three-pane chat), `student/quizzes` and `student/quizzes/[courseId]` (mixed selector+detail, not a plain grid), `student/result/[quizId]` (report page), `student/live-classes` (plain list), `student/achievements`/`bookmarks`/`notes`/`qa`/`certificates` (personal-record or CRUD grids, not catalog-browsing grids), `student/assignments` (list+sidebar).
- **`Button`'s missing `success` variant** (`src/components/ui/Button.jsx` — `VARIANT_CLASSES` has no `success` key), used at `admin/courses/[courseId]/page.jsx:303` and `src/components/course-details/CourseHero.jsx:88`, silently falls back to `primary` styling today. Not fixed — functional gap unrelated to Instructor-matching, and `CourseHero.jsx`'s usage elsewhere is unconfirmed.
- **`CourseForm.jsx:161`**: `course.thumbnailUrl` should read `formData.thumbnailUrl` — `course` is undefined in this component; this will throw when `formData.thumbnailUrl` is truthy. Not fixed — functional bug, not a styling gap.
- **`DashboardStatCard`** (`src/components/dashboard/common/DashboardStatCard.jsx`) has no `color` prop, so `CourseStats.jsx`'s `color="orange"|"blue"|"purple"|"green"|"red"` (admin/courses/[courseId] context) is silently dropped — all four stat cards render the same default icon background regardless of intended color-coding. Not fixed — functional prop-wiring bug, not a primitive-consistency gap.
- **Invalid/non-existent Tailwind color-shade utilities** (render as completely unstyled — no CSS is generated for them) found extensively in `student/feedback/page.jsx` (6 instances) and `student/reviews/page.jsx` (10 instances, the highest concentration found), plus one each in `student/achievements/page.jsx`, `student/bookmarks/page.jsx`, `student/settings/page.jsx`. Examples: `orange-655`, `orange-505`, `orange-550`, `slate-450`, `slate-505`, `slate-650`, `emerald-450`, `emerald-505`, `rose-455`, `pink-650`. Not fixed — guessing the intended replacement shade would be speculative.
- **`student/learn/[courseId]/page.jsx`** hardcodes `bg-[#07080f]` (lines 322, 364) instead of `bg-background`. Not fixed — task-flow page, explicitly higher regression risk, and this page was already flagged for exclusion from visual changes.
- **`student/messages/page.jsx`** is the single largest finding of the whole audit: the entire page is light-mode-hardcoded (raw `bg-[#f8f9fa]`, `bg-white`, `slate-*`/`indigo-*` utilities throughout, several non-standard shade numbers like `slate-505`/`slate-707`/`slate-805`) and bypasses the CSS custom-property token system wholesale, including a fragile `<style jsx global>` block that force-hides the shared header via a brittle selector match. In dark mode this page will render as white panels against the app's dark shell. Not fixed — this is qualitatively different from every other finding (page-wide, not local) and was flagged by the research as deserving its own dedicated future workstream rather than a drive-by fix in this plan.
- **`CalendarView.jsx`** (shared by Admin, and possibly Instructor — unresolved ambiguity, see Global Constraints) hand-rolls a header with no `PageHeader`, and uses several raw un-tokenized gradient/badge colors (`from-orange-500 to-pink-500`, `emerald-500`, `violet-500`) that will render identically in light and dark mode. Not fixed — Instructor-usage ambiguity makes this too risky to touch in this plan.
- **Extensive hand-rolled "Card-elevated" pattern** (`bg-background/50 border border-transparent/80 backdrop-blur-md rounded-2xl ... shadow-luxury-md`, note the `border-transparent/80` renders literally no visible border in either theme) recurs across `student/achievements`, `student/bookmarks`, `student/qa`, `student/notes`, and is the single most pervasive pattern in `student/settings` (10 panels). Not converted to `<Card>` component calls in this plan — see Global Constraints for why.
