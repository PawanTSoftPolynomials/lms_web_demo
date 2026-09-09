/**
 * Responsive / affordance smoke test.
 *
 * Renders app routes at mobile, tablet and desktop widths against a fully
 * stubbed API and reports, per viewport:
 *   - horizontal page overflow (and which element causes it)
 *   - tap targets under 32px on phone widths
 *   - console errors
 * plus a full-page screenshot of each route.
 *
 * Every request that leaves the Next origin is fulfilled from the fixtures
 * below, so this never contacts the real API or the shared team database, and
 * no credentials are involved -- the cookies it sets are inert strings that
 * only satisfy the presence check in src/middleware.js.
 *
 *   npm run dev                       # in another terminal
 *   npx playwright install chromium   # once
 *   node scripts/ui-smoke.js INSTRUCTOR ./ui-shots /instructor/dashboard:home
 *
 * Args: <ROLE> <outDir> <route[:screenshot-name]>...
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:3000";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "tablet", width: 768, height: 1024, isMobile: false },
  { name: "desktop", width: 1440, height: 900, isMobile: false },
];

const USER = {
  INSTRUCTOR: { id: "ui_instr", name: "Ayan Kulkarni", email: "ayan@example.com", role: "INSTRUCTOR" },
  ADMIN: { id: "ui_admin", name: "Ayan Kulkarni", email: "ayan@example.com", role: "ADMIN" },
};

const iso = (d) => new Date(Date.now() + d * 86400000).toISOString();

const COURSES = [
  { id: "c1", title: "Data Structures in Python", status: "PUBLISHED", isPublished: true, level: "Intermediate", category: "Computer Science", thumbnailUrl: null, updatedAt: iso(-1), _count: { enrollments: 128, lessons: 24 }, stats: { lessonsCount: 24 }, completionRate: 62, averageScore: 74, publishedLessonsCount: 20, pendingLessonsCount: 4 },
  { id: "c2", title: "Applied Statistics for Analysts", status: "PUBLISHED", isPublished: true, level: "Beginner", category: "Mathematics", thumbnailUrl: null, updatedAt: iso(-3), _count: { enrollments: 86, lessons: 18 }, stats: { lessonsCount: 18 }, completionRate: 48, averageScore: 68, publishedLessonsCount: 15, pendingLessonsCount: 3 },
  { id: "c3", title: "Systems Design Fundamentals", status: "DRAFT", isPublished: false, level: "Advanced", category: "Engineering", thumbnailUrl: null, updatedAt: iso(-6), _count: { enrollments: 0, lessons: 9 }, stats: { lessonsCount: 9 }, completionRate: 0, averageScore: 0, publishedLessonsCount: 0, pendingLessonsCount: 9 },
  { id: "c4", title: "Introduction to Machine Learning", status: "DRAFT", isPublished: false, level: "Intermediate", category: "Computer Science", thumbnailUrl: null, updatedAt: iso(-9), _count: { enrollments: 12, lessons: 14 }, stats: { lessonsCount: 14 }, completionRate: 11, averageScore: 55, publishedLessonsCount: 2, pendingLessonsCount: 12 },
];

const MODULES = [
  { id: "m1", title: "Trees and Graphs", courseId: "c1", course: { title: "Data Structures in Python" }, lessons: [
    { id: "l1", title: "Binary search trees", isPublished: true, updatedAt: iso(-0.2) },
    { id: "l2", title: "Balanced trees and rotations", isPublished: false, updatedAt: iso(-2) },
    { id: "l3", title: "Graph traversal: BFS and DFS", isPublished: false, updatedAt: iso(-4) },
  ]},
  { id: "m2", title: "Distributions", courseId: "c2", course: { title: "Applied Statistics for Analysts" }, lessons: [
    { id: "l4", title: "The normal distribution", isPublished: true, updatedAt: iso(-5) },
    { id: "l5", title: "Hypothesis testing in practice", isPublished: false, updatedAt: iso(-7) },
  ]},
];

const ASSIGNMENTS = [
  { id: "a1", title: "Tree traversal exercise", courseId: "c1", status: "SUBMITTED", pendingSubmissionsCount: 7, dueDate: iso(2), submissions: [
    { id: "s1", studentName: "Priya Sharma", student: { name: "Priya Sharma" }, status: "PENDING", submittedAt: iso(-0.1) },
    { id: "s2", studentName: "Arjun Mehta", student: { name: "Arjun Mehta" }, status: "PENDING", submittedAt: iso(-0.4) },
  ]},
  { id: "a2", title: "Confidence intervals worksheet", courseId: "c2", status: "GRADED", pendingSubmissionsCount: 3, dueDate: iso(5), submissions: [
    { id: "s3", studentName: "Neha Iyer", student: { name: "Neha Iyer" }, status: "GRADED", submittedAt: iso(-1.2) },
  ]},
  { id: "a3", title: "Design a URL shortener", courseId: "c3", status: "SUBMITTED", pendingSubmissionsCount: 2, dueDate: iso(-1), submissions: [
    { id: "s4", studentName: "Rahul Verma", student: { name: "Rahul Verma" }, status: "LATE", submittedAt: iso(-2.5) },
  ]},
];

const QUIZZES = [
  { id: "q1", title: "Week 3 quiz: Trees", isPublished: false, courseId: "c1" },
  { id: "q2", title: "Week 4 quiz: Graphs", isPublished: false, courseId: "c1" },
  { id: "q3", title: "Stats midterm", isPublished: true, courseId: "c2" },
];

const NOTIFICATIONS = [
  { id: "n1", type: "SUBMISSION", title: "Priya Sharma submitted Tree traversal exercise", course: "Data Structures in Python", read: false, createdAt: iso(-0.1) },
  { id: "n2", type: "QUIZ", title: "Stats midterm closed with 42 attempts", course: "Applied Statistics for Analysts", read: false, createdAt: iso(-0.6) },
  { id: "n3", type: "ENROLLMENT", title: "9 new students enrolled this week", course: "Data Structures in Python", read: true, createdAt: iso(-1.4) },
  { id: "n4", type: "DISCUSSION", title: "New question in Graph traversal thread", course: "Data Structures in Python", read: true, createdAt: iso(-2.2) },
];

const todayStr = new Date().toISOString().split("T")[0];
const CALENDAR = [
  { id: "e1", title: "Live: Graph algorithms walkthrough", type: "live", date: todayStr, startTime: "17:30", endTime: "18:30", courseName: "Data Structures in Python", joinLink: "https://example.com/live" },
  { id: "e2", title: "Office hours", type: "meeting", date: todayStr, startTime: "19:00", endTime: "19:30", courseName: "General" },
];

const RESULTS = [
  { id: "r1", score: 92, total: 100 }, { id: "r2", score: 81, total: 100 },
  { id: "r3", score: 74, total: 100 }, { id: "r4", score: 63, total: 100 },
  { id: "r5", score: 55, total: 100 }, { id: "r6", score: 88, total: 100 },
];

const SUMMARY = {
  studentEngagement: [
    { day: "Mon", activeStudents: 42, quizAttempts: 12, lessonsCompleted: 30 },
    { day: "Tue", activeStudents: 51, quizAttempts: 18, lessonsCompleted: 44 },
    { day: "Wed", activeStudents: 38, quizAttempts: 9, lessonsCompleted: 27 },
    { day: "Thu", activeStudents: 60, quizAttempts: 22, lessonsCompleted: 51 },
    { day: "Fri", activeStudents: 47, quizAttempts: 15, lessonsCompleted: 39 },
  ],
  totalUsers: 1240, totalCourses: 48, totalRevenue: 284000, activeEnrollments: 892,
};

function fixtureFor(pathname, search, role) {
  const p = pathname.replace(/\/+$/, "") || "/";
  const wrap = (data, extra) => ({ success: true, data, ...(extra || {}) });

  if (p.endsWith("/auth/profile") || p.endsWith("/auth/me")) return wrap(USER[role]);
  if (p.endsWith("/courses/stats/mine")) return wrap({ total: 4, published: 2, draft: 2, archived: 0, students: 226, activeQuizzes: 1 });
  if (/\/courses\/[^/]+\/batches$/.test(p)) return wrap([]);
  if (p.endsWith("/courses/batches/mine")) return wrap([]);
  if (/\/courses\/[^/]+$/.test(p)) {
    const id = p.split("/").pop();
    const c = COURSES.find((x) => x.id === id) || COURSES[0];
    return wrap({ ...c, modules: MODULES.filter((m) => m.courseId === c.id), description: "Fixture course.", creator: { id: "ui_instr", name: "Ayan Kulkarni" } });
  }
  if (/\/modules\/[^/]+$/.test(p)) return wrap(MODULES[0]);
  if (/\/lessons\/[^/]+$/.test(p)) return wrap({ id: "l1", title: "Binary search trees", topics: [], module: MODULES[0] });
  if (p.endsWith("/courses")) return wrap(COURSES, { pagination: { page: 1, limit: 10, total: COURSES.length, totalPages: 1 } });
  if (p.endsWith("/modules")) return wrap(MODULES);
  if (p.endsWith("/quizzes")) return wrap(QUIZZES);
  if (p.endsWith("/assignments")) return wrap(ASSIGNMENTS);
  if (p.endsWith("/calendar")) return wrap(CALENDAR);
  if (p.endsWith("/notifications")) return wrap(NOTIFICATIONS);
  if (p.endsWith("/conversations")) return wrap([{ id: "cv1", name: "Priya Sharma", unread: 2, lastMessage: "Thanks!" }]);
  if (p.endsWith("/results")) return wrap(RESULTS);
  if (p.endsWith("/dashboard/instructor") || p.endsWith("/dashboard/admin")) return wrap(SUMMARY);
  if (p.endsWith("/announcements")) return wrap([]);
  if (p.endsWith("/teaching-goals")) return wrap([]);
  if (p.endsWith("/users")) return wrap([], { pagination: { total: 0 } });
  return wrap([]);
}

async function main() {
  const [role, outDir, ...routeArgs] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });

  const routes = routeArgs.map((r) => {
    const i = r.lastIndexOf(":");
    return i > 0 ? { path: r.slice(0, i), name: r.slice(i + 1) } : { path: r, name: r.replace(/\W+/g, "_") };
  });

  const browser = await chromium.launch();
  const report = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: 1,
    });

    // Inert cookies — Next middleware checks presence only.
    await context.addCookies([
      { name: "accessToken", value: "ui-test-stub", url: BASE },
      { name: "role", value: role, url: BASE },
    ]);
    await context.addInitScript((u) => {
      try { localStorage.setItem("user", JSON.stringify(u)); } catch (e) {}
    }, USER[role]);

    // Stub every off-origin request (the API).
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === BASE) return route.continue();
      if (!/^https?:$/.test(url.protocol)) return route.continue();
      const body = fixtureFor(url.pathname, url.search, role);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" },
        body: JSON.stringify(body),
      });
    });

    const page = await context.newPage();
    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);
    const consoleErrors = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 240)); });
    page.on("pageerror", (e) => consoleErrors.push("PAGEERROR: " + String(e).slice(0, 240)));

    for (const r of routes) {
      consoleErrors.length = 0;
      try {
        await page.goto(`${BASE}${r.path}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(5000);

        const metrics = await page.evaluate(() => {
          const de = document.documentElement;
          const vw = de.clientWidth;
          const offenders = [];
          const smallTargets = [];

          document.querySelectorAll("*").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.right > vw + 2) {
              let p = el.parentElement, contained = false;
              while (p) {
                if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowX)) { contained = true; break; }
                p = p.parentElement;
              }
              if (!contained) offenders.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || "").slice(0, 110), right: Math.round(rect.right), w: Math.round(rect.width) });
            }
          });

          if (window.innerWidth < 500) {
            document.querySelectorAll("a,button,[role=button],input,select").forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) return;
              if (getComputedStyle(el).visibility === "hidden") return;
              if (r.height < 32 || r.width < 32) {
                smallTargets.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || "").trim().slice(0, 34), w: Math.round(r.width), h: Math.round(r.height) });
              }
            });
          }

          return { scrollWidth: de.scrollWidth, clientWidth: vw, offenders: offenders.slice(0, 10), smallTargets: smallTargets.slice(0, 14) };
        });

        const file = path.join(outDir, `${r.name}__${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: true });

        report.push({
          viewport: vp.name, route: r.path, url: page.url(),
          overflow: metrics.scrollWidth > metrics.clientWidth + 2,
          scrollWidth: metrics.scrollWidth, clientWidth: metrics.clientWidth,
          offenders: metrics.offenders, smallTargets: metrics.smallTargets,
          consoleErrors: [...consoleErrors].slice(0, 6), screenshot: file,
        });
      } catch (e) {
        report.push({ viewport: vp.name, route: r.path, error: String(e).slice(0, 220) });
      }
    }

    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

  for (const r of report) {
    if (r.error) { console.log(`[${r.viewport}] ${r.route} -> ERROR ${r.error}`); continue; }
    console.log(`[${r.viewport}] ${r.route} -> ${r.overflow ? `OVERFLOW ${r.scrollWidth}>${r.clientWidth}` : "no-overflow"}`);
    for (const o of r.offenders) console.log(`    overflow <${o.tag}> right=${o.right} w=${o.w} "${o.cls}"`);
    for (const t of r.smallTargets) console.log(`    small-tap <${t.tag}> ${t.w}x${t.h} "${t.text}"`);
    for (const c of r.consoleErrors) console.log(`    console: ${c}`);
  }
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
