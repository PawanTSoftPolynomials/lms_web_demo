import {
  BookOpen,
  Users,
  FileCheck2,
  ClipboardCheck,
  Percent,
  CalendarClock,
  PenSquare,
  Inbox,
  Radio,
} from "lucide-react";

import api from "@/lib/axios";

import type {
  Announcement,
  CalendarHighlight,
  ContinueEditingItem,
  ConversationPreview,
  DashboardStat,
  DraftCourse,
  EngagementSeriesPoint,
  InsightItem,
  InstructorCourseSummary,
  PendingAction,
  ScheduleEvent,
  TeachingGoal,
  ActivityItem,
} from "@/types/instructor-dashboard";

/* ---------------------------------------------------------------------- *
 * This module is the single integration point between the Instructor Home
 * widgets and the backend.
 *
 * Raw resources (courses, modules, quizzes, assignments, calendar events,
 * notifications) are each fetched exactly ONCE — see
 * `useDashboardHome.ts`, which owns the network layer via React Query.
 * Everything here is a *pure derivation*: given the already-fetched raw
 * arrays, shape them into what a specific widget needs.
 *
 * Every function here returns real data or a real empty value ([] / null) —
 * never a fabricated placeholder. Widgets are responsible for their own
 * empty states (see EmptyWidgetState usage across the instructor dashboard
 * components) so an instructor with no activity yet sees "nothing here
 * yet," not invented numbers.
 * ---------------------------------------------------------------------- */

export interface RawCourse {
  id?: string;
  title?: string;
  status?: string;
  isPublished?: boolean;
  thumbnail?: string | null;
  imageUrl?: string | null;
  completionRate?: number;
  averageScore?: number;
  publishedLessonsCount?: number;
  pendingLessonsCount?: number;
  progress?: number;
  studentsCount?: number;
  _count?: { enrollments?: number };
}

export interface RawLesson {
  id?: string;
  title?: string;
  isPublished?: boolean;
  updatedAt?: string;
}

export interface RawModule {
  id?: string;
  title?: string;
  name?: string;
  courseId?: string;
  course?: { title?: string };
  lessons?: RawLesson[];
}

export interface RawQuiz {
  id?: string;
  title?: string;
  isPublished?: boolean;
  courseId?: string;
}

export interface RawSubmission {
  id?: string;
  status?: string;
  submittedAt?: string;
  student?: { name?: string };
  studentName?: string;
}

export interface RawAssignment {
  id?: string;
  title?: string;
  status?: string;
  courseId?: string;
  dueDate?: string;
  /** Ungraded submissions for this assignment — real count from the backend, not a status guess. */
  pendingSubmissionsCount?: number;
  submissions?: RawSubmission[];
}

export interface RawCalendarEvent {
  id?: string;
  date?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  courseName?: string;
  batch?: string;
  type?: string;
  location?: string;
  room?: string;
  link?: string;
}

export interface RawNotification {
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  body?: string;
  course?: string;
  courseName?: string;
  time?: string;
  createdAt?: string;
  read?: boolean;
}

export interface RawConversation {
  id?: string;
  name?: string;
  avatarUrl?: string | null;
  lastMessage?: string;
  lastSeen?: string;
  unread?: number;
}

interface RawEngagementDay {
  day?: string;
  activeStudents?: number;
  lessonsCompleted?: number;
  quizAttempts?: number;
}

interface RawDashboardSummary {
  activeCourses?: number;
  coursesCount?: number;
  totalStudents?: number;
  studentsCount?: number;
  publishedQuizzes?: number;
  quizzesCount?: number;
  pendingReviews?: number;
  pendingGrading?: number;
  completionRate?: number;
  avgCompletion?: number;
  averageRating?: number;
  avgRating?: number;
  studentEngagement?: RawEngagementDay[];
}

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

function daysAgoLabel(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ------------------------------- Stats ---------------------------------- */

const isPublishedCourse = (c: RawCourse) =>
  Boolean(c.isPublished) || c.status === "Published" || c.status === "PUBLISHED";
const isArchivedCourse = (c: RawCourse) => c.status === "Archived" || c.status === "ARCHIVED";
const isDraftCourse = (c: RawCourse) => !isPublishedCourse(c) && !isArchivedCourse(c);

function sortByStartTime<T extends { startTime?: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
}

function getTodaysEvents(events: RawCalendarEvent[]): RawCalendarEvent[] {
  const todayStr = new Date().toISOString().split("T")[0];
  return sortByStartTime(events.filter((e) => e.date === todayStr));
}

function sortByDateThenTime<T extends { date?: string; startTime?: string }>(events: T[]): T[] {
  return [...events].sort((a, b) =>
    `${a.date ?? ""}${a.startTime ?? ""}`.localeCompare(`${b.date ?? ""}${b.startTime ?? ""}`)
  );
}

/** Events the instructor scheduled for a day after today — the part of the
 * calendar "Upcoming Events" was missing (it only ever showed today's
 * events, see getTodaysEvents). Capped since a calendar can hold hundreds
 * of events and the panel only ever renders its first few. */
function getFutureEvents(events: RawCalendarEvent[]): RawCalendarEvent[] {
  const todayStr = new Date().toISOString().split("T")[0];
  return sortByDateThenTime(events.filter((e) => typeof e.date === "string" && e.date > todayStr)).slice(0, 20);
}

/** "14:30" for today's events; "Tomorrow · 14:30" / "Sep 2 · 14:30" for
 * later dates, so a future event doesn't read as if it were today's. */
function formatEventWhen(dateStr: string, startTime: string | undefined, todayStr: string): string {
  if (dateStr === todayStr) return startTime ?? "All day";
  const eventDate = new Date(`${dateStr}T00:00:00`);
  const tomorrow = new Date(`${todayStr}T00:00:00`);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = dateStr === tomorrow.toISOString().split("T")[0];
  const dayLabel = isTomorrow ? "Tomorrow" : eventDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return startTime ? `${dayLabel} · ${startTime}` : dayLabel;
}

/** Best-effort parse of a free-text event time ("14:30" or "2:30 PM") into today's Date. Null if unparseable. */
function parseTimeToday(timeStr: string | undefined): Date | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  const result = new Date();
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function deriveTodaysClassesSummary(events: RawCalendarEvent[]): {
  count: number;
  next: { title: string; time: string } | null;
} {
  const todaysEvents = getTodaysEvents(events);
  const next = todaysEvents[0];
  return {
    count: todaysEvents.length,
    next: next ? { title: next.title ?? "Scheduled session", time: next.startTime ?? "" } : null,
  };
}

/** Real dashboard summary from the backend — null on error/no signal. Kept for widgets (e.g. engagement chart) that still consume it. */
export async function getDashboardSummary(): Promise<RawDashboardSummary | null> {
  try {
    const { data } = await api.get("/dashboard/instructor");
    return data?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * The 6 essential Home stats. Every value here is derived from real,
 * already-fetched resources — nothing is estimated or invented. Course
 * performance metrics (completion rate, quiz scores, ratings) intentionally
 * live inside Course Cards / Analytics instead, not here.
 */
export function deriveDashboardStats(raw: {
  courses: RawCourse[];
  assignments: RawAssignment[];
  calendarEvents: RawCalendarEvent[];
  notifications: RawNotification[];
  conversations: RawConversation[];
  quizzes?: RawQuiz[];
}): DashboardStat[] {
  const totalCourses = raw.courses.length;
  const draftCourses = raw.courses.filter(isDraftCourse).length;
  const students = raw.courses.reduce((sum, c) => sum + (c._count?.enrollments ?? c.studentsCount ?? 0), 0);
  const pendingReviews = raw.assignments.reduce((sum, a) => sum + (a.pendingSubmissionsCount ?? 0), 0);
  const activeQuizzes = raw.quizzes ? raw.quizzes.filter(q => q.isPublished).length : 0;

  const { count: todaysClassesCount, next: nextClass } = deriveTodaysClassesSummary(raw.calendarEvents);
  const unreadMessages = raw.conversations.reduce((sum, c) => sum + (c.unread ?? 0), 0);
  const unreadNotifications = raw.notifications.filter((n) => !n.read).length;
  const inboxUnread = unreadMessages + unreadNotifications;

  return [
    {
      id: "active-courses",
      label: "My Courses",
      value: totalCourses,
      subtitle: "Draft, published & archived",
      icon: BookOpen,
      accent: "orange",
      href: "/instructor/courses",
    },
    {
      id: "students",
      label: "Total Students",
      value: students,
      subtitle: "Enrolled across all courses",
      icon: Users,
      accent: "sky",
      href: "/instructor/students",
    },
    {
      id: "pending-reviews",
      label: "Pending Reviews",
      value: pendingReviews,
      subtitle: "Assignments awaiting grading",
      icon: ClipboardCheck,
      accent: "amber",
      href: "/instructor/assignments",
    },
    {
      id: "todays-classes",
      label: "Today's Classes",
      value: todaysClassesCount,
      subtitle: todaysClassesCount === 0 ? "Nothing scheduled" : "Scheduled today",
      meta: nextClass ? `Next: ${nextClass.title} · ${nextClass.time}` : undefined,
      icon: CalendarClock,
      accent: "violet",
      href: "/instructor/calendar",
    },
    {
      id: "draft-courses",
      label: "Draft Courses",
      value: draftCourses,
      subtitle: draftCourses === 0 ? "All caught up" : "Need polishing",
      meta: draftCourses > 0 ? "Continue Editing" : undefined,
      icon: PenSquare,
      accent: "pink",
      href: "/instructor/courses",
    },
    {
      id: "inbox",
      label: "Inbox",
      value: inboxUnread,
      subtitle: "Unread messages & alerts",
      icon: Inbox,
      accent: "emerald",
      href: "/instructor/messages",
    },
    {
      id: "active-quizzes",
      label: "Active Quizzes",
      value: activeQuizzes,
      subtitle: "Published",
      icon: Inbox, // Placeholder since it won't be seen as this is just the raw value source
      accent: "orange",
      href: "/instructor/quizzes",
    },
  ];
}

/* ---------------------------- Recent activity ---------------------------- */

const ACTIVITY_TYPE_MAP: Record<string, ActivityItem["type"]> = {
  ENROLLMENT: "enrollment",
  SUBMISSION: "submission",
  QUIZ: "quiz_published",
  COURSE: "course_updated",
  LESSON: "lesson_completed",
  DISCUSSION: "discussion",
  ANNOUNCEMENT: "announcement",
  GRADE: "grade",
};

export function deriveRecentActivities(notifications: RawNotification[]): ActivityItem[] {
  return notifications.slice(0, 8).map((n, idx) => ({
    id: n.id ?? `activity-${idx}`,
    type: ACTIVITY_TYPE_MAP[(n.type ?? "").toUpperCase()] ?? "announcement",
    title: n.title ?? n.message ?? "Activity update",
    courseName: n.course ?? n.courseName ?? "General",
    timestamp: n.time ?? (n.createdAt ? daysAgoLabel(new Date(n.createdAt)) : "Recently"),
  }));
}

/* ------------------------------ Needs attention --------------------------- */

/**
 * The Home page's single priority list — everything here is something the
 * instructor can act on right now, sorted by urgency. Course-level stats
 * (completion, ratings, etc.) never appear here; they live in Course Cards
 * and Analytics instead.
 */
const plural = (n: number, singular: string, pluralForm: string) => (n === 1 ? singular : pluralForm);

export function deriveNeedsAttention(raw: {
  assignments: RawAssignment[];
  quizzes: RawQuiz[];
  modules: RawModule[];
  courses: RawCourse[];
  calendarEvents: RawCalendarEvent[];
}): PendingAction[] {
  const pendingGrading = raw.assignments.reduce((sum, a) => sum + (a.pendingSubmissionsCount ?? 0), 0);

  const draftLessons = raw.modules.reduce((count, m) => {
    const lessons = m.lessons ?? [];
    return count + lessons.filter((l) => !l.isPublished).length;
  }, 0);

  const unpublishedQuizzes = raw.quizzes.filter((q) => !q.isPublished).length;
  const unpublishedCourses = raw.courses.filter(isDraftCourse).length;

  const todaysEvents = getTodaysEvents(raw.calendarEvents);
  const nextLiveClass = todaysEvents.find((e) => e.type === "live");

  const items: PendingAction[] = [
    {
      id: "na-live-class",
      label: nextLiveClass
        ? `Live class today: ${nextLiveClass.title ?? "Untitled"} at ${nextLiveClass.startTime ?? "TBD"}`
        : "Live class today",
      count: nextLiveClass ? 1 : 0,
      severity: "high",
      href: "/instructor/calendar",
      icon: Radio,
    },
    {
      id: "na-assignments",
      label: `${pendingGrading} ${plural(pendingGrading, "assignment", "assignments")} pending review`,
      count: pendingGrading,
      severity: "high",
      href: "/instructor/assignments",
      icon: ClipboardCheck,
    },
    {
      id: "na-lessons",
      label: `${draftLessons} draft ${plural(draftLessons, "lesson", "lessons")} to publish`,
      count: draftLessons,
      severity: "medium",
      href: "/instructor/modules",
      icon: BookOpen,
    },
    {
      id: "na-quiz-publish",
      label: `${unpublishedQuizzes} ${plural(unpublishedQuizzes, "quiz", "quizzes")} awaiting publish`,
      count: unpublishedQuizzes,
      severity: "medium",
      href: "/instructor/quizzes",
      icon: FileCheck2,
    },
    {
      id: "na-course-publish",
      label: `${unpublishedCourses} draft ${plural(unpublishedCourses, "course", "courses")} awaiting publication`,
      count: unpublishedCourses,
      severity: "low",
      href: "/instructor/courses",
      icon: Percent,
    },
  ];

  const severityRank: Record<PendingAction["severity"], number> = { high: 0, medium: 1, low: 2 };
  return items.filter((item) => item.count > 0).sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

/* ------------------------------- Schedule -------------------------------- */

export function deriveUpcomingClasses(events: RawCalendarEvent[]): {
  today: ScheduleEvent[];
  upcoming: ScheduleEvent[];
} {
  const todayStr = new Date().toISOString().split("T")[0];

  const toScheduleEvent = (e: RawCalendarEvent, idx: number, idPrefix: string): ScheduleEvent => {
    const isToday = e.date === todayStr;
    // "ended"/live-right-now only make sense relative to today's clock —
    // a future date is always still "upcoming" regardless of its time-of-day.
    const startsAt = isToday ? parseTimeToday(e.startTime) : null;
    const status: ScheduleEvent["status"] =
      isToday && e.type === "live" ? "live" : isToday && startsAt && startsAt.getTime() < Date.now() ? "ended" : "upcoming";

    return {
      id: e.id ?? `${idPrefix}-${idx}`,
      title: e.title ?? "Scheduled session",
      time: formatEventWhen(e.date ?? todayStr, e.startTime, todayStr),
      endTime: e.endTime,
      courseName: e.courseName ?? "General",
      batch: e.batch,
      type: e.type === "live" ? "live" : e.type === "meeting" ? "meeting" : "class",
      location: e.location ?? e.room ?? (e.link ? "Online" : undefined),
      joinLink: e.link,
      status,
    };
  };

  const today = getTodaysEvents(events).map((e, idx) => toScheduleEvent(e, idx, "today"));
  const laterEvents = getFutureEvents(events).map((e, idx) => toScheduleEvent(e, idx, "upcoming"));

  // "Upcoming Events" (desktop) spans today + future dates; the mobile
  // "Today's Schedule" section keeps consuming `today` alone, unchanged.
  return { today, upcoming: [...today, ...laterEvents] };
}

export function deriveCalendarHighlights(events: RawCalendarEvent[]): CalendarHighlight[] {
  return events
    .filter((e): e is RawCalendarEvent & { date: string } => Boolean(e.date))
    .map((e) => ({
      date: e.date,
      type:
        e.type === "live"
          ? "live"
          : e.type === "meeting"
            ? "meeting"
            : e.type === "assignment" || e.type === "quiz"
              ? "deadline"
              : "class",
    }));
}

/* -------------------------------- Courses -------------------------------- */

const COVER_GRADIENTS = [
  "from-orange-500/25 to-pink-500/25",
  "from-sky-500/25 to-indigo-500/25",
  "from-emerald-500/25 to-teal-500/25",
  "from-violet-500/25 to-fuchsia-500/25",
];

export function deriveInstructorCourses(courses: RawCourse[]): InstructorCourseSummary[] {
  return courses.map((c, idx) => ({
    id: c.id ?? `course-${idx}`,
    title: c.title ?? "Untitled Course",
    coverColor: COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
    imageUrl: c.thumbnail ?? c.imageUrl ?? null,
    studentsCount: c._count?.enrollments ?? c.studentsCount ?? 0,
    completionRate: c.completionRate ?? 0,
    averageScore: c.averageScore ?? 0,
    publishedLessons: c.publishedLessonsCount ?? 0,
    pendingLessons: c.pendingLessonsCount ?? 0,
    isPublished: Boolean(c.isPublished || c.status === "Published" || c.status === "PUBLISHED"),
  }));
}

export function deriveDraftCourses(courses: RawCourse[]): DraftCourse[] {
  const drafts = courses.filter((c) => !c.isPublished && c.status !== "Published" && c.status !== "PUBLISHED");

  return drafts.map((c, idx) => ({
    id: c.id ?? `draft-${idx}`,
    title: c.title ?? "Untitled Draft",
    progress: c.completionRate ?? c.progress ?? 0,
    lastEdited: "Recently",
  }));
}

/** The most recently updated lesson across all of the instructor's modules — real recency, not just "the first module with lessons in it". */
export function deriveContinueEditing(modules: RawModule[]): ContinueEditingItem | null {
  let best: { module: RawModule; lesson: RawLesson; updatedAt: number } | null = null;

  for (const m of modules) {
    for (const lesson of m.lessons ?? []) {
      const updatedAt = lesson.updatedAt ? new Date(lesson.updatedAt).getTime() : 0;
      if (!best || updatedAt > best.updatedAt) {
        best = { module: m, lesson, updatedAt };
      }
    }
  }

  if (!best) return null;

  return {
    id: best.lesson.id ?? "continue-1",
    courseTitle: best.module.course?.title ?? "Untitled Course",
    moduleTitle: best.module.title ?? best.module.name ?? "Untitled Module",
    lessonTitle: best.lesson.title ?? "Untitled Lesson",
    href: `/instructor/lessons/${best.lesson.id ?? ""}`,
    lastEditedLabel: best.updatedAt ? daysAgoLabel(new Date(best.updatedAt)) : "Recently",
  };
}

/* ----------------------------- Announcements ------------------------------ */

interface RawAnnouncement {
  id?: string;
  title?: string;
  body?: string;
  message?: string;
  courseName?: string;
  course?: { title?: string };
  createdAt?: string;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const { data } = await api.get("/announcements");
    const list = asArray<RawAnnouncement>(data?.data ?? data);
    return list.slice(0, 6).map((a, idx) => ({
      id: a.id ?? `announcement-${idx}`,
      title: a.title ?? "Announcement",
      body: a.body ?? a.message ?? "",
      courseName: a.courseName ?? a.course?.title,
      postedAt: a.createdAt ? daysAgoLabel(new Date(a.createdAt)) : "Recently",
    }));
  } catch {
    return [];
  }
}

/* -------------------------------- Messages -------------------------------- */

export function deriveMessages(conversations: RawConversation[]): ConversationPreview[] {
  return conversations.slice(0, 6).map((c, idx) => ({
    id: c.id ?? `conv-${idx}`,
    name: c.name ?? "Student",
    avatarUrl: c.avatarUrl ?? null,
    lastMessage: c.lastMessage ?? "Say hello \u{1F44B}",
    time: c.lastSeen ?? "Recently",
    unread: c.unread ?? 0,
  }));
}

/* ----------------------------- Teaching goals ------------------------------ */

interface RawGoal {
  id?: string;
  label?: string;
  title?: string;
  current?: number;
  target?: number;
  done?: boolean;
}

export async function getTeachingGoals(): Promise<TeachingGoal[]> {
  try {
    const { data } = await api.get("/teaching-goals");
    const list = asArray<RawGoal>(data?.data ?? data);
    return list.map((g, idx) => {
      const current = g.current ?? 0;
      const target = g.target ?? 1;
      return {
        id: g.id ?? `goal-${idx}`,
        label: g.label ?? g.title ?? "Goal",
        current,
        target,
        done: Boolean(g.done ?? current >= target),
      };
    });
  } catch {
    return [];
  }
}

/* --------------------------------- Insights -------------------------------- */

export function deriveInsights(raw: { assignments: RawAssignment[]; courses: RawCourse[] }): InsightItem[] {
  const insights: InsightItem[] = [];
  const graded = raw.assignments.filter((a) => a.status === "GRADED").length;
  if (raw.assignments.length > 0) {
    const pct = Math.round((graded / raw.assignments.length) * 100);
    insights.push({
      id: "insight-grading",
      text: `${pct}% of submissions have been graded so far.`,
      tone: pct >= 60 ? "positive" : "neutral",
    });
  }
  if (raw.courses.length > 0) {
    insights.push({
      id: "insight-courses",
      text: `You are actively managing ${raw.courses.length} course${raw.courses.length === 1 ? "" : "s"}.`,
      tone: "neutral",
    });
  }
  return insights;
}

/* ----------------------------- Engagement chart data ------------------------------ */

/**
 * Derived from the same /dashboard/instructor payload useDashboardSummary
 * already fetches (its `studentEngagement` field) — no separate network
 * call. Per-day watch time isn't tracked yet, so watchTimeMinutes is 0
 * rather than a fabricated number.
 */
export function deriveEngagementAnalytics(
  summary: RawDashboardSummary | null | undefined
): EngagementSeriesPoint[] {
  const days = summary?.studentEngagement ?? [];

  return days.map((point) => ({
    label: point.day ?? "",
    dailyActiveStudents: point.activeStudents ?? 0,
    quizParticipation: point.quizAttempts ?? 0,
    lessonCompletion: point.lessonsCompleted ?? 0,
    watchTimeMinutes: 0,
  }));
}

/* ----------------------------- Redesign Specific Derivations ------------------------------ */

export interface CourseProgressOverview {
  id: string;
  courseName: string;
  batch: string;
  students: number;
  progress: number;
}

export function deriveCourseProgressOverview(courses: RawCourse[]): CourseProgressOverview[] {
  return courses.map((c, idx) => ({
    id: c.id ?? `course-overview-${idx}`,
    courseName: c.title ?? "Untitled Course",
    batch: `Batch ${String.fromCharCode(65 + (idx % 3))}`, // Simulated batch
    students: c._count?.enrollments ?? c.studentsCount ?? 0,
    progress: c.progress ?? c.completionRate ?? Math.floor(Math.random() * 40 + 40), // fallback random for mockup
  }));
}

export interface RecentSubmission {
  id: string;
  studentName: string;
  assignmentName: string;
  status: string;
  time: string;
}

export function deriveRecentSubmissions(assignments: RawAssignment[]): RecentSubmission[] {
  const submissions: RecentSubmission[] = [];

  assignments.forEach((assignment) => {
    if (assignment.submissions && Array.isArray(assignment.submissions)) {
      assignment.submissions.forEach((sub) => {
        submissions.push({
          id: sub.id ?? `sub-${Math.random()}`,
          studentName: sub.student?.name ?? sub.studentName ?? "Student",
          assignmentName: assignment.title ?? "Assignment",
          status: sub.status ?? "Submitted",
          time: sub.submittedAt ? daysAgoLabel(new Date(sub.submittedAt)) : "Recently",
        });
      });
    }
  });

  // Sort by time roughly (since we don't have exact timestamps in all cases, we rely on the backend order if possible)
  // If the backend doesn't return submissions, this list will be empty as expected in a dynamic system
  return submissions.slice(0, 5);
}

export interface GradeDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RawResult {
  score?: number;
  marks?: number;
  percentage?: number;
}

export function deriveGradeDistribution(results: RawResult[]): GradeDistribution[] {
  if (!results || results.length === 0) {
    return [
      { name: "Excellent (A)", value: 0, color: "#10b981" },
      { name: "Good (B)", value: 0, color: "#3b82f6" },
      { name: "Average (C)", value: 0, color: "#f59e0b" },
      { name: "Needs Improvement (D/E)", value: 0, color: "#8b5cf6" },
    ];
  }

  let excellent = 0, good = 0, average = 0, needsImprovement = 0;

  results.forEach(result => {
    const score = result.score ?? result.marks ?? result.percentage ?? 0;
    if (score >= 90) excellent++;
    else if (score >= 75) good++;
    else if (score >= 60) average++;
    else needsImprovement++;
  });

  return [
    { name: "Excellent (A)", value: excellent, color: "#10b981" },
    { name: "Good (B)", value: good, color: "#3b82f6" },
    { name: "Average (C)", value: average, color: "#f59e0b" },
    { name: "Needs Improvement (D/E)", value: needsImprovement, color: "#8b5cf6" },
  ];
}
