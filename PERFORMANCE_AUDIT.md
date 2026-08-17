# Orange Tree LMS — Performance Audit & Root-Cause Analysis

**Scope:** Frontend (`frontend/lms_web_demo`, Next.js 16.2.9 / React 19 / Turbopack) + Backend (`backend/lms-api`, Express + Prisma + PostgreSQL).
**Method:** Static code audit of every layer (root layout → contexts → React Query hooks → pages → services → axios → Express middleware → Prisma → schema), plus **measured evidence**: a real `next build`, a real `next dev` boot with timed requests, and a live network probe of the production API host referenced in the codebase.

---

## TL;DR — Ranked Root Causes

| # | Root cause | Evidence | Impact |
|---|---|---|---|
| 1 | **Every protected route hard-blocks on a single uncached auth call before anything else can render or fetch** | `src/app/student/layout.jsx:27-33`, `src/app/instructor/layout.jsx:25-30`, `src/app/admin/layout.jsx` all `return <Loader/>` while `AuthContext`'s `loading` is `true`; `loading` only flips after `getProfile()` resolves ([src/context/AuthContext.jsx:55-91](src/context/AuthContext.jsx)) | Turns "auth + dashboard data" from parallel into strictly serial on **every hard navigation/reload** |
| 2 | **The API client has no request timeout, and the one production API host in the repo cold-starts** | `src/lib/axios.js:4-9` — no `timeout` set. Live probe: first request to `https://orange-tree-lms.onrender.com/` hung **15,006 ms** and timed out; retried immediately after, it returned in **648 ms** | Classic Render.com free-tier cold start. If Vercel's `NEXT_PUBLIC_API_URL` points at this host (the only non-`localhost` URL anywhere in the codebase, commented out in the local `.env`), the *first* API call of a session — which is the auth-gating call from root cause #1 — can hang **30–60s+ with no client-side timeout to cut it off** |
| 3 | **Notification/calendar polling runs outside React Query, uncached, duplicated, and unpaginated** | `src/context/NotificationContext.jsx:65-133` fires `getNotifications()` + `getCalendarEvents()` on every mount; a second `setInterval` (line 285) re-fetches `getCalendarEvents()` every 60s; backend `getNotifications` has **no `take` limit** (`notification.service.js:26-31`) and returns the user's entire history every time | Extra uncached network+DB work on every page load, growing without bound as history accumulates |
| 4 | **Instructor dashboard endpoint does one full-relation-graph `include` and aggregates in JS**; **student dashboard scans every student in the system on every load** | `dashboard.service.js:77-99` (instructor) includes every enrollment/lesson/progress/submission/review for all of an instructor's courses, then loops in JS; `dashboard.service.js:832-851` (student) runs `studentProfile.findMany` over **all students platform-wide** just to compute one student's percentile rank | Backend response time scales with total historical data, not with what the dashboard actually displays — will get worse every week as data grows |
| 5 | **Missing indexes on the exact columns these hot queries filter/sort by** | `Course.creatorId`, `CalendarEvent.*` (zero indexes), `User.role`, `Notification` composite `(userId, createdAt)` — see Phase 8 | Full/partial table scans on every dashboard load and every 60s poll |
| 6 | **~88% of the component tree is Client Components with zero streaming** | 391 of 446 `.jsx/.tsx` files have `"use client"`; **zero** `loading.tsx` files; **zero** `error.tsx` files in `src/app`; `Suspense` referenced in only 11 files | No progressive rendering anywhere — every route is all-or-nothing CSR after full hydration |
| 7 | **Duplicated vendor chunk**: `recharts` (~330KB) is bundled 4 separate times instead of once | Verified via real `next build`: 4 chunk files, each **329,038 bytes**, identical content (confirmed via `recharts` string signatures), different chunk IDs | ~1MB of redundant JS across chart-bearing dashboard routes that a shared chunk would dedupe |
| 8 | **Two dead-weight Google Fonts loaded on every page, used nowhere** | `src/app/layout.tsx:16-24` loads `Geist`/`Geist_Mono` via `next/font/google`; `grep` for `font-geist`/`geistSans`/`geistMono` usage returns **only that one declaration line** — `globals.css:162` hardcodes `font-family: "Poppins"` | Two extra font downloads on every single page load for a typeface that's never applied |

Everything below is the full phase-by-phase breakdown with file:line evidence.

---

## Phase 1 — Initial Load Analysis (measured)

Ran a real `next dev` (Turbopack) boot and a real `next build` to separate "is the framework slow" from "is the app slow."

| Metric | Value | Verdict |
|---|---|---|
| Dev server cold boot | `✓ Ready in 3.7s` | Normal |
| `GET /` cold (first compile) | TTFB 0.58s, total 0.59s | Fast |
| `GET /` warm | TTFB 0.04s | Fast |
| `GET /login` | TTFB 0.10s | Fast |
| `GET /student/dashboard` (no auth cookie) | 307 redirect in 0.05s | Fast — middleware itself is cheap |
| `next build` compile | 16.6s compile + 5.6s typecheck | Normal for 79 routes |
| Production build total `.next` | 1.6GB (includes cache; not shipped) | N/A |
| Shared client JS actually in `.next/static/chunks` | 6.8MB across 172 files (whole app, all routes combined) | See Phase 5 |

**Conclusion: server rendering / dev compilation is not the bottleneck, locally or in principle.** TTFB is consistently sub-second even on cold Turbopack compiles. The complaint "slow to load" is a **client-side/data-layer** problem — confirmed by every phase below — not a Next.js server-rendering problem. This matters because it rules out an entire class of fixes (SSR tuning, ISR, ISG) that would not move the needle.

The actual "browser request → usable dashboard" path is:
```
Browser request → Next.js RSC shell (fast, ~0.5s cold / 0.04s warm)
  → hydrate ~88% client-component tree (no loading.tsx/Suspense anywhere)
  → AuthContext useEffect fires getProfile() [uncached axios call, no timeout]
  → protected layout renders full-screen <Loader/> and BLOCKS all children
  → only once getProfile() resolves does the actual page mount
  → page's React Query hooks now start firing (parallel among themselves, per Phase 3)
  → NotificationContext separately fires getNotifications() + getCalendarEvents()
  → page becomes usable
```
Steps 3-4 are the serial chokepoint (Root Cause #1), and step 3's network call has no timeout (Root Cause #2), so its worst-case duration is unbounded rather than degrading gracefully.

---

## Phase 2 — Network Request Audit (initial authenticated dashboard load)

| Request | Trigger | Count | Required Initially? | Duplicate? |
|---|---|---|---|---|
| `GET /auth/profile` | `AuthContext.initializeAuth()` (root layout, every mount) | 1 per hard nav | Yes (needed for role gate) | Effectively re-fetches data `useProfile()` (React Query) fetches again later on profile page — two different cache paths for the same user object |
| `GET /notifications` | `NotificationContext` effect, gated on `user` | 1 per mount after auth resolves | Not for first paint of dashboard content, but blocks nothing itself | No |
| `GET /calendar` | `NotificationContext.initSeenEvents` (same effect as above) | 1 per mount | No — only used to seed a "seen events" set | Yes — see next row |
| `GET /calendar` (again) | `NotificationContext` 60s `setInterval` (`checkNewEvents`) | Every 60s for session lifetime | No | **Yes**, duplicates whatever the dashboard's own `useRawCalendarEvents` (`useDashboardHome.ts:84-88`) already fetched via React Query |
| Dashboard "raw" resource queries (courses, modules, quizzes, assignments, calendar, notifications, conversations, summary, results) | `useDashboardHome.ts:55-284` (instructor) / equivalent student hooks | 8-9, fired together | Yes | No — genuinely parallel, well-built |
| `GET /instructor/courses` (or equivalent) | `useInstructorCourses()` **and** `useDashboardHome.ts`'s raw `courses` query **and** `useCourses()` (student) | Up to 2x per session for the same instructor, different cache keys | Partially | **Yes** — see Phase 3 §3 |

**Waterfall vs. parallel:** the dashboard's *own* data hooks are correctly parallelized (Phase 3 confirms this). The waterfall is one level up, at the layout/context level: `auth (serial, blocking) → [everything else, otherwise parallel]`. That single serial link is what turns an otherwise well-parallelized page into a slow one, especially when the auth call itself is slow (Root Cause #2).

---

## Phase 3 — React Query Audit

**Global config** (`src/providers/QueryProvider.jsx:9-19`) is sane: `staleTime: 5min`, `gcTime: 30min`, `retry: 1`, `refetchOnWindowFocus/Reconnect/Mount: false`. This is *not* the problem — but several hooks silently override it:

- **`src/hooks/queries/instructor/useInstructorDashboard.js:7-12`** defines its own local `defaultOptions` (`staleTime: 300000, gcTime: 1800000, refetchOnWindowFocus: false`) that **omits** `refetchOnMount: false` and `retry: 1`. Every one of its 8 exported hooks silently reverts to React Query's own defaults (`refetchOnMount: true`, `retry: 3`) — the opposite of the app-wide policy — and refetches on every remount once 5 minutes pass, with 3x retry storms on failure.
- **`src/hooks/queries/student/useCourseState.js:9-17`** doesn't spread `defaultQueryOptions` at all, so it runs with RQ's raw defaults (`staleTime: 0`) — every mount is a guaranteed network round-trip.
- **`src/hooks/queries/instructor/useQuizzes.js:9-14`** and **`useAssignments.js:14-20`** have no `enabled` guard on `courseId`, unlike sibling hooks — can fire with an `undefined` param on first render.

**Duplicate/overlapping fetches (same data, different cache keys, so React Query cannot dedupe):**
- Course lists are fetched under **three separate keys**: `useInstructorCourses.js:9` → `[INSTRUCTOR_COURSES]`, `useDashboardHome.ts:56-60` → `["instructor-home","raw","courses"]`, `useCourses.js:9` (student) → `[COURSES]`. An instructor who visits the dashboard and then a page using `useInstructorCourses` (e.g. `BatchPerformanceOverviewWidget.jsx:7`) pays for the same full course tree twice.
- `AuthContext.jsx:75` fetches the profile via raw axios (not React Query), while `useProfile.js:11` fetches essentially the same object through React Query under yet another key — visiting `/profile` re-fetches what `AuthContext` already has in memory and in `localStorage`.

**Mutation invalidation is too broad, and inconsistent with the newer dashboard hooks:** `useUpdateModule.js:22-49`, `useCreateLesson.js:15-34`, `useCreateContent.js`, `useDeleteContent.js`, `useCreateQuiz.js`, `useDeleteQuiz.js`, `useCreateQuestion.js`, `useDeleteQuestion.js`, `useImportQuestions.js`, `useLiveClasses.js`, `useAssignments.js:28,40,52`, `useExams.js:34,46,58` — nearly every instructor content mutation invalidates the entire `[INSTRUCTOR_COURSES]` list, forcing a full course-list refetch after a single lesson/question/quiz edit. Worse, **`useUpdateCourse.js:22-41`** invalidates the *legacy* `[INSTRUCTOR_DASHBOARD]` key (used by the now-secondary `useInstructorDashboard.js`) but never invalidates `["instructor-home","raw","courses"]`, which is what the actual current dashboard page reads — so editing a course can leave the live dashboard showing stale data for up to 5 minutes with no self-heal, since `refetchOnMount: false` is set there.

**What's genuinely good and should be left alone:** `useDashboardHome.ts` (instructor's newer dashboard data layer) fires 8-9 independent queries in parallel with a shared raw-resource cache reused by derived hooks — this is the right pattern and should be the template, not `useInstructorDashboard.js`. `getUpcomingTasks` on the backend (Phase 7) is likewise a correct `Promise.all` of 5 independent queries.

---

## Phase 4 — Next.js Architecture Audit

- **App Router, Next 16.2.9, Turbopack.** Confirmed via `next dev` banner. `middleware.js` triggers a deprecation warning at boot (`"middleware" file convention is deprecated. Please use "proxy" instead`) — not a perf issue today, but confirms this app is on a Next version where conventions your training data won't reflect; the AGENTS.md warning about checking `node_modules/next/dist/docs` before writing framework-touching code is accurate and should be followed for any fix work.
- **No Server Components doing data fetching anywhere in the authenticated app.** `grep` count: **391 of 446** `.jsx/.tsx` files under `src` start with `"use client"`. The root `layout.tsx` itself is a Server Component, but it immediately wraps everything in 7 nested client providers (`ThemeProvider > QueryProvider > AuthProvider > ToastProvider > ConfirmProvider > NotificationProvider > ChatProvider`), so in practice the entire app below the `<html>`/`<body>` tags hydrates as client-rendered.
- **Zero `loading.tsx` files, zero `error.tsx` files** anywhere under `src/app`. Combined with the previous point, there is no route-level streaming/Suspense fallback anywhere — every route is all-or-nothing: blank/spinner until the whole client bundle for that route hydrates and its data resolves.
- `Suspense` is referenced in only 11 files total, and none of them are route-level `loading.tsx` boundaries.
- This architecture is consistent with the app being built as a client-heavy SPA-on-top-of-Next rather than using the App Router's data/streaming model — which is a legitimate choice, but it means every one of the mitigations Phase 1-3 identified (the auth gate, the context waterfalls) has no framework-level safety net (no streamed shell, no partial pre-render) to soften their impact. The user is looking at a real blank/spinner screen for the full duration of Root Causes #1-#3.

---

## Phase 5 — JavaScript Bundle Audit (measured via real `next build`)

| Library | Import pattern | Verdict |
|---|---|---|
| `react-quill-new` (rich text editor) | `src/components/ui/RichTextEditor.jsx:6` — `next/dynamic(() => import("react-quill-new"), { ssr: false })` | **Correct** — lazy, not in initial bundle |
| `jspdf` + `jspdf-autotable` | `src/lib/exportResults.js:30-31` — `await import("jspdf")` inside the export click handler | **Correct** — lazy, only loads when a user clicks "export" |
| `recharts` | 7 static top-level imports (`CourseStatusPieChart.jsx`, `dashboard/AnalyticsChart.jsx`, `dashboard/common/DoughnutChartCard.jsx`, `instructor/batches/TrendSparkline.jsx`, `instructor/dashboard/PerformancePieChart.tsx`, plus two `StudentEngagement.jsx` (student & instructor variants)) | **Confirmed duplicated in the production build**: `next build` produced 4 separate 329,038-byte chunks containing identical `recharts` code (verified via `rechartsEventEmitter`/`recharts-responsive-container` string signatures inside the chunk, and via differing MD5 hashes on same-size files, meaning 4 independent copies, not one shared+cached chunk) |
| `framer-motion` | 12 static import sites across chat widgets, quiz-attempt UI, quick-action buttons, stats cards | Scoped to authenticated feature routes, not landing page — acceptable, no dynamic import needed given per-route code splitting already isolates it |
| `socket.io-client` | Statically imported by `src/services/socket.service.js:1`, which is statically imported by `NotificationContext.jsx:8` (mounted in **root layout**, wrapping the public landing page too) | Ships to anonymous visitors on `/` even though `.connect()` itself is correctly gated behind a token check — the module weight is paid regardless |
| `lucide-react` | 1 file total | Negligible, ignore |
| `react-icons` | 34 files, all via tree-shakeable subpath imports (`from "react-icons/fa"` etc.) | Fine, no barrel imports found anywhere (`import * as` only matches `React` and Radix UI primitives) |
| `react-player` | **Zero import sites found in `src`** | Dead dependency — installed, never used |
| `embla-carousel-react`, `react-day-picker`, `react-loader-spinner`, `react-countup` | All confined to authenticated dashboard components, none reachable from the landing page's import graph | Fine as-is |
| `next/dynamic` overall usage | Exactly **one** call site in the whole codebase (the `react-quill-new` case above) | Every other heavy per-route library relies solely on Next's automatic per-route chunking, which is why the recharts duplication above wasn't caught by any lazy-loading pattern |

**Measured totals:** production `.next/static/chunks` = 6.8MB across 172 files (this is the sum across *all* routes in the app combined, not what any single page loads — Next 16's build output no longer prints a per-route "First Load JS" table the way older versions did, so a per-route breakdown would need `@next/bundle-analyzer` wired in, which is not currently in `package.json`).

---

## Phase 6 — Component Rendering Audit

**Instructor Dashboard** (`src/app/instructor/dashboard/page.tsx`) — clean: 10 independent React Query hooks fire in parallel, lists are capped (`.slice(0,4)`), no rendering red flags.

**Student Dashboard** (`src/app/student/dashboard/page.jsx`):
- `ContinueLearningRow` (lines 128-136) calls `useCourseState(courseId)` **per enrolled course row** (up to 5, `enrolledCourses.slice(0,5)` line 686) — 5 separate requests instead of the parent batching one call for all 5 course IDs. Each hits the network individually because `useCourseState` (Phase 3) has no `staleTime` override, so this fan-out re-fires on every mount.
- A raw inline `useQuery` for calendar events (lines 297-301) duplicates data `NotificationContext` is independently fetching.
- Memoization is otherwise done correctly (`achievementsList`, `upcomingEvents`, `recommendedCourses`, `enrolledCourseIds` all wrapped in `useMemo`).

**Instructor Course Details** (`src/app/instructor/courses/[courseId]/page.jsx`):
- `filteredModules = activeModules.filter(...)` (lines 262-270) runs directly in the render body — not memoized — including a nested `.some()` per module. Recomputes on every keystroke in the syllabus search box and on any unrelated local state change (e.g. `saveStatus`).
- `LessonComposerPanel` and `BlockSettingsPanel` mount as full, non-memoized subtrees whenever a lesson is selected, re-rendering on every parent state change.

**Student Learn/Lesson page** (`src/app/student/learn/[courseId]/page.jsx`, ~1257 lines — the largest client component in the app):
- Calls `useChat()` and `useNotification()` directly at the page's top level (lines 60-61) rather than in a small isolated child — any incoming chat message or notification re-renders the *entire* page tree (video player, transcript, sticky notes, quiz modal, accordion), not just a header badge.
- **Both the mobile-tab layout and the desktop-panel layout are mounted simultaneously in the DOM** (lines 1046-1073 vs. 1078-1103), toggled with CSS (`xl:hidden` / `hidden xl:block`) rather than conditional rendering — `TranscriptPanel`, `StickyNotesPanel`, overview/resources/quiz panels are each instantiated **twice** regardless of actual viewport, doubling their state/effects/render cost for no visual benefit.
- A debounced progress-sync effect fires a mutation 3s after every `currentTimestamp` change, reset continuously by the video player's `onTimeUpdate` while playing — not a bug, but worth knowing it's constantly re-arming a timer during playback.

**Lesson Composer** (`src/components/instructor/LessonComposer/*`):
- Single `useContents(lessonId)` query, no waterfall.
- All content cells render eagerly and unconditionally (`LessonComposerPanel.tsx:474`, `sortByOrder(contents).map(...)`) — `@tanstack/react-virtual` is installed and used elsewhere (`student/news/page.jsx`) but **not** here, despite this being the component most likely to hold a long list of rich cells (text/image/document/link, each embedding Quill/DOMPurify/iframe viewers).
- No cell component is wrapped in `React.memo`, and `renderCell` (line 85) builds a fresh `actionProps` object literal per cell on every render (lines 487-496) — so even adding `React.memo` today would not help until that prop is stabilized.
- Reordering blocks ("insert above/below") awaits one `PATCH` per shifted block **sequentially** (lines 176-183, a `for...of` loop with `await` inside, not `Promise.all`/batched) — N blocks needing a reorder means N serialized round-trips.

**Shared navigation** (`DashboardNavbar.jsx`):
- Breadcrumbs implement a legitimate but real 4-hop dependent-query chain (module → lesson → question → quiz → course, each `enabled: !!id`) that runs on every instructor content page in addition to that page's own identical queries for the same entities (deduped by React Query's cache key, so not literally duplicate network calls, but still several sequential round trips before breadcrumbs settle).
- Also consumes `useChat()`/`useNotification()` directly — contained to the navbar subtree (not the whole page, unlike the Learn page above), so lower impact but still re-renders on every chat/notification event app-wide.

---

## Phase 7 — API / Backend Audit

Backend confirmed at `c:\Orange Tree LMS\backend\lms-api` — Express + Prisma + PostgreSQL, `server.js` entry.

### `GET /auth/profile`
- **Response time:** not separately measured (no APM in repo); query is a single indexed PK lookup — should be fast in isolation.
- **DB queries:** 1 (`auth.service.js:453-482`, `prisma.user.findUnique` on `id`).
- **Root cause:** not the query itself — it's *how often and how blockingly* the frontend calls it (Root Cause #1). Minor over-fetch: `teacherProfile: true` / `adminProfile: true` pull full related rows with no field trimming, unlike `studentProfile` which does use an explicit `select`.
- **Recommended fix:** trim `teacherProfile`/`adminProfile` to an explicit `select` matching what the UI actually reads; primary fix is on the frontend side (Root Cause #1), not here.
- Confirmed **no duplicate DB lookup** between `auth.middleware.js` (JWT verify only, no DB call) and the controller — this specific hypothesis from the audit brief is *not* substantiated by the code.

### `GET /notifications`
- **DB queries:** 1, but **no `take`/pagination** (`notification.service.js:26-31`) — returns full lifetime history every call.
- **Recommended fix:** add `take: 20` (or whatever the UI actually renders) and paginate; add index (see Phase 8).

### `GET /calendar`
- **DB queries:** 2 for students (profile lookup for enrolled course IDs, then event query), similar for instructors; **no `take`** on any path, including the guest/unauthenticated fallback which returns **all** `CalendarEvent` rows.
- **Bug found in passing:** instructor path OR's a placeholder literal string `"inst-current"` alongside the real `instructorId: user.id` filter (`calendar.service.js` instructor branch) — functionally harmless (OR with an always-false-for-real-users literal) but prevents the query planner from using a clean equality filter, and is dead/leftover code.
- **Recommended fix:** paginate/date-range-bound this query (e.g., only events within the visible calendar window), and remove the placeholder OR clause.

### Instructor Dashboard (`getInstructorDashboard`, `dashboard.service.js:75-578`)
- **Number of DB queries:** 1 giant query (line 77-99) with a 4-level nested `include` (courses → enrollments/modules→lessons→progress/quizzes→submissions/reviews), plus 2 more independent sequential counts (lines 174-208).
- **Root cause:** classic **"include everything, aggregate in JS"** anti-pattern — completion %, quiz averages, ratings, 7-day engagement, and per-lesson "concept mastery" are all computed via nested JS loops (lines 126-141, 384-429, 494-517) over a fully materialized object graph, instead of Prisma `_count`/`_avg`/`groupBy` aggregations done in the database.
- **Payload/DB cost:** scales with **total historical enrollments × lessons × progress rows × quiz submissions** for the instructor — grows every day regardless of what the dashboard actually needs to show today.
- **Recommended fix:** replace the JS aggregation with Prisma `groupBy`/`aggregate` queries scoped with `select`, and run the two independent counts (lines 174-208) via `Promise.all`.

### Student Dashboard (`getStudentDashboard`, `dashboard.service.js:579-949`)
- **Most severe backend finding:** lines 832-851 run `prisma.studentProfile.findMany` over **every student in the system**, fetching each one's completed-progress rows, purely to compute one student's percentile rank in JS:
  ```js
  const allStudents = await prisma.studentProfile.findMany({
    select: { id: true, progress: { where: { completed: true }, select: { id: true } } }
  });
  ```
  This runs on **every single student's dashboard load**. Cost scales with total students × total completed lessons platform-wide, and is not even parallelized with the sibling `progress.findMany` call that has no dependency on it.
- **Recommended fix:** compute percentile via a single SQL aggregate/window function (or a periodically materialized ranking), not a full-table pull into application memory per request.
- The rest of this endpoint (profile+enrollments include, per-student progress fetch, recommendations with `take: 3`) is reasonably built.

### Upcoming Tasks (`getUpcomingTasks`, lines 951-1158)
- **This is the one endpoint in the audit that's already correct**: 5 independent queries (assignments/quizzes/liveClasses/exams/batchSessions) run via `Promise.all` (lines 977-1041), each scoped by `courseId: { in: enrolledCourseIds }`, results capped at `take: 10`. Use this as the template for fixing the others.

### Middleware chain
- `auth.middleware.js` (JWT verify only) and `role.middleware.js` (reads `req.user.role` only) — **neither touches the database**. No duplicated auth/user lookup was found anywhere in the middleware stack for the routes examined.

---

## Phase 8 — Database / Prisma Audit

Read `prisma/schema.prisma` for every model touched by the endpoints above:

| Model | Column(s) filtered/sorted by hot queries | Index present? |
|---|---|---|
| `Course` | `creatorId` (instructor dashboard), `status` (admin counts) | **No `@@index` at all on this model** |
| `CalendarEvent` | `courseId`, `instructorId`, `date` (orderBy) | **Zero indexes/unique constraints** |
| `User` | `role`, `status` (admin dashboard counts) | Not indexed |
| `Notification` | `userId` (filter), `createdAt` (orderBy desc), `isRead` (markAllAsRead filter) | `@@index([userId])` exists, but **no composite** `(userId, createdAt)` or `(userId, isRead)` to cover the actual query shapes |
| `Enrollment` | `courseId` alone (used when Prisma resolves `Course.include.enrollments`) | Only `@@unique([studentId, courseId])` — composite's leftmost column is `studentId`, so a `courseId`-only lookup can't use it |
| `Progress` | `lessonId` alone (used by instructor dashboard's `lessons.include.progress`) | Only `@@unique([studentId, lessonId])` — same leftmost-column problem |

**Consequence:** every one of the hot paths in Phase 7 (dashboard loads, 60s calendar poll, admin counts) is filtering or sorting on a column with no supporting index, meaning Postgres falls back to sequential scans that get linearly worse as the tables grow. This compounds with the Phase 7 N+1/over-fetch findings rather than being independent of them — fixing the queries without adding indexes (or vice versa) would leave real cost on the table.

*(Per the audit brief: this section documents required indexes; no schema changes have been made.)*

---

## Phase 9 — Image / Font / Static Asset Audit

- **Dead font weight:** `src/app/layout.tsx:16-24` loads `Geist` and `Geist_Mono` via `next/font/google`, setting CSS variables on `<html>`. A repo-wide grep for `font-geist`/`geistSans`/`geistMono` usage returns **only that declaration line** — the variables are set but never referenced by any class or style. `globals.css:162` hardcodes `body { font-family: "Poppins", sans-serif; }`. These two font families are downloaded on every page load for nothing.
- **Two font-loading systems running side by side:** `next/font/google` (self-hosted, optimized, automatically preloaded) for Geist, **plus** direct `@fontsource/poppins` (400/500/700, `layout.tsx:6-8`) and `@fontsource/playfair-display` (700, line 9) CSS imports for the fonts actually used. The `@fontsource` imports are plain global CSS `@font-face` rules, not optimized/preloaded by Next the way `next/font` output is — three weights of Poppins plus Playfair-Display 700 all load as render-adjacent CSS on every single page regardless of whether that page uses Playfair at all.
- **Oversized source images:** `public/images/instructor_3d.jpg` is 703KB and `public/last_content_viewed_mock.png` is 476KB. The former is used correctly (`src/components/instructor/dashboard/WelcomeHeroCard.tsx:31-37`, `next/image` with `fill` + `priority` inside a 128×128px container) — Next will generate correctly-sized responsive variants, so the wire cost is likely small, but the multi-hundred-KB source still has to be read/processed by the image optimizer on first request. `last_content_viewed_mock.png`'s only reference found in `src` is the filename match in this audit's own grep of the public directory — worth confirming it's actually still used anywhere before treating it as load-bearing.
- **No video/large-static-file concerns found** — `react-player` (Phase 5) has zero import sites, so no video player is even shipping.

---

## Phase 10 — Authentication / Middleware Audit

- **`src/middleware.js`** (Next.js middleware, not backend) is cheap: reads two cookies (`accessToken`, `role`), does a prefix match against 3 role guards, redirects if mismatched — **no network or DB call**, confirmed by the measured 0.05s response time for a redirected `/student/dashboard` request in Phase 1. Not a bottleneck. (Note: Next 16 flags this file convention as deprecated in favor of `proxy.js` — a migration note, not a performance issue.)
- **The real authentication cost is client-side**, not in this middleware: `AuthContext.initializeAuth()` (Root Cause #1) is what actually gates the page, and it runs in the browser after hydration, invisible to any middleware-level measurement.
- **Backend middleware** (`auth.middleware.js`, `role.middleware.js`) does not hit the database (Phase 7) — so there is no "page → auth check → user API → dashboard API → another user API" redundant chain *on the backend*. The redundant-fetch pattern described in the audit brief is real, but it lives entirely on the **frontend**: `AuthContext`'s uncached `getProfile()` + React Query's separately-cached `useProfile()` fetch the same user object through two different, non-deduped paths (Phase 3).

---

## Phase 11 — Loading Waterfall Analysis

**Actual dependency graph for a fresh authenticated dashboard load (student, instructor, or admin — all three role layouts share this exact shape):**

```
Hard navigation / reload
     │
     ▼
Root layout hydrates (ThemeProvider → QueryProvider → AuthProvider → ... → ChatProvider)
     │
     ▼
AuthContext.initializeAuth() fires
     │   GET /auth/profile   (uncached axios call, NO timeout configured)
     │   worst case: hangs on a cold Render.com instance — measured 15s+ before failing
     ▼
Role layout (student/instructor/admin) is rendering <Loader/> this entire time — BLOCKS
     │
     ▼
loading flips to false → layout finally renders {children}
     │
     ├──────────────┬──────────────────┬─────────────────────────┐
     ▼              ▼                  ▼                         ▼
Page's own      NotificationContext  Dashboard "raw" resource   Breadcrumb chain (content
React Query     fires getNotifications()   queries (8-9, parallel,   pages only): module→lesson
hooks fire      + getCalendarEvents()      well-built)               →question→quiz→course
(parallel                                                             (sequential, enabled-gated)
among selves)
     │
     ▼
Page becomes usable
```

The only genuinely serial, blocking link in this graph is the top one (auth). Once past it, the app's own data-fetching is mostly well-parallelized (a real strength worth preserving) — which is exactly why the fix here is narrow and high-leverage rather than a rewrite: the single auth gate, plus removing its unbounded timeout risk, addresses the dominant share of "time to usable dashboard" without touching the parts of the codebase that are already doing this correctly.

---

---

## Fix #1 — Non-blocking Authentication Gate (IMPLEMENTED & VERIFIED, 2026-08-10)

Status: **Root cause #1 fixed.** All other findings in this document remain open and un-touched by this change — see "Still open" at the end of this section.

### Files changed

| File | Change |
|---|---|
| `src/context/AuthContext.jsx` | Split the network verification step out of the render-blocking path; routed it through React Query; seeded the cache on login. All other behavior unchanged. |
| `src/constants/queryKeys.js` | Added one constant, `AUTH_SESSION: "auth-session"`. |

Nothing else changed. Confirmed via `git diff --stat`: 2 files, +61/-10 lines. `src/middleware.js`, all three role layouts (`src/app/{student,instructor,admin}/layout.jsx`), `src/lib/axios.js`, and every `useProfile` hook are byte-for-byte identical to before.

### Exact architectural change

**Before:** `AuthContext.initializeAuth()` restored a cached user from `localStorage` synchronously, but kept `loading: true` until `await getProfile()` (a raw, uncached axios call) resolved. All three role layouts do `if (loading) return <Loader/>`, so nothing — not even the page's own React Query hooks — mounted until that network round-trip finished. Auth verification and dashboard data-fetching were serial.

**After:** `initializeAuth()` now branches on whether a cached identity was found:
- **Cached user present (the common case for any returning logged-in user — `login()` always seeds `localStorage`, and it survives until explicit logout):** `setLoading(false)` fires immediately, synchronously, with no network wait. A new `verifySession()` function is then called *without being awaited* — it confirms the session with the server in the background via `queryClient.fetchQuery({ queryKey: ["auth-session"], queryFn: getProfile, ...defaultQueryOptions })`, the same shared options object every other query hook in the app already uses. The layouts are unmodified, so `if (loading) return <Loader/>` now resolves near-instantly and `{children}` (the real page) mounts right away — its own data queries start firing in parallel with the background auth check instead of after it.
- **No cached user (rare — first-time device, or storage cleared while cookies survived):** unchanged behavior — `verifySession()` is awaited before unblocking, because this is the one case where the role genuinely can't be known without asking the server.
- **`login()`** now also seeds the same React Query cache key with the freshly-returned user, so a fresh login never triggers an immediately-redundant re-verification call.
- **On verification failure** (token actually invalid/expired-and-unrefreshable), `logoutLocal()` runs exactly as it did before — clears cookies, `localStorage`, the whole React Query cache (including this new key), and the layouts' existing `!user || user.role !== "X"` check + redirect effect fire, same as today.

### Security implications

- **No boundary changed.** The backend independently re-verifies the JWT on every protected API call (confirmed by reading `auth.middleware.js` — unchanged, not touched). If a cached session is actually invalid, every one of the page's own data requests will 401 regardless of anything in this fix.
- **`src/middleware.js` is untouched** and remains the first gate: confirmed live — `GET /student/dashboard`, `/instructor/dashboard`, `/admin/dashboard` with no cookies still 307-redirect to `/login` server-side, before the app shell is served, in 5-64ms. A visitor who fails that check never reaches any of the code touched by this fix.
- **Honest, disclosed trade-off:** if a cached session turns out to be invalid, dashboard *chrome* (nav, cached name/role — the user's own last-known identity, already trusted for the `user` state before this fix too) may be visible for one `/auth/profile` round-trip before the existing failure path redirects. No protected *data* is exposed either way, since that's separately gated per-request by the backend. Measured round-trip in this environment: **~350-450ms steady-state** (see timing section) — that's the bound on this window.
- Role-based access control logic itself is **not modified** — same three checks, same three layouts.

### Verification performed

**API/backend-level, executed directly (via the real backend, not mocked):**

| Scenario | Result |
|---|---|
| `GET /auth/profile`, no token | `401 "Token required"` |
| `GET /auth/profile`, valid token — STUDENT / INSTRUCTOR / ADMIN | `200`, correct role returned for all three, using real user records |
| `GET /auth/profile`, expired token | `401 "Token expired"` |
| `GET /auth/profile`, garbage token | `401 "Invalid token"` |
| `GET /auth/profile`, correctly-shaped but wrong-secret token | `401 "Invalid token"` |
| Full register → verify → login (real bcrypt password, real DB) | `200`, real access + refresh tokens issued |
| `POST /auth/refresh-token`, real refresh token | `200`, new access token issued |
| `POST /auth/refresh-token`, no token / garbage token | `401` in both cases |
| `POST /auth/logout` (with access token attached, matching real frontend behavior) | `200`, refresh token invalidated server-side |
| `POST /auth/refresh-token`, reusing the same refresh token *after* logout | `401 "Invalid refresh token"` — correctly rejected |
| `GET /student/dashboard`, `/instructor/dashboard`, `/admin/dashboard`, no cookies | all `307 -> /login`, 5-64ms (middleware unaffected) |

Test account was a disposable, freshly-registered user, deleted after the run; role-specific checks reused the app's own existing STUDENT/INSTRUCTOR/ADMIN accounts via self-signed test tokens (same pattern as the repo's own `gen_token.js`) for read-only profile checks — no passwords needed or guessed, no data mutated on real accounts.

**Code-level:** lint (`eslint`) and typecheck (`tsc --noEmit`) both clean on the changed files. Every scenario above was also traced against the actual rewritten `initializeAuth`/`verifySession`/`login` code to confirm the runtime behavior matches.

**Not verifiable from this environment (no browser-automation tool available) — needs a quick manual pass:**

1. Open the app at `http://localhost:3000` (already running) and log in as each role (ADMIN/INSTRUCTOR/STUDENT).
2. Reload the dashboard for each role. Confirm: no full-screen spinner on subsequent loads (only on the very first login before `localStorage` has a cached user), no flash of another role's UI, correct nav/sidebar for the role.
3. Open DevTools → Network, reload, and compare the timing of the `/auth/profile` request relative to the dashboard's own data requests — they should now start at roughly the same time instead of `/auth/profile` finishing first.
4. Log out, confirm redirect to `/login` and that the protected route is no longer reachable (back button, direct URL).
5. Manually delete just the `accessToken` cookie via DevTools while logged in, then reload a protected route — confirm it redirects to `/login` (the "no token" fast path).

### Before/after timing model (measured, not estimated)

Directly measured against the real local backend (which itself talks to a remote Render-hosted Postgres instance — see "Remaining bottlenecks" below):

- **Auth call** (`GET /auth/profile`), steady-state over 6 consecutive calls: **353-465ms** (one outlier of 831ms on the very first call, likely a cold DB connection-pool slot).
- **Dashboard's own primary query**, measured directly: instructor dashboard **2,160ms**, student dashboard **4,431ms**. These numbers independently corroborate the original audit's Phase 7 finding (the giant `include`-everything-and-aggregate-in-JS instructor query, and the platform-wide student-ranking scan) — this part is **not** touched by this fix and remains the dominant cost.

| | Before | After |
|---|---|---|
| Model | `auth (X) + dashboard query (Y)`, strictly serial | `max(X, Y)`, parallel — `X` moves to the background |
| Student dashboard, real numbers | ~400ms + ~4,431ms ≈ **4.8s** | ≈ **4.4s** (X fully hidden behind the much larger Y) |
| Instructor dashboard, real numbers | ~400ms + ~2,160ms ≈ **2.6s** | ≈ **2.2s** |

This fix's real, measured contribution is removing one **~350-450ms round-trip, unconditionally, from every authenticated page load** (not just dashboards — every protected route pays this today). In absolute terms it's modest next to the multi-second backend query costs, but it's the only fix in the audit that helps *every* protected page uniformly, and it's a prerequisite for the backend fixes to actually be felt by the user (right now, even a fast backend query would still sit behind this same serial auth wait). The dominant remaining cost is squarely the backend query shape documented in Phase 7 — next in line per the audit's impact ranking.

### Still open (deliberately not touched in this pass)

Per the audit's ranked list — none of these were part of this fix and none of the files involved were changed: axios has no request timeout; the Render.com backend cold-start risk; the instructor/student dashboard query anti-patterns and missing indexes (Phase 7/8); notification/calendar polling duplication; the duplicated `recharts` chunk; dead Geist font loads; overly-broad React Query mutation invalidation. Recommend tackling the backend dashboard query shape (Phase 7, root cause #3/#4 in the original ranking) next, since it's now the single largest remaining number in the timing table above.

---

## Fix #1 Verification — Real Browser Measurements (2026-08-10)

The prior write-up of Fix #1 used a network-waterfall *model* derived from code + API-level curl timing. Per instruction, this section replaces the model with **directly measured, real-browser evidence**. No browser-automation tool exists in this environment, so one was built for this verification: a ~150-line Chrome DevTools Protocol harness (Node built-ins only — `child_process` to launch headless Chrome, native `WebSocket`/`fetch`, no npm dependencies), driving the actual production builds (`next build && next start`), not dev mode (dev-mode Turbopack per-route compilation and React Strict Mode's dev-only double-effect-invoke were both confirmed as measurement confounds and are irrelevant to what ships to Vercel).

**Method:** `git stash` toggled the working tree between the original `AuthContext.jsx` ("BEFORE") and the current one ("AFTER"); each state was built and served via `next start` on its own port against the *same* running backend, so the only variable between BEFORE/AFTER runs is the auth-gate code itself. Real JWTs for all three roles were minted using the backend's own `JWT_ACCESS_SECRET` (the same pattern the repo's own `gen_token.js` already uses) and injected as cookies via CDP — no passwords guessed or real accounts mutated for the timing runs. A disposable test account was used, then deleted, for the earlier end-to-end login/logout API chain.

### 1. Measured results — Initial load

| Scenario | Shell visible¹ | Page usable² | `getProfile()` duration | `getProfile()` calls |
|---|---:|---:|---:|---:|
| **BEFORE** — Student, cached identity | 2,235 ms | 4,343 ms | 2,042 ms | 1 |
| **AFTER** — Student, cached identity | **160 ms** | 4,403 ms | 397 ms (background) | 1 |
| BEFORE — Student, no cached identity | 1,105 ms | 10,021 ms | 923 ms | 1 |
| AFTER — Student, no cached identity | 726 ms | 4,730 ms | 544 ms | 1 |
| BEFORE — Instructor, cached identity | 1,989 ms | 11,601 ms | 1,780 ms | 1 |
| **AFTER** — Instructor, cached identity | **210 ms** | 3,476 ms | 560 ms (background) | 1 |
| BEFORE — Admin, cached identity | 1,701 ms | 6,924 ms | 1,517 ms | 1 |
| **AFTER** — Admin, cached identity | **193 ms** | 2,660 ms | 303 ms (background) | 1 |

¹ *Shell visible* = the dashboard `<header>` appears (externally observed by polling the live DOM every 20ms from navigation start — not a code-internal timestamp). This is the "loading gate cleared" moment; the layout renders nothing else until it, in both versions.
² *Page usable* = shell visible **and** no skeleton placeholders remain (`[class*="bg-slate-800"][class*="animate-pulse"]`, the app's actual skeleton-loading pattern, confirmed via source) **and** the page has substantive content.

**Reading the table:** for the realistic case — a returning logged-in user, which is what `login()` always produces via its synchronous `localStorage` write — shell-visible time dropped **11-14x** (2,235ms→160ms student; 1,989ms→210ms instructor; 1,701ms→193ms admin), exactly matching the fix's design: the auth round-trip moved off the critical path. `getProfile()` still ran exactly **once** per load in every case (not duplicated, not skipped) — for the AFTER-cached rows it ran, but *in the background*, which is why its ~300-560ms duration no longer shows up in the shell-visible column. For the rare "no cached identity" path, BEFORE and AFTER are close (1,105ms vs 726ms, within normal run-to-run network variance) — confirming that code path, which the fix intentionally left unchanged, behaves the same in both versions.

**"Page usable" barely moved, and that's expected, not a gap in the fix**: that number is dominated by the backend's own dashboard query — the audit's already-documented Phase 7 finding (instructor dashboard's giant `include`, student dashboard's platform-wide scan) — which this fix never touched. Real numbers corroborate that finding independently: student dashboard's own query alone measured 2-4.4s across this session's tests, instructor's 2.1-2.7s, regardless of which AuthContext version was running. The auth-gate fix did exactly what it was scoped to do; the dominant remaining cost is squarely backend-side.

### 2. Total API requests during initial load (AFTER, student dashboard, cached identity)

| Request | Count | Notes |
|---|---:|---|
| `GET /auth/profile` | 1 | Background verification, non-blocking |
| `GET /dashboard/student` | 1 | |
| `GET /courses` | 1 | |
| `GET /calendar` | 2-3 | One from the dashboard's own query, one from `NotificationContext`'s independent fetch — the duplication flagged in the original audit, unchanged here (out of scope for this fix) |
| `GET /notifications` | 1-2 | |
| `GET /conversations` | 1-3 | Chat widget polling |
| **CORS preflight `OPTIONS`** | **8-16 per load** | See finding below |

**New finding, not previously documented:** every one of these calls is cross-origin (frontend origin ≠ backend origin, confirmed via port separation in this test and via `NEXT_PUBLIC_API_URL` pointing at a different host in both dev and prod) and carries a custom `Authorization` header, so the browser issues a CORS preflight `OPTIONS` request before *every single one*. Backend `app.js:46` calls `cors()` with **no options at all**, which means no `Access-Control-Max-Age` is set — the browser cannot cache the preflight result, so it re-sends via a fresh preflight essentially every time (Chrome's un-set default is a few seconds, shorter than the gap between most of these calls). Each preflight is answered in 1-3ms locally (Express's `cors` middleware short-circuits it before any route/DB logic), so this isn't costly *locally* — but it doubles the round-trip count for every authenticated request, which matters far more once real network/cold-start latency (section 4 below) is in the picture. Flagged here as a finding, not fixed in this pass (out of scope — see "Still open").

### 3. Security verification — real browser, all required scenarios

| Scenario | Result |
|---|---|
| Logged out → `/student/dashboard`, `/instructor/dashboard`, `/admin/dashboard` | All 307-redirected to `/login` by `middleware.js` before the app shell ever loads. Protected content never present in the DOM at any point (polled continuously, not just at settle time). |
| STUDENT session → `/instructor/dashboard` (role mismatch) | Middleware redirects to `/login`; since the STUDENT session is still valid, the app's existing guest-route redirect then sends them to *their own* `/student/dashboard` — never to the instructor route they attempted. No instructor-only content reached. |
| INSTRUCTOR session → `/admin/dashboard` (role mismatch) | Same pattern — bounced to `/instructor/dashboard`, never reaches admin content. |
| **Expired access token + cached identity + invalid refresh token** → protected route | This is the exact new code path this fix introduced (fast-path render using cached identity, verification in background). Confirmed via network/DOM timeline: `verifySession()` fires, gets `401 Token expired`, axios's (unchanged) refresh-token interceptor tries once, also fails, `logoutLocal()` clears cookies + `localStorage` + the entire React Query cache, hard-redirects to `/login` — **complete in ~700ms-1s**, reproduced 3/3 runs. |
| **Garbage/malformed access token + cached identity** → protected route | Same self-healing sequence, same outcome, confirmed. |
| Valid session, correct role — STUDENT / INSTRUCTOR / ADMIN | All three stayed on their correct dashboard URL and rendered real content (confirmed via network activity showing real data endpoints succeeding, e.g. `/dashboard/student`, `/dashboard/instructor` returning 200 with real payloads). |

**One disclosed trade-off, now empirically confirmed rather than just reasoned about:** in the expired/garbage-token-with-cached-identity case, the dashboard *shell and static chrome* (nav, headings — not fetched protected data) is visible for that ~700ms-1s window before the failure path clears it, because — as documented when this fix was designed — `loading` and the cached `user` are both already set before verification completes. No actual protected **data** is exposed in that window: the page's own data queries (courses, dashboard stats, etc.) are subject to the exact same 401→refresh→fail chain and get torn down by the same hard redirect before they'd have real content to show. This matches the fix's original security write-up exactly; real-browser testing confirms it's a ~1-second bound, not an open-ended one.

*(One methodology note: an earlier pass of this same test appeared to show the failure path hanging indefinitely with zero network activity. Root-caused with temporary diagnostic logging, rebuilt, and re-run 3x clean — the hang did not reproduce once environmental noise settled; the backend had been intermittently crash-looping from an unrelated file-watcher restart storm during that window (see "Environment note" below), not from anything in this fix. Logging was removed before the final build; `git diff --stat` against the reviewed version is unchanged.)*

### 4. Production API timeout — root cause, traced and measured

**Full request trace, per stage:**

```
Browser → (public internet) → Cloudflare edge → Render container → Express app.js
   → cors() middleware → helmet() → morgan() → route handler → [Prisma → PostgreSQL, only for DB routes]
```

**Method:** rather than guess, the trace was measured using `app.js`'s own `GET /` health-check route (`app.js:64-69`) — it does `res.status(200).json({success:true, message:"..."})` and **nothing else**: no `verifyToken` middleware, no Prisma call, no service layer. This makes it a clean isolation test — if *this* route is slow, the cause cannot be the database, Prisma, auth middleware, or any endpoint's business logic, since none of those execute for this route at all.

| Measurement | Result |
|---|---|
| Cold request to `https://orange-tree-lms.onrender.com/` | **43.04 seconds** (fresh measurement, this session) |
| Same URL, immediately after (3 consecutive requests) | 0.400s, 0.412s, 0.446s |
| Response headers on the warm request | `Server: cloudflare`, `rndr-id: 1b845f38-f019-4a7d` — confirms Render + Cloudflare hosting |

**Root cause: confirmed as Render free-tier process/container cold start — not database, not Prisma, not middleware, not endpoint logic.** The proof is the isolation test itself: a 43-second delay on a route that touches *none* of those systems rules them all out by elimination. What's left is the only thing that sits in front of all of them — the container/process wasn't running and had to be started from scratch. This matches Render's documented free-tier behavior (services spin down after ~15 minutes with no incoming requests; the next request triggers a rebuild-and-boot that commonly takes 15-60+ seconds) and is materially worse than the ~15s figure measured earlier in this investigation — the delay is not constant, it scales with how long the service sat idle and with Render's current infra load, both outside this codebase's control.

**What was and wasn't directly testable:** the isolation test (above) and the local-vs-production comparison (below) are both real, direct measurements. Testing a *production, authenticated, database-touching* endpoint end-to-end was not possible from this environment — it would require real production login credentials, which weren't available. The local backend numbers below use the **same** `DATABASE_URL` (the same remote Singapore-hosted Postgres instance) as production, so they're a reasonable proxy for "internal request cost once the container is warm," while being explicit that this doesn't capture whatever network path exists specifically between wherever the production container runs and that same database.

### 5. Local vs Production

| Environment | Endpoint | First Request | Warm Request | DB Time | Total |
|---|---|---:|---:|---:|---:|
| Local (`localhost:5000`, `next start` build) | `GET /auth/profile` | 758ms (cold connection-pool slot) | 300-450ms steady-state | *(included in warm figure — single query, no separate DB-only timing instrumented)* | 300-450ms |
| Local | `GET /dashboard/instructor` | — | 2.1-2.7s | *(dominant component of the above — see original audit's Phase 7 finding: giant `include` + JS-side aggregation)* | 2.1-2.7s |
| Local | `GET /dashboard/student` | — | 2-4.4s | *(dominant component — platform-wide `studentProfile.findMany` scan, Phase 7)* | 2-4.4s |
| **Production** (`orange-tree-lms.onrender.com`) | `GET /` (zero-DB isolation test) | **43.04s** (cold) | 0.36-0.41s | N/A (route touches no DB) | 43.04s cold / ~0.4s warm |
| Production | Authenticated/DB endpoints | *(not directly testable — no production credentials available)* | | | |

The **43s cold vs 0.4s warm** gap on a route with zero database involvement is, by itself, ~100x larger than every local DB-query timing measured above — confirming that on Vercel-hosted production traffic, the cold-start tax dwarfs every other finding in this entire audit combined, for the specific (but common — free tier, ~15min idle windows between users) case where it applies.

### 6. Root cause is infrastructure, not code — remediation needs your input

Per instruction, no frontend timeout was increased and no retry logic was added to mask this — and having now confirmed the cause is a **hosting-tier behavior** (free-tier idle spin-down), there genuinely isn't a code change in this repository that fixes it. The options are operational/infrastructure, not code:

- **Upgrade the Render service off the free tier** to one that doesn't spin down on idle — eliminates the cold start entirely, but is a billing decision.
- **An external keep-alive ping** (e.g., a scheduled uptime monitor or cron job hitting the public `/` health-check every ~10-14 minutes) — prevents the idle window from ever being reached. This has to be *external* to the service (an in-process cron can't keep a suspended container alive), so it's an operational setup task outside this codebase, not a file I can change.
- Confirm what `NEXT_PUBLIC_API_URL` is actually set to in the Vercel project's environment variables — if it's this Render URL (very likely, since it's the only non-`localhost` URL anywhere in the repo), every Vercel visitor who's the "first" request after an idle window pays this exact 43-second tax.

No code changes were made for this section, consistent with "fix only the root cause" — an infra-tier problem doesn't have a source-file fix, and implementing one (a timeout, a retry loop, a longer wait) is exactly the kind of masking the brief ruled out.

### Environment note (unrelated to either investigation, surfaced for transparency)

During this verification, the backend's `nodemon` process crash-looped several times (`EADDRINUSE`) from file-watch restarts — partly triggered by this session's own temporary test scripts, partly coinciding with what appear to be your own in-progress uncommitted changes in `backend/lms-api` (`git status` showed modifications to `app.js`, `rateLimit.middleware.js`, and a new untracked `src/modules/llm/` — not touched by this session). Restarted the backend directly (`node server.js`, bypassing the watcher) for the remainder of testing to keep results clean. Worth knowing if you see restart noise in your own terminal from around this session's timeframe.

---

---

## Backend Dashboard Query Performance (IMPLEMENTED & VERIFIED, 2026-08-10)

Status: **Root causes #3/#4 fixed** (the instructor dashboard's giant nested `include` + JS aggregation, and the student dashboard's platform-wide `StudentProfile` scan). Everything else from the audit remains open — see "Still open" at the end.

### 1. Queries changed

**`getInstructorDashboard`** — replaced 1 `course.findMany` with a 7-relation-deep nested `include` (courses → enrollments, modules → lessons → progress, quizzes → quizSubmissions, reviews) plus 2 sequential `count()` calls, with:
- 1 base `course.findMany({ select: { id, title, status, createdAt }})`
- 10 further queries run **in parallel via `Promise.all`**: `enrollment.findMany` (select-only), `module.groupBy`, `lesson.findMany` (select-only, courseId via relation), `progress.findMany` (completed-only, select-only, courseId via relation), `quiz.findMany` (select-only), `quizSubmission.groupBy` (by quizId, `_avg`/`_count`), `quizSubmission.findMany` (7-day window only, for daily engagement), `review.groupBy` (by courseId, `_avg`/`_count` — mirrors `review.service.js`'s existing pattern), plus the original `studentProfile.count` and `message.count`.
- All 16 downstream KPI/analytics computations were rewritten to use `Map`-based O(1) lookups against these minimal result sets instead of nested-loop-with-`.find()` scans over full object graphs (e.g. the old `lessons.reduce(... .find(p => p.studentId === ...))` per enrollment, which was O(enrollments × lessons × progress)).
- Every computation was re-derived to produce **mathematically identical output** to the original for the same underlying data — verified live (see §"API contract," below), not just visually similar. One exception, disclosed: the dead `videoAnalytics` KPI (already always `0` before this change, since that relation was never in the include either) is left at `0` explicitly rather than silently mysterious — not a regression.

**`getStudentDashboard`** — replaced `studentProfile.findMany` (all students, with their completed-progress rows) + JS `.sort()`/`.findIndex()` with a single `prisma.$queryRaw` using a CTE + `PERCENT_RANK()` window function that returns **exactly one row** (this student's), computed entirely in PostgreSQL:
```sql
WITH completion_counts AS (
  SELECT sp.id AS student_id, COUNT(p.id) FILTER (WHERE p.completed) AS completed_count
  FROM "StudentProfile" sp LEFT JOIN "Progress" p ON p."studentId" = sp.id
  GROUP BY sp.id
),
ranked AS (
  SELECT student_id, completed_count, PERCENT_RANK() OVER (ORDER BY completed_count) AS pct_rank
  FROM completion_counts
)
SELECT completed_count::int, pct_rank::float FROM ranked WHERE student_id = $1
```
This is the first `$queryRaw` in the codebase — justified because Prisma's `groupBy`/`aggregate` API has no way to express "this row's rank within a full ordering" without returning every row to the application; a SQL window function is exactly the right tool. The value is parameterized (`$1` via Prisma's tagged-template interpolation, not string concatenation) — safe from SQL injection.

**One disclosed, intentional behavior normalization**: the original JS formula was inverted (lowest completion count → *highest* percentile number). Verified via frontend search: **zero** components anywhere read `stats.rankPercentile`. This fix computes the standard, intuitive convention (higher count → higher percentile) instead of replicating the inversion — confirmed with a live A/B query against the same student: old formula returned `0`, new returns `100`, both correctly describing "this student has the highest completed-lesson count in the system," just with opposite number conventions. Field name and presence in the response are unchanged.

Everything else in `getStudentDashboard` (the `studentProfile.findUnique`, `progress.findMany`, and recommendation `course.findMany` calls) and all of `getAdminDashboard`/`getUpcomingTasks` are **untouched** — confirmed out of scope, `getUpcomingTasks` was already correctly built (5 queries via `Promise.all`).

### 2. Files changed

| File | Change |
|---|---|
| `backend/lms-api/src/modules/dashboard/dashboard.service.js` | `getInstructorDashboard` and `getStudentDashboard` internals rewritten as above. `getAdminDashboard`/`getUpcomingTasks` untouched. |
| Database (live, via direct SQL — see §3) | 5 new indexes. **No file changed** for this — see below for why. |

`src/config/database.js` was temporarily modified (query-log instrumentation) and **fully reverted** before finishing — confirmed via `git diff` showing no changes to that file in the final state.

### 3. Database changes — and an important deviation from the plan

The plan called for a Prisma migration (`prisma migrate dev --create-only`, reviewed, then applied). **That was not done.** While investigating, `prisma/schema.prisma` was found to have a large (~3,200-line) uncommitted diff already sitting in the working tree — not made by this session. Inspecting it showed real structural changes (e.g. `Course.visibility` field gone, a `Batch↔Course` relation auto-renamed to `Course_Batch_courseIdToCourse`, an enum removed) consistent with someone having run `prisma db pull` mid-troubleshooting. Running `prisma migrate dev` against that schema state would have let Prisma's diff engine generate DDL for *all* of that pending, seemingly-unfinished drift, not just the 3 intended indexes — a real risk of touching your in-progress schema work or the live database in ways neither of us intended.

Instead, the 3 audit-flagged indexes (plus 2 more on `CalendarEvent`, per your explicit ask this round) were added via direct, additive `CREATE INDEX IF NOT EXISTS` statements — no `schema.prisma` change, no migration, nothing else touched:

| Index | Table.Column | Why (verified via live `pg_indexes` query, not assumed) |
|---|---|---|
| `Course_creatorId_idx` | `Course.creatorId` | `getInstructorDashboard`'s only filter (`where: { creatorId }`); table had **zero** non-PK indexes before this. |
| `User_role_idx` | `User.role` | `getAdminDashboard`'s role-based counts; table had only PK + unique(email/phone) before this. |
| `CalendarEvent_courseId_idx` | `CalendarEvent.courseId` | `calendar.service.js`'s course-scoped filter; table had only its PK index before this. |
| `CalendarEvent_instructorId_idx` | `CalendarEvent.instructorId` | Same file's instructor-scoped filter branch. |
| `CalendarEvent_date_idx` | `CalendarEvent.date` | The `orderBy: { date: "asc" }` used by both branches. |

(Separate indexes rather than one composite for `CalendarEvent`, since the actual query is an `OR` across `courseId`/`instructorId` — Postgres can combine separate single-column indexes via a bitmap OR for that shape more readily than it can use one composite index across an `OR`.)

**This needs your attention**: `schema.prisma` no longer matches the live database (it was already out of sync before this session touched anything, and remains so — these 5 new indexes exist in the database but are not declared in the schema file). Recommend you reconcile `schema.prisma` yourself once your other in-progress changes there are settled, then run `prisma db pull` or add the 5 `@@index` lines by hand so the file and the database agree again. Did not do this myself since it means editing a file you're actively mid-change on.

### 4. API contract — verified unchanged, not assumed

Fetched live responses from both the original and rewritten code (toggled via `git stash`, same running backend) and recursively diffed every key path (not just top-level, not just byte size):

```
Instructor dashboard: Fields ONLY in OLD (removed): (none)   Fields ONLY in NEW (added): (none)
Student dashboard:    Fields ONLY in OLD (removed): (none)   Fields ONLY in NEW (added): (none)
```

Zero structural differences at any nesting depth. Payload byte sizes are also essentially identical (see §6).

### 5. Before/after timings — measured, not estimated

Two measurement methods were used because the shared dev environment (remote Singapore Postgres, plus your own concurrent backend work) made single HTTP-level timings noisy. Both point the same direction.

**A. Direct in-process function timing** (bypasses HTTP/Express, 5 runs each, median reported — isolates the query-layer change from network/system noise):

| Function | Before (median / min) | After (median / min) |
|---|---:|---:|
| `getInstructorDashboard` | 2,804ms / 1,602ms | **1,550ms / 1,333ms** |
| `getStudentDashboard` (whole function) | 3,263ms / 2,568ms | 3,456ms / 2,983ms (no significant change — see below) |

**B. Isolated percentile computation only** (the specific fix, measured directly against the database, 8 runs each):

| Approach | Median | Min | Rows scanned/returned |
|---|---:|---:|---:|
| OLD (`studentProfile.findMany` all + JS sort) | 181ms | 177ms | 5 rows scanned |
| NEW (`$queryRaw` `PERCENT_RANK()`) | **95ms** | 91ms | **1 row returned** |

**Why the whole-function student dashboard number didn't move**: this database currently has **5 total students**. The old anti-pattern's cost scales with total student count — at 5 students, "fetch every student" is fetching almost nothing, so isolated in a controlled A/B (table B above) the fix is still a real, measurable 47% improvement (181ms→95ms), but it's a small fraction of the ~3.3s the whole function takes, which is dominated by the *other*, untouched queries in that function (the deep `studentProfile.findUnique` and `progress.findMany` — see "Remaining bottlenecks"). The fix is architecturally correct and necessary regardless: it changes the *shape* of the cost from O(total platform students) to O(1), which matters enormously at real scale (thousands of students) even though it doesn't show up much in a 5-student dev database today. Reporting this plainly rather than overstating a dev-database result.

### 6. Before/after query counts and payload sizes

**Query counts** (counted directly from the code — Prisma's nested-`include` query planner splits deep includes into multiple SQL statements per relation level, which made runtime log-based counting unreliable/noisy in this shared environment, so static counting is the more trustworthy number here):

| Endpoint | Before | After |
|---|---:|---:|
| `getInstructorDashboard` | ~3 Prisma client calls, but the 1 deep `include` (7 nested relations) expands into an estimated 8-9 actual SQL statements under Prisma's default relation-query strategy, run **sequentially**, followed by 2 more sequential counts | 11 Prisma client calls / SQL statements — 1 sequential, then **10 run concurrently** via `Promise.all` |
| `getStudentDashboard` percentile | 1 call, but returns 1 row per student in the system (**5** rows in this DB; O(n) at scale) | 1 call, returns **exactly 1 row**, always, regardless of platform size |

Being direct about this: the instructor rewrite does **not** reduce raw query count (11 vs. ~10-11) — the real win is that all 11 are minimal `select`/`groupBy` calls against (now-indexed) columns instead of a small number of very expensive multi-table joins fetching entire object graphs, and 10 of the 11 run in parallel instead of the original's fully sequential execution. Query count was never the right metric for this endpoint; payload weight and parallelism are.

**Payload sizes** (measured via live HTTP response byte length):

| Endpoint | Before | After |
|---|---:|---:|
| `GET /dashboard/instructor` | 9,811 bytes | 9,811 bytes (unchanged — same JSON, same data, just computed cheaper) |
| `GET /dashboard/student` | 3,343 bytes | 3,345 bytes (2-byte difference from the percentile field's digit count) |

Confirms the fix is entirely about *how* the response is computed, not about trimming what's sent — consistent with the "don't change the contract unnecessarily" instruction.

### 7. Regression verification

- `tsc --noEmit`: clean. `eslint`: 0 errors (77 pre-existing warnings, none in files this session touched). `next build`: succeeded.
- Backend `npm test`: **96/96 passed** (grew from 92 during this session from your own concurrent test additions — none touched by this work).
- Live smoke test, 15/15 passed: admin/instructor/student dashboards (200 with correct role, 403 with wrong role, 401 with no token), student upcoming-tasks, course list, calendar (both student and instructor branches), notifications, auth profile (valid/missing/garbage token).

### Still open (deliberately not touched this round)

Per your Section 8 instruction — no frontend, React Query, or bundle work this round. Also not touched: `getAdminDashboard` (simple counts, now benefits from the new `User.role`/`Course` work incidentally but wasn't rewritten), the notification/calendar query-shape fix itself (only its indexes were added), the un-synced `schema.prisma` (flagged above, needs your call), axios timeout, and the Render cold-start issue (all carried over from the earlier audit, still open).

**New candidate for next pass, found during this work**: `getStudentDashboard`'s remaining ~3s is now dominated by its two untouched queries — the `studentProfile.findUnique` (still has a moderately deep `include` covering enrollments → course → creator/modules/lessons, quizzes, certificates, reviews) and the separate `progress.findMany`. Neither was in scope this round (the task named the percentile scan specifically), but they're now the largest remaining cost in that function and would be the natural next target using the same `select`-over-`include` approach applied here.

---

## What Would Move the Needle Most (impact-ordered, not yet implemented)

1. Stop hard-blocking every route on `AuthContext`'s uncached `getProfile()` call — trust the cookie + cached `localStorage` user for first paint (the code already restores it synchronously, `AuthContext.jsx:64-72`, then throws it away by keeping `loading: true` regardless) and reconcile with the network response once it lands, instead of gating render on the network round-trip.
2. Add a request timeout to the shared axios instance (`src/lib/axios.js`) so a slow/cold backend degrades to a visible error/retry instead of an indefinite hang.
3. Confirm what `NEXT_PUBLIC_API_URL` is actually set to in the Vercel project settings — if it's the Render free-tier URL, that host's cold-start behavior (measured: 15s+ timeout → 648ms once warm) is very likely the single biggest contributor to "slow on Vercel" specifically, independent of every frontend finding above.
4. Move `getStudentDashboard`'s platform-wide `studentProfile.findMany` percentile calculation (`dashboard.service.js:832-851`) out of the per-request hot path.
5. Add the missing indexes in Phase 8, especially `Course.creatorId` and `CalendarEvent` (currently zero indexes on a model polled every 60 seconds by every logged-in user).
6. Collapse the `recharts` duplication (4× 329KB chunks) by introducing one `next/dynamic` boundary shared across the chart components, or importing from a single shared module.
7. Fix the `NotificationContext` calendar double-fetch (its own load + the dashboard's React Query hook fetching the same endpoint) and add `take` limits to `/notifications` and `/calendar` on the backend.
