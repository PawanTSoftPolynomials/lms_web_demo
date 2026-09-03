# Portal UI Unification — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the two concrete, evidence-backed visual-consistency gaps between the Instructor portal (design reference) and the Admin/Student portals, without touching Instructor and without changing any business logic, route, permission, or data.

**Architecture:** Two independent, additive changes. (1) `Card.jsx` gains an opt-in `tone="flat"` variant that reproduces Instructor's plain-bordered panel look (`border-border bg-card`, no backdrop blur, no luxury shadow) — the existing default (`tone="elevated"`, `border-card-border bg-card backdrop-blur-md shadow-luxury-md`) is untouched, so all 79 existing call sites (Admin, Instructor, and Student alike) render byte-identically unless a page opts in. (2) The two Student "course-browsing" pages (`student/courses`, `student/my-courses`) get the same full-bleed negative-margin outer wrapper that `instructor/courses/page.jsx` already uses, since Instructor set that precedent specifically for course-grid browsing pages — their existing internal structure (PageHeader, stats, toolbar, filters) is preserved as-is; only the outer shell and the bare course grid gain Instructor's panel treatment.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4 (utility classes only, no new dependencies).

**Spec:** No separate spec document exists for this task. The spec is the user's own request in this conversation (a 24-section brief: "Unify Admin, Instructor & Student Portal UI" — Instructor is the design reference and must not be redesigned; Admin/Student should adopt Instructor's visual language while keeping their own routes, data, and role-specific functionality; do not force identical navigation/content; do not create duplicate components; reuse shared components/tokens; preserve all existing functionality and permissions), narrowed by an explicit user decision mid-session: **"Unify shared primitives only"** — align typography/Card-panel-styling/buttons/stat-tiles/spacing across portals via shared components, but keep each page's own structural layout (tables for Admin's CRUD screens, card-grids for course-browsing pages, stacked lists for reports) since that is driven by what the page does, not by portal identity. Course-browsing pages specifically (Instructor courses, Student courses/my-courses) get the full-bleed + single-panel treatment because Instructor already set that precedent for that page type.

This is Phase 1 of a two-phase rollout (explicitly agreed with the user): it covers only the pages investigated and confirmed below. Admin's remaining routes (analytics stub, calendar, courses/create, courses/edit, courses/[courseId] detail, students/[studentId] detail, profile) and Student's remaining ~27 routes (batches, quizzes, certificates, progress, profile, reports, and all sub-tabs) are explicitly **out of scope for Phase 1** and are candidates for a Phase 2 plan once this phase is reviewed and verified in the running app.

## Global Constraints

- Do not modify any file under `src/app/instructor/**` or `src/components/instructor/**`. Instructor is the design reference and must not be redesigned (per user's explicit "Do NOT redesign the Instructor Portal" instruction).
- Do not change business logic, API calls, React Query hooks, route structure, or role permissions in any file touched. Every task in this plan is a pure JSX-structure / className change.
- Do not add new npm dependencies.
- `Card.jsx`'s existing default rendering must be provably unchanged after Task 1 — the new `tone` prop must default to the exact current visual output. This is a shared component used by 79 files across all three portals (confirmed via `grep -rl 'from "@/components/ui/Card"' src/`); changing its default would violate CLAUDE.md's "Shared Component Safety" rule and would silently redesign Instructor pages that use `<Card>` with its defaults.
- Do not touch any file's loading-state or error-state control flow (early returns, conditional structure) beyond adding a `tone` prop or wrapping className where explicitly specified in a task's steps. No restructuring beyond what's written.
- After all tasks: run `npm run lint` and `npm run build` from `lms_web_demo/`. Both must pass with zero new errors (pre-existing unrelated errors, if any, are not this plan's responsibility — confirm via `git stash` comparison if any are encountered).
- This work happens directly in the existing `lms_web_demo` working tree on branch `Ayan` (no worktree, per standing session instruction). Leave all pre-existing unrelated uncommitted changes in that repo untouched. Do not run `git commit` — this plan's work is implemented but not committed, per standing session instruction ("just start the work, no need to commit anything").

## Section Cross-Reference

| Plan Task | Addresses |
|---|---|
| Task 1 | §10 Cards (shared card design — border/shadow/radius parity), §20 Component Reuse (extend `Card` via prop, not duplicate) |
| Task 2 | §4 Admin Portal (keep functionality, update visual language only), §10 Cards |
| Task 3 | §11 Course Cards, §6 Shared Layout, §5 Student Portal |
| Task 4 | §11 Course Cards, §6 Shared Layout, §5 Student Portal |

## Codebase Findings

Gathered via direct file reads and two parallel research passes (Admin pages, Student pages) against the live repo on 2026-09-02:

1. **`DashboardLayout.jsx`** wraps every Admin/Instructor/Student dashboard page in `<main className="p-4 sm:p-6 md:p-16 flex-1 w-full max-w-[1800px] mx-auto pb-32">`. A page can only go edge-to-edge ("full-bleed") by applying negative margins that cancel this padding.
2. **`instructor/courses/page.jsx`** is the only Instructor page confirmed to use a full-bleed wrapper. Its exact outer wrapper: `"-m-3 sm:-m-6 -mt-8 sm:-mt-12 md:-mt-16 -mx-8 sm:-mx-12 md:-mx-16 -mb-8 sm:-mb-12 md:-mb-16 p-3 sm:p-6 pt-0 sm:pt-0 space-y-4 md:space-y-6 flex flex-col flex-1 min-h-0"`, containing a single panel `"flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6"`. Neither `instructor/analytics/page.jsx` nor `instructor/profile/page.jsx` use this treatment — they sit inside `DashboardLayout`'s default padding, same as Admin/Student. **This full-bleed treatment is a course-browsing-page pattern, not a portal-wide Instructor convention** — confirmed by direct comparison, this is why Phase 1 scopes it to course-grid pages only, not applied broadly.
3. **`Card.jsx`** (`src/components/ui/Card.jsx`, full file read) currently has one fixed visual treatment: `rounded-2xl border border-card-border bg-card backdrop-blur-md shadow-luxury-md`. Instructor pages that use `<Card>` (e.g. `instructor/analytics/page.jsx`, `instructor/profile` via `ProfilePage.jsx`) always override this via `className` to a flatter look (`border-border bg-background/60`, no blur, no `shadow-luxury-md`), and Instructor's own hand-rolled panels (its courses-page panel) never use `border-card-border`/`backdrop-blur-md`/`shadow-luxury-md` at all — they use plain `border-border bg-card`. Admin's four list pages (`admin/courses`, `admin/enrollments`, `admin/instructors`, `admin/students`) all wrap their toolbar+table in a bare `<Card>` with zero className override, so they render the "glassier" default look (blur + luxury shadow + `border-card-border`) that Instructor consistently avoids. This is the clearest, lowest-risk, highest-leverage fix: give `Card` an opt-in flatter variant and apply it at these 4 call sites.
   - **Correction, added post-implementation (final whole-branch review finding):** `globals.css:351-355` forces every `.bg-card` element's border color and radius via `!important`, independent of any `border-*` class passed in — and `--card` is a fully opaque hex in both themes, so `backdrop-blur-md` has nothing translucent to blur. This means the `border-card-border` → `border-border` swap in `tone="flat"` is a no-op in the running app (the color tokens are already forced equal), and so is dropping `backdrop-blur-md` (already invisible). The only real, visible effect of `tone="flat"` is dropping `shadow-luxury-md` — a genuine and valid alignment with Instructor's shadow-less panels, just narrower than "border/shadow/radius parity" as originally framed above. Phase 2 planning should describe this fix as "drops the luxury shadow," not the fuller claim made when this finding was first written.
4. **`grep -rl 'from "@/components/ui/Card"' src/`** returned 79 files spanning all three portals (confirmed list included in tool output above). This confirms `Card` is genuinely shared and load-bearing — the fix in Task 1 must be additive-only (new prop, old default unchanged) to respect CLAUDE.md's Shared Component Safety rule and to guarantee zero visual change to any of the other 75 call sites, including every Instructor one.
5. **`student/courses/page.jsx`** (92 lines, full file read) and **`student/my-courses/page.jsx`** (215 lines, full file read) are Student's two course-browsing pages — the direct structural counterpart to `instructor/courses/page.jsx`. Neither currently has a full-bleed wrapper; both sit inside `DashboardLayout`'s default padding. `my-courses/page.jsx` already has an inner panel with a byte-identical className to Instructor's panel (`rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6`, line 169) — it only needs the outer full-bleed wrapper added. `courses/page.jsx` has no panel at all around its course grid — it needs both the outer full-bleed wrapper and a new panel around `<CourseGrid>` specifically (not around `CourseStats`/`CourseToolbar`/`CourseFilters`, which already have their own distinct box treatments — nesting them inside a new `bg-card` panel would create a visible "card-in-card" double-boxing effect that doesn't exist in Instructor's actual design, where the search/CTA controls float unboxed directly on the panel background).
6. Admin's `courses`, `enrollments`, `instructors`, `students` list pages (all 4 read in full) share an identical shell: `<div className="space-y-8"><PageHeader .../><XStats .../><Card><XToolbar /><XTable /></Card></div>`. These are data-management CRUD tables with no Instructor-portal equivalent to structurally match against (Instructor has no table-based list pages among the pages sampled) — per the user's confirmed scope decision, their **structure** (PageHeader + stats-strip + boxed table) stays as-is; only the `Card`'s visual treatment changes to match Instructor's flatter panel look.

## Fix Vocabulary

- **Fix A (Card tone prop):** Add a `tone` prop to `Card.jsx` with two values: `"elevated"` (default, current behavior, unchanged) and `"flat"` (new: `border-border bg-card`, no `backdrop-blur-md`, no `shadow-luxury-md`, keeps `rounded-2xl` and the caller's `padding`/`className`).
- **Fix B (adopt flat tone):** At a Admin list-page `<Card>` call site with no other className/padding override, add `tone="flat"`.
- **Fix C (full-bleed course-page shell):** Replace a course-browsing page's plain outer wrapper className with Instructor's confirmed full-bleed recipe: `"-m-3 sm:-m-6 -mt-8 sm:-mt-12 md:-mt-16 -mx-8 sm:-mx-12 md:-mx-16 -mb-8 sm:-mb-12 md:-mb-16 p-3 sm:p-6 pt-0 sm:pt-0"` prepended to whatever spacing classes the page already had.
- **Fix D (course-grid panel):** Wrap a bare course grid in `<div className="rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">…</div>`, matching Instructor's panel treatment for its own course grid.

---

### Task 1: Add `tone` variant to the shared `Card` component

**Files:**
- Modify: `src/components/ui/Card.jsx`

**Interfaces:**
- Produces: `Card` accepts a new optional prop `tone: "elevated" | "flat"`, default `"elevated"`. All other props (`children`, `className`, `padding`, `onClick`) are unchanged in name, type, and behavior.
- Consumes: nothing new.

- [ ] **Step 1: Read the current file to confirm the baseline (already read in planning — reproduced here for the implementer)**

Current full content of `src/components/ui/Card.jsx`:
```jsx
export default function Card({
  children,
  className = "",
  padding = "p-6",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        border
        border-card-border
        bg-card
        backdrop-blur-md
        shadow-luxury-md
        ${padding}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Replace the file content with the `tone`-aware version**

```jsx
const TONE_CLASSES = {
  elevated: "border-card-border bg-card backdrop-blur-md shadow-luxury-md",
  flat: "border-border bg-card",
};

export default function Card({
  children,
  className = "",
  padding = "p-6",
  onClick,
  tone = "elevated",
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        border
        ${TONE_CLASSES[tone] || TONE_CLASSES.elevated}
        ${padding}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

Verify by inspection: with `tone` omitted (the default), the rendered className string is `rounded-2xl border border-card-border bg-card backdrop-blur-md shadow-luxury-md p-6` (assuming default `padding`) — identical set of class names to the original file, just assembled through the `TONE_CLASSES.elevated` lookup instead of being hardcoded inline. No existing call site passes a `tone` prop today, so every one of the other 78 call sites renders exactly as before.

- [ ] **Step 3: Manual verification — grep for any call site that might already pass a prop literally named `tone` to `Card` (to rule out a naming collision)**

Run: `grep -rn "<Card" src/ | grep "tone="` (or equivalent) from `lms_web_demo/`. Expected: no matches. If any match is found, stop and report it — do not silently override an existing unrelated `tone` usage.

- [ ] **Step 4: Run lint on the changed file**

Run: `npm run lint` from `lms_web_demo/`. Expected: no new errors attributable to `Card.jsx`.

- [ ] **Step 5: Commit is NOT required — do not run `git commit`** (per Global Constraints; this session's standing instruction is to leave all work uncommitted).

---

### Task 2: Apply the flat tone to Admin's four list-page panels

**Files:**
- Modify: `src/app/admin/courses/page.jsx`
- Modify: `src/app/admin/enrollments/page.jsx`
- Modify: `src/app/admin/instructors/page.jsx`
- Modify: `src/app/admin/students/page.jsx`

**Interfaces:**
- Consumes: `Card`'s new `tone` prop from Task 1. This task must run after Task 1.
- Produces: nothing new for later tasks.

This is one batched task covering four files with an identical one-line change each — same shape, same risk profile, reviewed as one unit per subagent-driven-development's batching guidance.

- [ ] **Step 1: `src/app/admin/courses/page.jsx` — change the `Card` wrapper**

Find (line 98):
```jsx
            <Card>
```
Replace with:
```jsx
            <Card tone="flat">
```

- [ ] **Step 2: `src/app/admin/enrollments/page.jsx` — change the `Card` wrapper**

Find (line 127):
```jsx
        <Card>
```
Replace with:
```jsx
        <Card tone="flat">
```

- [ ] **Step 3: `src/app/admin/instructors/page.jsx` — change the `Card` wrapper**

Find (line 106):
```jsx
            <Card>
```
Replace with:
```jsx
            <Card tone="flat">
```

- [ ] **Step 4: `src/app/admin/students/page.jsx` — change the `Card` wrapper**

Find (line 130):
```jsx
            <Card>
```
Replace with:
```jsx
            <Card tone="flat">
```

- [ ] **Step 5: Confirm no other `<Card>` usage in these 4 files was accidentally touched**

Each of these 4 files has exactly one `<Card>` usage (the toolbar+table wrapper) — confirmed during planning by reading each file in full. Re-check with `grep -n "<Card" <file>` on each of the 4 files after editing: expected exactly 1 match per file, now reading `<Card tone="flat">`.

- [ ] **Step 6: Run lint and a dev-server smoke check**

Run: `npm run lint` from `lms_web_demo/`. Expected: no new errors. If a dev server is available, visiting `/admin/courses`, `/admin/enrollments`, `/admin/instructors`, `/admin/students` should show the same page structure as before (PageHeader, stats, toolbar, table all unchanged) with only the panel's border/shadow/blur treatment visibly flatter.

---

### Task 3: Full-bleed shell + course-grid panel for Student's "Browse Courses" page

**Files:**
- Modify: `src/app/student/courses/page.jsx`

**Interfaces:**
- Consumes: `Card`'s new `tone` prop from Task 1 (used once, on the existing error-state `Card`). Must run after Task 1.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Add `tone="flat"` to the existing error-state `Card`**

Find (lines 51–61):
```jsx
    if (isError) {
        return (
            <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Unable to load courses
                </h2>

                <p className="mt-2 text-muted-foreground">
                    Please try again later.
                </p>
            </Card>
        );
    }
```
Replace with:
```jsx
    if (isError) {
        return (
            <Card tone="flat" className="p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Unable to load courses
                </h2>

                <p className="mt-2 text-muted-foreground">
                    Please try again later.
                </p>
            </Card>
        );
    }
```

Note: the `isLoading` early return (`return <Loader/>;`, line 46–48) is intentionally left untouched — it renders no panel/box, so there is nothing to re-tone.

- [ ] **Step 2: Apply the full-bleed outer wrapper and wrap the course grid in Instructor's panel treatment**

Find (lines 64–92):
```jsx
    return (
        <div className="space-y-8">
            <PageHeader
                title="Browse Courses"
                subtitle="Discover courses and start learning."
            />

            <CourseStats courses={courses}/>

            <CourseToolbar
                totalCourses={filteredCourses.length}
                activeFilters={activeFilters}
                onResetFilters={handleResetFilters}
            />

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

            <CourseGrid courses={filteredCourses} enrollments={myEnrollments}/>
        </div>
    );
```
Replace with:
```jsx
    return (
        <div className="-m-3 sm:-m-6 -mt-8 sm:-mt-12 md:-mt-16 -mx-8 sm:-mx-12 md:-mx-16 -mb-8 sm:-mb-12 md:-mb-16 p-3 sm:p-6 pt-0 sm:pt-0 space-y-8">
            <PageHeader
                title="Browse Courses"
                subtitle="Discover courses and start learning."
            />

            <CourseStats courses={courses}/>

            <CourseToolbar
                totalCourses={filteredCourses.length}
                activeFilters={activeFilters}
                onResetFilters={handleResetFilters}
            />

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

            <div className="rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">
                <CourseGrid courses={filteredCourses} enrollments={myEnrollments}/>
            </div>
        </div>
    );
```

Only two things changed: the outer `<div>`'s className gained the full-bleed negative-margin prefix (identical to Instructor's, confirmed verbatim in Codebase Findings §2), and `<CourseGrid>` is now wrapped in a bordered panel matching Instructor's own course-grid panel treatment. `PageHeader`, `CourseStats`, `CourseToolbar`, and `CourseFilters` are otherwise untouched — same props, same position in the tree, same existing box styling.

- [ ] **Step 3: Run lint and a dev-server smoke check**

Run: `npm run lint` from `lms_web_demo/`. Expected: no new errors. If a dev server is available, visit `/student/courses` at 1440px and confirm: the page now extends edge-to-edge instead of sitting in the default padded box, the course grid sits inside a bordered panel, and PageHeader/stats/toolbar/filters look unchanged in position and styling. Also check at 375px and 768px to confirm the full-bleed treatment's responsive breakpoints (`sm:`/`md:` prefixes) don't introduce horizontal overflow — Instructor's courses page already proves this exact className combination is overflow-safe at all widths, so this is a sanity check, not new risk.

---

### Task 4: Full-bleed shell for Student's "My Courses" page

**Files:**
- Modify: `src/app/student/my-courses/page.jsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (no `Card` import in this file). Independent of Tasks 1–3; can run in any order relative to them.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Apply the full-bleed outer wrapper**

Find (line 91):
```jsx
  return (
    <div className="space-y-4 md:space-y-6">
```
Replace with:
```jsx
  return (
    <div className="-m-3 sm:-m-6 -mt-8 sm:-mt-12 md:-mt-16 -mx-8 sm:-mx-12 md:-mx-16 -mb-8 sm:-mb-12 md:-mb-16 p-3 sm:p-6 pt-0 sm:pt-0 space-y-4 md:space-y-6 flex flex-col flex-1 min-h-0">
```

- [ ] **Step 2: Give the existing course-grid panel the same `flex flex-col flex-1 min-h-0` growth behavior Instructor's panel has**

Find (line 169):
```jsx
        <div className="rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">
```
Replace with:
```jsx
        <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6">
```

This panel's className already matched Instructor's `rounded-2xl border border-border bg-card px-3 py-4 md:px-12 md:py-6` exactly (confirmed byte-identical in Codebase Findings §5) — this step only adds the `flex flex-col flex-1 min-h-0` prefix Instructor's panel also carries, for full parity.

Nothing else in this file changes: the `PageHeader` (with its inline search/filter controls in the action slot), the `isError` retry block, the `EmptyState` empty-enrollment block, and the internal `md:max-h-[68vh] md:overflow-y-auto` scroll region and carousel logic are all untouched — they are siblings/descendants of the elements just modified and inherit the new full-bleed positioning automatically without needing their own edits.

- [ ] **Step 3: Run lint and a dev-server smoke check**

Run: `npm run lint` from `lms_web_demo/`. Expected: no new errors. If a dev server is available, visit `/student/my-courses` at 1440px and confirm the page now extends edge-to-edge like `/instructor/courses` and `/student/courses` (after Task 3), with the course cards, search box, and filter dropdowns unchanged in appearance and behavior. Check the mobile carousel (below 768px) still scrolls/snaps correctly — this file's mobile carousel logic (lines 56–88) is untouched, so this is a regression check, not new risk.

---

## Final Verification (whole-plan)

After all 4 tasks:

1. Run `npm run lint` from `lms_web_demo/` — zero new errors.
2. Run `npm run build` from `lms_web_demo/` — must succeed (exit 0), all routes compile.
3. Confirm via `git status --short -- src/components/ui/Card.jsx src/app/admin/courses/page.jsx src/app/admin/enrollments/page.jsx src/app/admin/instructors/page.jsx src/app/admin/students/page.jsx src/app/student/courses/page.jsx src/app/student/my-courses/page.jsx` that exactly these 7 files show as modified, and no other file (especially nothing under `src/app/instructor/**` or `src/components/instructor/**`) was touched.
4. Spot-check that `Card`'s default behavior is unchanged: read 2–3 files from the 79-file usage list that were NOT touched by this plan (e.g. `src/app/instructor/analytics/page.jsx`, `src/components/profile/ProfileCard.jsx`) and confirm their `<Card>` usages still render with the `elevated` tone (i.e., their explicit className overrides, if any, are untouched, and any bare `<Card>` usage among them still gets the original `border-card-border bg-card backdrop-blur-md shadow-luxury-md` look).
5. Report back: which of the two identified but out-of-scope items should carry into a Phase 2 plan (Admin's remaining 9 routes; Student's remaining ~27 routes), and flag that live visual confirmation (screenshots) was not possible without login credentials — verification here is code-level (exact className matching against Instructor's confirmed-working classes), the same limitation that applied throughout the earlier mobile-responsiveness plan.
