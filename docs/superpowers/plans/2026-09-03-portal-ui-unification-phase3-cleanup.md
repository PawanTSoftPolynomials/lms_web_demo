# Portal UI Unification — Phase 3 Cleanup Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix exactly the five concrete, pre-existing bugs the Phase 2 audit catalogued under "Audited But Not Actioned" — nothing more. This is a bug-fix pass, not a design pass: no visual redesign, no structural change, no new permissions, no touching Instructor.

**Architecture:** Five independent, disjoint-file tasks. Task 1 fixes a `ReferenceError`-class bug (undefined variable) in one Admin form component. Task 2 adds one missing (purely additive) variant to the shared `Button` component so two already-existing `variant="success"` call sites render as intended instead of silently falling back to `primary`. Task 3 adds one missing (purely additive, backward-compatible) `color` prop to `DashboardStatCard` so `course-details/CourseStats.jsx`'s existing color intent is respected. Task 4 replaces ~21 invalid/non-existent Tailwind color-shade utilities (which currently generate no CSS and render completely unstyled) with the nearest valid or semantic equivalent, across 5 Student files. Task 5 converts `student/messages/page.jsx`'s neutral/grayscale hardcoded light-mode colors to the app's existing semantic theme tokens, leaving its deliberate colored accents (indigo for primary actions/active states, emerald for tab-active state, red/blue for file-type icons) untouched.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4 (utility classes only, no new dependencies).

**Spec:** The user's own Phase 3 directive in this conversation, itself drawn directly from Phase 2's "Audited But Not Actioned" section (`docs/superpowers/plans/2026-09-03-portal-ui-unification-phase2.md`). Explicit constraints: fix only the 5 named bugs; do not modify Instructor files; do not redesign UI; do not change portal structure, permissions, APIs, business logic, routes, or workflows except where a specific bug fix requires it; do not touch the responsive implementation unless directly required; do not commit; preserve current desktop/mobile designs; keep each task independently reviewable; if a task needs a larger refactor than described, stop and report instead of expanding scope.

**Ruling made during planning (documented here, not hidden):** the user's Task 1 description names only `course.thumbnailUrl` as the reference to fix. Direct inspection of `CourseForm.jsx` shows the SAME undefined `course` variable is referenced on the very next line too (`alt={course.title}`, line 162) — same bug, same `<Image>` tag, same undefined variable. Fixing only line 161 would leave the component still throwing on that adjacent line whenever a thumbnail URL is present, i.e. the fix would not actually resolve the reported crash. Task 1 below fixes both references — this is judged to be inside "fix only this incorrect reference" (the reference is to the undefined `course` object; both lines are that same reference) rather than scope expansion, since leaving it half-fixed would not satisfy the task's own stated verification criteria ("create course still works", "edit course still works", "thumbnail URL field still displays/submits correctly" — none of which hold if the component still throws).

**Ruling made during planning (file-path correction):** the user's Task 3 description names `src/components/admin/courses/CourseStats.jsx` as the file with the dropped `color` prop. Direct inspection shows this file never passes a `color` prop at all — it only passes `title`/`value`/`icon`. The actual bug, confirmed by direct read, lives in the similarly-named but different `src/components/course-details/CourseStats.jsx` (used exclusively by `admin/courses/[courseId]/page.jsx`, confirmed via `grep` — not shared with Instructor or Student). Task 3 below targets the correct file. This correction is also called out in the final report per the user's "any new issues discovered" requirement (this is really a "prior report was imprecise" note, not a new issue in the code).

## Global Constraints

- Do not modify any file under `src/app/instructor/**` or `src/components/instructor/**`. Confirmed via `grep` during planning that every file this plan touches (`CourseForm.jsx`, `Button.jsx`, `DashboardStatCard.jsx`, `course-details/CourseStats.jsx`, `course-details/CourseHero.jsx` (read-only, not modified), the 5 Student files, `messages/page.jsx`) has zero Instructor-portal consumers.
- Do not modify `src/app/instructor/courses/import/page.jsx` or `src/components/instructor/composer/AiComposerModal.jsx` — these carry unrelated, concurrent, already-in-progress modifications elsewhere in this working tree (discovered during Phase 2's final review) and must be left exactly as they are.
- Do not change business logic, API calls, React Query hooks, route structure, or role permissions in any file touched, except Task 1's exact bug fix (a variable-reference correction, not a logic change — the intent was always to read from `formData`).
- Do not add new npm dependencies.
- Task 2 and Task 3 must be purely additive to their shared components (`Button.jsx`, `DashboardStatCard.jsx`) — every existing variant/prop's behavior for every existing caller must be provably unchanged. Both components are used by multiple files; changing default behavior would silently affect call sites this plan never reviewed.
- Task 4 must NOT touch any file outside the 5 named Student files (`feedback`, `reviews`, `achievements`, `bookmarks`, `settings`), even though the SAME invalid-color-shade bug was found via `grep` to also exist in `student/messages/page.jsx` (in scope for Task 5, handled there instead — avoids two tasks editing the same file) and extensively in Instructor files and a few shared/other files (`src/app/courses/[courseId]/page.jsx`, `src/components/forms/QuestionForm.jsx`, `src/components/ui/Skeleton.jsx`, `student/live-classes`, `student/result/[quizId]`, and 4 `components/student/**` files) — all confirmed out of scope for this plan and reported, not fixed, per Global Constraints and the "stop and report, don't expand scope" instruction.
- Task 4 must not "blindly replace every unusual-looking class" — only classes confirmed invalid (not defined in `globals.css`'s `@theme` block and not part of Tailwind's default palette) are touched. Valid custom shades already defined in `globals.css` (e.g. `orange-500`, `orange-600`, `orange-650`, `slate-700`, `slate-800`) are left alone wherever they already appear correctly.
- Task 5 must NOT remove the `<style jsx global>` header-hiding hack in `messages/page.jsx` (lines 148–152) — it hides the shared page header for a full-height chat layout reason, unrelated to theming, and removing it would change the page's layout structure, which is explicitly out of scope ("do not change component structure unless necessary for theme compatibility").
- Task 5 must NOT convert the deliberate colored accents (`indigo-*` for primary actions/active states/avatars, `emerald-500`/`emerald-600` for the active category-pill state, `bg-red-50 text-red-500` and `bg-blue-50 text-blue-500` for file-type icons) to theme tokens — these are valid Tailwind default-palette colors that already render identically regardless of theme mode (not the reported bug) and represent deliberate semantic color-coding, matching how other pages in this app (e.g. quiz result pages) use fixed `rose-*`/`emerald-*`/`amber-*` accents without token-wrapping them. Only the neutral/grayscale hardcodes (`white`, `slate-50/100/200/450/505/655/700/707/750/805`, `bg-[#f8f9fa]`, the box-shadow literal) are in scope.
- After all tasks: run `npm run lint` and `npm run build` from `lms_web_demo/`. Compare against the known baseline (13 pre-existing errors, all in unrelated root-level scripts like `strip_dark_bg.js`/`update_theme.js`, established during Phase 2's final verification) — report whether the error count changed.
- This work happens directly in the existing `lms_web_demo` working tree on branch `Ayan` (no worktree, per standing session instruction). Do not run `git commit` — work stays uncommitted, per standing session instruction.

## Section Cross-Reference

| Plan Task | Addresses |
|---|---|
| Task 1 | User's "TASK 1 — Fix CourseForm thumbnail bug" |
| Task 2 | User's "TASK 2 — Fix Button success variant" |
| Task 3 | User's "TASK 3 — Fix DashboardStatCard color prop" |
| Task 4 | User's "TASK 4 — Fix invalid Tailwind color classes" |
| Task 5 | User's "TASK 5 — Dedicated Student Messages theme fix" |
| Task 6 | User's "TASK 6 — Verification" (controller-run, not a subagent dispatch — see Final Verification section) |

## Codebase Findings

All five bugs were originally identified during Phase 2's audit (`docs/superpowers/plans/2026-09-03-portal-ui-unification-phase2.md`, "Audited But Not Actioned" section) and re-confirmed by direct file reads during this plan's own preparation:

1. `src/components/admin/courses/CourseForm.jsx:161-162` — `<Image src={getDisplayUrl(course.thumbnailUrl)} alt={course.title} .../>` inside a component whose only state is `formData` (via `useState`); `course` is never declared anywhere in the file. Confirmed by full file read.
2. `src/components/ui/Button.jsx` — `VARIANT_CLASSES` has keys `primary`/`secondary`/`danger`/`ghost`/`outline` only. `grep "variant=\"success\""` across `src/` confirms exactly 2 call sites: `src/app/admin/courses/[courseId]/page.jsx:303` and `src/components/course-details/CourseHero.jsx:88` (both confirmed Admin-only via grep on their imports). `src/app/globals.css` already defines `--success`/`--success-foreground` tokens (light `#20CD83`/white, dark `#3FB950`/`#0D1117`) and even has a pre-existing CSS selector referencing `a.bg-success` in its button remap rule (line 370) — confirming a `success` variant was clearly intended but never added to `Button.jsx`.
3. `src/components/dashboard/common/DashboardStatCard.jsx` accepts `iconBgClass` (default `"bg-primary/15"`) but no `color` prop. `src/components/course-details/CourseStats.jsx` passes `color="orange"|"blue"|"purple"|"green"|"red"` at all 4 of its call sites (confirmed by full file read) — this prop is silently dropped by React (unrecognized prop, not spread anywhere), so all 4 stat cards on the course-detail page render the same default icon tint regardless of intended status color.
4. Invalid Tailwind shades: confirmed via `grep -E "orange-655|orange-505|orange-550|slate-450|slate-505|slate-650|slate-850|slate-707|slate-805|emerald-450|emerald-505|rose-455|pink-650"` across `src/` — none of these numbers exist in `globals.css`'s `@theme` block (which defines `slate` in full hundreds only: 50,100,...,900,950; `orange` at 300,400,450,500,600,650,700; `amber` at 300,400,500,600; `pink` at 400,500,600,700) or in Tailwind's own default palette (also hundreds-only). Classes using these numbers generate no CSS and render completely unstyled.
5. `src/app/student/messages/page.jsx` — confirmed by full file read: root wrapper `bg-[#f8f9fa]`; three major panels (`bg-white border border-slate-100 ... shadow-[0_2px_8px_rgba(0,0,0,0.015)]`); numerous `text-slate-450/505/700/707/805`, `border-slate-100/200`, `bg-slate-50/50 hover:bg-slate-105` (also invalid — 105 doesn't exist either, caught incidentally by this task's own scope since it's a neutral gray, not a color-family question); two `<input>` elements with hardcoded `bg-[#f8f9fa] border-slate-200 ... focus:border-indigo-500 focus:bg-white` (though `globals.css:357-368` already forces `input, select { background-color: var(--surface-muted) !important; border: 1px solid var(--border) !important; }` and `input:focus { border-color: var(--primary) !important; }` — meaning these specific classes are already visually inert today, but are still fixed for correctness/hygiene per the task's own examples). The deliberate `indigo-*`/`emerald-500`/`emerald-600`/`bg-red-50 text-red-500`/`bg-blue-50 text-blue-500` accents are NOT part of this bug (confirmed: none of these shade numbers are invalid, and none are remapped by `globals.css`'s theme system, meaning they already render identically in both themes today — same status as `rose-*`/`amber-*` accents used elsewhere in the app).

## Fix Vocabulary

- **Fix F (undefined-variable correction):** Replace a reference to an undefined variable with the correct in-scope variable that was clearly intended (same property name, correct object).
- **Fix G (additive shared-component variant/prop):** Add a new key to a variant lookup object, or a new optional prop with a safe default, to a shared component — every existing caller's behavior must be provably unchanged (verified by reading the component's render logic and confirming the new key/prop is only reached when explicitly requested).
- **Fix H (invalid-shade correction):** Replace an invalid Tailwind color-shade class with either (a) the nearest valid shade already used by a sibling class on the same element (preserves the author's evident intent with minimal change), (b) the equivalent value used by an identical UI pattern elsewhere in the same file or a sibling file (preserves cross-file consistency), or (c) the app's semantic token (`text-foreground`, `text-muted-foreground`, `border-border`, etc.) when the class represents generic UI chrome rather than a deliberate accent color.
- **Fix I (theme-token conversion):** Replace a hardcoded neutral/grayscale color (`white`, un-tokenized `slate-*`, raw hex, a raw `rgba()` box-shadow) with the app's existing semantic token (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `shadow-luxury-sm`/`shadow-luxury-md`) — never applied to a deliberate, already-theme-agnostic colored accent.

---

### Task 1: Fix `CourseForm.jsx`'s undefined `course` reference

**Files:**
- Modify: `src/components/admin/courses/CourseForm.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Fix both references on the thumbnail `<Image>` tag**

Find (lines 158–167):
```jsx
                {formData.thumbnailUrl && (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                        <Image
                            src={getDisplayUrl(course.thumbnailUrl)}
                            alt={course.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
```
Replace with:
```jsx
                {formData.thumbnailUrl && (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                        <Image
                            src={getDisplayUrl(formData.thumbnailUrl)}
                            alt={formData.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
```

Only `course.thumbnailUrl` → `formData.thumbnailUrl` and `course.title` → `formData.title` change — both are the same undefined-variable bug on the same `<Image>` tag (see the plan's "Ruling made during planning" note above for why both are in scope). No styling class on this block changes.

- [ ] **Step 2: Manual verification**

Run `npm run lint` from `lms_web_demo/` — no new errors. If a dev server is available: visit `/admin/courses/create`, fill in a Thumbnail URL, and confirm the preview image renders instead of throwing a client-side error (check the browser console). Visit `/admin/courses/edit/[courseId]` for an existing course that already has a `thumbnailUrl` and confirm the page loads without error and the preview displays the existing thumbnail. Confirm the Course Title field, Description, Category, Level, and Status fields are all still present and functional (this component's form-field JSX is otherwise untouched).

---

### Task 2: Add a `success` variant to `Button.jsx`

**Files:**
- Modify: `src/components/ui/Button.jsx`

**Interfaces:**
- Produces: `Button` accepts `variant="success"` as a new valid value, in addition to the existing `primary`/`secondary`/`danger`/`ghost`/`outline`. No other prop or default changes.
- Consumes: `--success`/`--success-foreground` CSS custom properties, already defined in `src/app/globals.css` for both light and dark themes.

- [ ] **Step 1: Add the `success` key to `VARIANT_CLASSES`**

Find (lines 1–6 of `src/components/ui/Button.jsx`):
```jsx
const VARIANT_CLASSES = {
  primary: "btn-rainbow [--btn-rainbow-fill:var(--primary)] text-primary-foreground",
  secondary: "bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
  danger: "btn-rainbow [--btn-rainbow-fill:var(--destructive)] text-destructive-foreground",
  ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-primary/10",
  outline: "bg-transparent border border-border text-foreground hover:border-primary/40 hover:bg-primary/5",
};
```
Replace with:
```jsx
const VARIANT_CLASSES = {
  primary: "btn-rainbow [--btn-rainbow-fill:var(--primary)] text-primary-foreground",
  secondary: "bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
  danger: "btn-rainbow [--btn-rainbow-fill:var(--destructive)] text-destructive-foreground",
  success: "btn-rainbow [--btn-rainbow-fill:var(--success)] text-success-foreground",
  ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-primary/10",
  outline: "bg-transparent border border-border text-foreground hover:border-primary/40 hover:bg-primary/5",
};
```

The new `success` entry mirrors `danger`'s exact pattern (`btn-rainbow [--btn-rainbow-fill:var(--success)] text-success-foreground`), substituting the `--success`/`--success-foreground` tokens for `--destructive`/`--destructive-foreground`. Nothing else in the file changes — `primary`/`secondary`/`danger`/`ghost`/`outline`, the component's props, and its render logic (`VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary`) are all untouched.

This single change is sufficient to fix both existing `variant="success"` call sites — do NOT edit `src/app/admin/courses/[courseId]/page.jsx` or `src/components/course-details/CourseHero.jsx`; they already pass `variant="success"` and will pick up the new styling automatically once `Button.jsx` recognizes it.

- [ ] **Step 2: Verify no existing callers regress**

Run `grep -rn "variant=" src/components src/app` (or equivalent) and spot-check that every existing `variant="primary"|"secondary"|"danger"|"ghost"|"outline"` call site is unaffected — the diff only adds a new object key, so this should be true by construction, but confirm no other line in `Button.jsx` was touched. Run `npm run lint` from `lms_web_demo/` — no new errors.

- [ ] **Step 3: Manual verification**

If a dev server is available: visit `/admin/courses/[courseId]` for a DRAFT course and confirm the "Publish" button (line 303) now renders in the success/green styling instead of the default primary orange/gold styling. Check both light and dark theme.

---

### Task 3: Add a `color` prop to `DashboardStatCard.jsx`

**Files:**
- Modify: `src/components/dashboard/common/DashboardStatCard.jsx`

**Interfaces:**
- Produces: `DashboardStatCard` accepts a new optional `color: "orange"|"blue"|"purple"|"green"|"red"` prop. When provided AND `iconBgClass` is not explicitly passed, it computes an appropriate `iconBgClass`. When omitted, or when `iconBgClass` is explicitly passed, behavior is byte-identical to today.
- Consumes: nothing new (uses existing Tailwind color utilities, all confirmed valid — `orange-500`, `blue-500`, `purple-500`, `green-500`, `red-500` all exist either in `globals.css`'s custom `@theme` overrides or Tailwind's default palette).

**Note:** the file this task targets is `src/components/course-details/CourseStats.jsx` (NOT `src/components/admin/courses/CourseStats.jsx` as the user's original task description named — see this plan's "Ruling made during planning" note above for the correction and its evidence). `src/components/course-details/CourseStats.jsx` itself needs NO changes — it already passes `color` correctly; only `DashboardStatCard.jsx` needs to start consuming that prop.

- [ ] **Step 1: Add the `color` prop and a color-to-iconBgClass mapping**

Find (lines 1–13 of `src/components/dashboard/common/DashboardStatCard.jsx`):
```jsx
import Card from "@/components/ui/Card";
import TrendBadge from "@/components/dashboard/components/TrendBadge";

export default function DashboardStatCard({
  title,
  value,
  icon,
  iconBgClass = "bg-primary/15",
  trend,
  trendLabel,
  onClick,
  className = "",
}) {
```
Replace with:
```jsx
import Card from "@/components/ui/Card";
import TrendBadge from "@/components/dashboard/components/TrendBadge";

const COLOR_ICON_BG = {
  orange: "bg-orange-500/15",
  blue: "bg-blue-500/15",
  purple: "bg-purple-500/15",
  green: "bg-green-500/15",
  red: "bg-red-500/15",
};

export default function DashboardStatCard({
  title,
  value,
  icon,
  color,
  iconBgClass = color ? COLOR_ICON_BG[color] || "bg-primary/15" : "bg-primary/15",
  trend,
  trendLabel,
  onClick,
  className = "",
}) {
```

Verify by inspection: for every existing caller (which never passes `color`), `color` is `undefined`, so the `iconBgClass` default expression evaluates its `: "bg-primary/15"` branch — byte-identical to the original default. Only when a caller passes `color` (currently only `course-details/CourseStats.jsx`, at all 4 of its call sites) does the new branch take effect, and only when that caller does NOT also pass `iconBgClass` explicitly (none currently do, so this is moot in practice, but preserves the override escape hatch for any future caller).

The rest of the file (the `<Card>` JSX, the icon circle's `className` template literal that interpolates `${iconBgClass}`, everything else) is untouched.

- [ ] **Step 2: Verify no existing callers regress**

The file's other 5 known callers (`src/components/admin/student/StudentStats.jsx`, `src/components/admin/courses/CourseStats.jsx`, `src/components/admin/enrollments/EnrollmentStats.jsx`, `src/components/admin/instructors/InstructorStats.jsx`, and Task 3's own `src/components/course-details/CourseStats.jsx`) — confirm via `grep -n "DashboardStatCard" <file>` on the first 4 that none of them pass a `color` or `iconBgClass` prop (if any unexpectedly does, stop and report — the byte-identical-default guarantee above assumes none do). Run `npm run lint` from `lms_web_demo/` — no new errors.

- [ ] **Step 3: Manual verification**

If a dev server is available: visit `/admin/courses/[courseId]` and confirm the 4 stat cards ("Modules", "Lessons", "Quizzes", "Status") now show distinct icon-background tints (orange/blue/purple/green-or-red depending on status) instead of all sharing the same default tint. Visit `/admin/courses` (the list page, uses the OTHER `CourseStats.jsx` which never passed `color`) and confirm its stat cards look completely unchanged.

---

### Task 4: Fix invalid Tailwind color-shade classes in 5 Student files

**Files:**
- Modify: `src/app/student/feedback/page.jsx`
- Modify: `src/app/student/reviews/page.jsx`
- Modify: `src/app/student/achievements/page.jsx`
- Modify: `src/app/student/bookmarks/page.jsx`
- Modify: `src/app/student/settings/page.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new for later tasks.

One batched task covering 5 files, ~21 individual class-name corrections — reviewed as one unit.

- [ ] **Step 1: `src/app/student/feedback/page.jsx` — 8 corrections across 6 lines**

Find (line 37):
```jsx
            <button className="mt-6 px-5 py-2.5 bg-primary text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-orange-655 transition">
```
Replace with:
```jsx
            <button className="mt-6 px-5 py-2.5 bg-primary text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-primary transition">
```

Find (line 76):
```jsx
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-505/20 text-emerald-450 flex items-center justify-center mx-auto">
```
Replace with:
```jsx
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
```

Find (line 85):
```jsx
            className="mt-6 px-5 py-2.5 bg-primary hover:bg-orange-655 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl transition cursor-pointer"
```
Replace with:
```jsx
            className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl transition cursor-pointer"
```

Find (line 137):
```jsx
                      className={star <= rating ? "fill-orange-500 text-orange-505" : "text-slate-650"}
```
Replace with:
```jsx
                      className={star <= rating ? "fill-orange-500 text-orange-500" : "text-slate-700"}
```

Find (line 155):
```jsx
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-background/20 rounded-xl border border-slate-850/60">
```
Replace with:
```jsx
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-background/20 rounded-xl border border-border/60">
```

Find (line 191):
```jsx
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary hover:bg-orange-655 text-slate-950 font-black uppercase text-xs tracking-widest shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
```
Replace with:
```jsx
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary hover:bg-primary text-slate-950 font-black uppercase text-xs tracking-widest shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
```

- [ ] **Step 2: `src/app/student/reviews/page.jsx` — 10 corrections across 10 lines**

Find (line 46):
```jsx
            <button className="mt-6 px-5 py-2.5 bg-primary text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-orange-655 transition">
```
Replace with:
```jsx
            <button className="mt-6 px-5 py-2.5 bg-primary text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-primary transition">
```

Find (line 82):
```jsx
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-orange-505 font-bold uppercase tracking-wider bg-transparent border-0 outline-none cursor-pointer transition"
```
Replace with:
```jsx
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary font-bold uppercase tracking-wider bg-transparent border-0 outline-none cursor-pointer transition"
```

Find (line 108):
```jsx
                  className={star <= Math.round(ratingSummary.avg) ? "fill-orange-500 text-orange-550" : "text-slate-700"}
```
Replace with:
```jsx
                  className={star <= Math.round(ratingSummary.avg) ? "fill-orange-500 text-orange-500" : "text-slate-700"}
```

Find (line 135):
```jsx
                        className={star <= rating ? "fill-orange-500 text-orange-505" : "text-slate-700"}
```
Replace with:
```jsx
                        className={star <= rating ? "fill-orange-500 text-orange-500" : "text-slate-700"}
```

Find (line 143):
```jsx
                <span className="text-[9px] font-black text-slate-505 uppercase tracking-widest block">Review Details</span>
```
Replace with:
```jsx
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Review Details</span>
```

Find (line 149):
```jsx
                  className="w-full rounded-xl border border-transparent bg-background/20 p-3 text-xs font-semibold text-foreground outline-none focus:border-orange-505 transition"
```
Replace with:
```jsx
                  className="w-full rounded-xl border border-transparent bg-background/20 p-3 text-xs font-semibold text-foreground outline-none focus:border-primary transition"
```

Find (line 154):
```jsx
                <div className="text-[10px] font-bold text-rose-455 uppercase tracking-wide bg-rose-500/5 p-2 rounded-lg border border-rose-500/15">
```
Replace with:
```jsx
                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wide bg-rose-500/5 p-2 rounded-lg border border-rose-500/15">
```

Find (line 162):
```jsx
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-orange-655 text-slate-950 font-black uppercase text-[10px] tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer border-0"
```
Replace with:
```jsx
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary text-slate-950 font-black uppercase text-[10px] tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer border-0"
```

Find (line 173):
```jsx
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-450 pl-1">Written Reviews</h3>
```
Replace with:
```jsx
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Written Reviews</h3>
```

Find (line 209):
```jsx
                            className={star <= rev.rating ? "fill-orange-500 text-orange-550" : "text-slate-700"}
```
Replace with:
```jsx
                            className={star <= rev.rating ? "fill-orange-500 text-orange-500" : "text-slate-700"}
```

- [ ] **Step 3: `src/app/student/achievements/page.jsx` — 1 correction**

Find (line 92):
```jsx
          <Trophy size={40} className="mx-auto mb-3 opacity-40 text-slate-450" />
```
Replace with:
```jsx
          <Trophy size={40} className="mx-auto mb-3 opacity-40 text-muted-foreground" />
```

- [ ] **Step 4: `src/app/student/bookmarks/page.jsx` — 1 correction**

Find (line 144):
```jsx
          <FolderOpen size={40} className="mx-auto mb-3 opacity-40 text-slate-450" />
```
Replace with:
```jsx
          <FolderOpen size={40} className="mx-auto mb-3 opacity-40 text-muted-foreground" />
```

- [ ] **Step 5: `src/app/student/settings/page.jsx` — 1 correction**

Find (line 507):
```jsx
          <div className="bg-gradient-to-br from-orange-600 to-pink-650 text-foreground rounded-2xl p-5 shadow-luxury-md relative overflow-hidden">
```
Replace with:
```jsx
          <div className="bg-gradient-to-br from-orange-600 to-pink-600 text-foreground rounded-2xl p-5 shadow-luxury-md relative overflow-hidden">
```

- [ ] **Step 6: Verify and lint**

Run `grep -nE "orange-655|orange-505|orange-550|slate-450|slate-505|slate-650|slate-850|emerald-450|emerald-505|rose-455|pink-650"` on each of the 5 files and confirm zero matches remain (all corrected). Confirm no other line in any of the 5 files changed. Run `npm run lint` from `lms_web_demo/` — no new errors.

---

### Task 5: Theme-token conversion for `student/messages/page.jsx`

**Files:**
- Modify: `src/app/student/messages/page.jsx`

**Interfaces:**
- Consumes: existing semantic tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`, `shadow-luxury-sm`) already defined in `src/app/globals.css` and used throughout the rest of the app.
- Produces: nothing new for later tasks.

This is a single-file, mechanical, rule-based conversion. Apply this mapping table to every line where it matches — the mapping is exhaustive for this file; nothing outside it should be touched. Where a hardcoded class carries an opacity suffix (e.g. `border-slate-100/80`, `bg-slate-50/50`), preserve the suffix on the replacement token (e.g. `border-border/80`, `bg-muted/50`) — only the color name changes, never the opacity fraction.

**Conversion table (apply wherever these exact hardcoded values appear):**

| Hardcoded value | Replace with | Context |
|---|---|---|
| `bg-[#f8f9fa]` (root wrapper, line 145) | `bg-background` | Page background |
| `bg-[#f8f9fa]` (on `<input>` elements, lines 172, 416) | `bg-background` | Input background (already visually overridden by `globals.css`'s `input { background-color: var(--surface-muted) !important }`, but fix for correctness) |
| `bg-white` (panel roots: lines 155, 260, 334, 386 [received bubble], 441) | `bg-card` | Elevated panel background |
| `bg-white` (dropdown menu, line 260 — same as above) | `bg-card` | — |
| `border-slate-100` (all occurrences: lines 155, 157, 178, 334, 338, 386, 441, 442, 451, 488) | `border-border` | Panel/divider borders |
| `border-slate-200` (lines 160, 172, 186/198/217/229 [inactive pills], 251, 260, 416) | `border-border` | Control/input borders |
| `shadow-[0_2px_8px_rgba(0,0,0,0.015)]` (lines 155, 334, 441) | `shadow-luxury-sm` | Panel shadow (existing theme-aware utility, already used by `Card.jsx` for the same visual role) |
| `text-slate-800` (lines 159, 307, 317) | `text-foreground` | Primary text |
| `text-slate-805` (lines 351, 433, 446, 461, 489) | `text-foreground` | Primary text (same role as `slate-800`, inconsistent number in original — both map to the same token) |
| `text-slate-700` (lines 308, 357, 358, 361 [hover], 467, 478) | `text-foreground` (or `hover:text-foreground` where the hardcode is itself a `hover:` variant) | Primary text / hover-to-primary |
| `text-slate-505` (lines 320, 434, 490) | `text-muted-foreground` | Secondary/meta text |
| `text-slate-707` (lines 492, 493) | `text-foreground` | Metadata values |
| `text-slate-450` (line 166) | `text-muted-foreground` | Icon tint |
| `hover:text-slate-655` (line 250) | `hover:text-foreground` | Hover state (also an invalid shade, corrected as part of this same conversion) |
| `hover:bg-slate-50` (lines 160, 186/198/217/229 [inactive pills], 269, 282, 343 [base, not hover], 463, 474) | `hover:bg-muted` | Neutral hover tint |
| `bg-slate-50` (base, not hover: lines 178 [as `bg-slate-50/50`], 343, 430, 452) | `bg-muted` (preserve any `/NN` opacity suffix, e.g. `bg-slate-50/50` → `bg-muted/50`) | Neutral background |
| `hover:bg-slate-100` (line 343) | `hover:bg-border` | Slightly darker neutral hover (one step up from `bg-muted`) |
| `hover:bg-slate-105` (lines 452, 453, 454, 455 — note: 105 is itself an invalid shade, not just a theme-hardcode) | `hover:bg-border` | Same reasoning as `hover:bg-slate-100` above |
| `bg-slate-100` (badge backgrounds, lines 204, 235 inactive state) | `bg-muted` | Badge background |
| `text-slate-600` (badge text, lines 204, 235 inactive state) | `text-muted-foreground` | Badge text |
| `bg-white` + `border-slate-200` + `text-muted-foreground` + `hover:bg-slate-50` + `hover:text-slate-700` (the 4 identical inactive-pill strings at lines 186, 198, 217, 229) | `bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground` | Inactive category-pill styling |
| `bg-white border-slate-200 text-muted-foreground hover:text-slate-655 hover:bg-slate-50` (line 251, the "more" trigger's inactive state) | `bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted` | Same pattern as above, applied once |
| `text-muted-foreground hover:bg-slate-50 hover:text-slate-700` (dropdown menu items, lines 269, 282) | `text-muted-foreground hover:bg-muted hover:text-foreground` | Dropdown item hover |
| `bg-slate-50/30` (message area background, line 369) | `bg-muted/30` | — |
| `text-slate-850` (received message bubble text, line 386) | `text-foreground` | Message text |

**Do NOT touch** (confirmed valid, deliberate, theme-agnostic accent colors — not part of this bug):
- Every `indigo-*` occurrence (avatars, active conversation row, pinned-message banner, sent-message bubble, focus rings, send button, info-icon active state, "more info" panel accents).
- `text-emerald-500` (Online status indicator, line 352) and `bg-emerald-500/10 border-emerald-500/30 text-emerald-600` / `bg-emerald-500 text-foreground` (active category-pill / active-count-badge states).
- `bg-red-50 text-red-500` (PDF file-type icon, line 465) and `bg-blue-50 text-blue-500` (code file-type icon, line 476).
- The `<style jsx global>` block (lines 148–152) — layout mechanism, not a theme hack.

- [ ] **Step 1: Apply the conversion table above across the whole file**

Read the file fully before editing (it has already been read once during this plan's preparation — re-read to confirm no drift since planning). Apply each row of the table at every line it matches. Where a hardcoded string appears identically at multiple lines (e.g. the 4 inactive-pill strings, the 3 panel-root `bg-white ... shadow-[...]` strings), apply the same replacement at each occurrence — do not skip any.

- [ ] **Step 2: Self-verify completeness**

Run `grep -nE "bg-\[#f8f9fa\]|bg-white|slate-(50|100|105|200|450|505|600|650|655|700|707|800|805|850)|shadow-\[0_2px_8px" src/app/student/messages/page.jsx` and confirm the only remaining matches are ones deliberately excluded above (there should be none — every match in this grep should have been converted, since even the "leave alone" list contains no slate/white/shadow hardcodes). If any unexpected match remains, either fix it (if it's clearly the same class of bug and was simply missed in the table above) or report it as a gap.

Separately confirm every `indigo-*`, `emerald-500`, `emerald-600`, `bg-red-50`, `text-red-500`, `bg-blue-50`, `text-blue-500` occurrence, and the `<style jsx global>` block, are BYTE-IDENTICAL to before your edit (unchanged).

- [ ] **Step 3: Run lint and a dev-server smoke check**

Run `npm run lint` from `lms_web_demo/` — no new errors. If a dev server is available: visit `/student/messages` in LIGHT mode and confirm it still looks correct (panels, text, borders should look the same or very close — the token values were chosen to match the original light-mode appearance). Then switch to DARK mode (via the app's theme toggle) and confirm the page now adapts — panels should become dark (`bg-card` = `#161B22`), text light (`text-foreground` = `#C9D1D9`), borders subtle (`border-border` = `#30363D`) — instead of staying white/light-gray as it did before this fix. Confirm the chat functionality (conversation list, selecting a conversation, the message thread, sending a message, the right-side details panel, category pills, the "more" dropdown) all still work exactly as before — this task only changes colors, never structure, handlers, or state. Check both desktop and mobile widths (the mobile-specific classes like `md:hidden`/`hidden md:flex` are untouched by this task).

---

## Final Verification (whole-plan) — User's "TASK 6"

After all 5 tasks:

1. `git diff` review: confirm exactly 8 files show as modified — `src/components/admin/courses/CourseForm.jsx`, `src/components/ui/Button.jsx`, `src/components/dashboard/common/DashboardStatCard.jsx`, `src/app/student/feedback/page.jsx`, `src/app/student/reviews/page.jsx`, `src/app/student/achievements/page.jsx`, `src/app/student/bookmarks/page.jsx`, `src/app/student/settings/page.jsx`, `src/app/student/messages/page.jsx` (9 files — recount: Task1=1, Task2=1, Task3=1, Task4=5, Task5=1 → 9 total).
2. Confirm via `git status --short -- src/app/instructor src/components/instructor` that neither directory shows any newly-modified file beyond the 2 pre-existing, explicitly-excluded ones from Phase 2 (`instructor/courses/import/page.jsx`, `instructor/composer/AiComposerModal.jsx`) — this plan must add zero new Instructor changes.
3. Run `npm run lint` from `lms_web_demo/` — report the exact error count and compare against the established baseline of 13 pre-existing errors (all in unrelated root-level scripts). Report whether the count changed and, if so, exactly which new errors appeared and where.
4. Run `npm run build` from `lms_web_demo/` — must succeed (exit 0), all routes compile.
5. Manual/smoke verification per task: Admin `/admin/courses/create`, `/admin/courses/edit/[courseId]`, `/admin/courses/[courseId]` (Tasks 1-3); Student `/student/feedback`, `/student/reviews`, `/student/messages`, and the course/settings flows those pages link into (Tasks 4-5). Check both light and dark theme where applicable (all 5 pages support both — none is theme-locked by design). Check desktop and mobile widths for all affected pages — none of this plan's 5 tasks change any responsive breakpoint class, so this is a regression check, not new risk.
6. Report to the user, per their explicit request: exact modified files (9, listed with what changed in each); lint result vs. baseline; build result; confirmation that no Instructor file was modified by this plan's own work (distinguishing that from the 2 pre-existing, unrelated Instructor changes already in the working tree from before this plan started); any issues intentionally left untouched (the invalid-color-shade instances found in Instructor files and a handful of shared/other files outside this plan's 5 named Student files — see Global Constraints); any new issues discovered during this plan's preparation or execution (the Task 1 both-references ruling, the Task 3 file-path correction).
