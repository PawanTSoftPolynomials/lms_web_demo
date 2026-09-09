import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { defaultQueryOptions } from "@/lib/queryOptions";
import {
  createTeachingGoal,
  deleteTeachingGoal,
  updateTeachingGoal,
  type CreateGoalPayload,
  type UpdateGoalPayload,
} from "@/services/instructor/teachingGoals.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getCourses, getCourseStatusCounts } from "@/services/course.service";
import { getModules } from "@/services/module.service";
import { getQuizzes } from "@/services/quiz.service";
import { getAssignments } from "@/services/assignment.service";
import { getCalendarEvents } from "@/services/calendar.service";
import { getNotifications as getRawNotifications } from "@/services/notification.service";
import { getConversations } from "@/features/chat/api/chat.api";
import {
  deriveCalendarHighlights,
  deriveContinueEditing,
  deriveDashboardStats,
  deriveDraftCourses,
  deriveEngagementAnalytics,
  deriveInsights,
  deriveInstructorCourses,
  deriveMessages,
  deriveNeedsAttention,
  deriveRecentActivities,
  deriveUpcomingClasses,
  deriveCourseProgressOverview,
  deriveRecentSubmissions,
  deriveGradeDistribution,
  getAnnouncements,
  getDashboardSummary,
  getTeachingGoals,
  type RawAssignment,
  type RawCalendarEvent,
  type RawConversation,
  type RawCourse,
  type RawModule,
  type RawNotification,
  type RawQuiz,
  type RawResult,
} from "@/services/instructor/dashboardHome.service";

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

/* ----------------------------------------------------------------------- *
 * Every raw resource is fetched exactly once here, behind a stable query
 * key, and reused by every derived hook that needs it — so the dashboard
 * never issues duplicate requests for the same backend resource.
 * ----------------------------------------------------------------------- */

const useRawCourses = () =>
  useQuery({
    queryKey: ["instructor-home", "raw", "courses"],
    queryFn: async () => asArray<RawCourse>(await getCourses()),
    ...defaultQueryOptions,
  });

/**
 * True once the browser has been idle after the first paint (or after a short
 * fallback delay where requestIdleCallback is unavailable).
 *
 * GET /modules returns every module -> lesson -> topic across every course the
 * instructor owns, unpaginated, and is by a wide margin the heaviest request
 * the dashboard can make. Nothing the page needs in order to *paint* comes
 * from it, so it is held behind this flag: the dashboard renders from its
 * small queries first, then fills in the module-derived pieces (Continue
 * Editing, and the draft-lesson row of Needs Attention) once the page is
 * interactive.
 */
function useIdleAfterPaint() {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(() => setIdle(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(handle);
    }

    const handle = window.setTimeout(() => setIdle(true), 200);
    return () => window.clearTimeout(handle);
  }, []);

  return idle;
}

const useRawModules = () => {
  const idle = useIdleAfterPaint();

  return useQuery({
    queryKey: ["instructor-home", "raw", "modules"],
    queryFn: async () => asArray<RawModule>(await getModules()),
    ...defaultQueryOptions,
    // Deferred rather than dropped — see useIdleAfterPaint above.
    enabled: idle,
  });
};

const useRawQuizzes = () =>
  useQuery({
    queryKey: ["instructor-home", "raw", "quizzes"],
    queryFn: async () => asArray<RawQuiz>(await getQuizzes()),
    ...defaultQueryOptions,
  });

const useRawAssignments = () =>
  useQuery({
    queryKey: ["instructor-home", "raw", "assignments"],
    queryFn: async () => asArray<RawAssignment>(await getAssignments()),
    ...defaultQueryOptions,
  });

/**
 * Calendar and notifications are fetched under the app-wide canonical keys
 * rather than dashboard-private ones. NotificationContext and MiniCalendar
 * already read [CALENDAR] / [NOTIFICATIONS]; keeping a separate
 * "instructor-home/raw" key here meant React Query could not dedupe, so the
 * dashboard issued a second request for data already in the cache.
 */
const useRawCalendarEvents = () =>
  useQuery({
    queryKey: [QUERY_KEYS.CALENDAR],
    queryFn: async () => asArray<RawCalendarEvent>(await getCalendarEvents()),
    ...defaultQueryOptions,
  });

const useRawNotifications = () =>
  useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS],
    queryFn: async () => asArray<RawNotification>(await getRawNotifications()),
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 2,
  });

const useRawConversations = () =>
  useQuery({
    queryKey: ["instructor-home", "raw", "conversations"],
    queryFn: async () => {
      const response = await getConversations();
      const payload = response as { data?: unknown } | unknown[];
      return asArray<RawConversation>(
        Array.isArray(payload) ? payload : (payload as { data?: unknown }).data
      );
    },
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 2,
  });

const useDashboardSummary = () =>
  useQuery({ queryKey: ["instructor-home", "raw", "summary"], queryFn: getDashboardSummary, ...defaultQueryOptions });

/**
 * Server-computed summary counts. Every field is a single number produced by a
 * COUNT in the database — this replaces counting the length of a fetched list,
 * which was silently wrong because GET /courses is paginated at 10 by default.
 */
const useCourseStatusCounts = () =>
  useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_COURSE_STATS],
    queryFn: getCourseStatusCounts,
    ...defaultQueryOptions,
  });

/* ------------------------------- Derived hooks --------------------------- */

/**
 * The KPI strip.
 *
 * Course count, student count and published-quiz count now come from
 * GET /courses/stats/mine, which returns three numbers computed by the
 * database. Previously they were derived as `courses.length` and a JS sum over
 * `_count.enrollments` across the fetched course array — which capped at 10,
 * because GET /courses is paginated with a default limit of 10 and the real
 * `pagination.total` was discarded by the service layer. An instructor with
 * more than 10 courses saw silently wrong numbers on both tiles.
 *
 * Fetching the full quiz list purely to count published ones is likewise gone.
 */
export function useDashboardStats() {
  const counts = useCourseStatusCounts();
  const assignments = useRawAssignments();
  const calendarEvents = useRawCalendarEvents();
  const notifications = useRawNotifications();
  const conversations = useRawConversations();

  const isLoading =
    counts.isLoading || assignments.isLoading || calendarEvents.isLoading || notifications.isLoading || conversations.isLoading;
  const data = useMemo(
    () =>
      deriveDashboardStats({
        courseCount: counts.data?.total ?? 0,
        draftCourseCount: counts.data?.draft ?? 0,
        studentCount: counts.data?.students ?? 0,
        activeQuizCount: counts.data?.activeQuizzes ?? 0,
        assignments: assignments.data ?? [],
        calendarEvents: calendarEvents.data ?? [],
        notifications: notifications.data ?? [],
        conversations: conversations.data ?? [],
      }),
    [counts.data, assignments.data, calendarEvents.data, notifications.data, conversations.data]
  );

  return { data, isLoading };
}

export function useRecentActivities() {
  const notifications = useRawNotifications();
  const data = useMemo(() => deriveRecentActivities(notifications.data ?? []), [notifications.data]);
  return { data, isLoading: notifications.isLoading };
}

export function useNeedsAttention() {
  const assignments = useRawAssignments();
  const quizzes = useRawQuizzes();
  const modules = useRawModules();
  const courses = useRawCourses();
  const calendarEvents = useRawCalendarEvents();

  // modules is deliberately absent from this condition. It is deferred until
  // after first paint (see useRawModules), so waiting on it here would hold the
  // whole priority list behind the page's slowest request. Instead the list
  // renders immediately from the four fast queries and the "draft lessons to
  // publish" row appears on its own once modules lands — deriveNeedsAttention
  // already filters out any row whose count is 0.
  const isLoading =
    assignments.isLoading || quizzes.isLoading || courses.isLoading || calendarEvents.isLoading;
  const data = useMemo(
    () =>
      deriveNeedsAttention({
        assignments: assignments.data ?? [],
        quizzes: quizzes.data ?? [],
        modules: modules.data ?? [],
        courses: courses.data ?? [],
        calendarEvents: calendarEvents.data ?? [],
      }),
    [assignments.data, quizzes.data, modules.data, courses.data, calendarEvents.data]
  );

  return { data, isLoading };
}

export function useUpcomingClasses() {
  const events = useRawCalendarEvents();
  const data = useMemo(() => deriveUpcomingClasses(events.data ?? []), [events.data]);
  return { data, isLoading: events.isLoading };
}

export function useCalendarHighlights() {
  const events = useRawCalendarEvents();
  const data = useMemo(() => deriveCalendarHighlights(events.data ?? []), [events.data]);
  return { data, isLoading: events.isLoading };
}

export function useInstructorCoursesOverview() {
  const courses = useRawCourses();
  const data = useMemo(() => deriveInstructorCourses(courses.data ?? []), [courses.data]);
  return { data, isLoading: courses.isLoading };
}

export function useDraftCourses() {
  const courses = useRawCourses();
  const data = useMemo(() => deriveDraftCourses(courses.data ?? []), [courses.data]);
  return { data, isLoading: courses.isLoading };
}

export function useContinueEditing() {
  const modules = useRawModules();
  const data = useMemo(() => deriveContinueEditing(modules.data ?? []), [modules.data]);
  // isPending, not isLoading: while the query is still deferred it is disabled,
  // and a disabled query reports isLoading false with no data — which would flash
  // the card's empty state before the fetch has even been allowed to start.
  // isPending stays true across both the deferred window and the fetch itself,
  // so the caller shows one uninterrupted skeleton.
  return { data, isLoading: modules.isPending };
}

export function useAnnouncementsFeed() {
  return useQuery({ queryKey: ["instructor-home", "announcements"], queryFn: getAnnouncements, ...defaultQueryOptions });
}

export function useMessagesPreview() {
  const conversations = useRawConversations();
  const data = useMemo(() => deriveMessages(conversations.data ?? []), [conversations.data]);
  return { data, isLoading: conversations.isLoading };
}

const GOALS_QUERY_KEY = ["instructor-home", "goals"];

export function useTeachingGoals() {
  return useQuery({ queryKey: GOALS_QUERY_KEY, queryFn: getTeachingGoals, ...defaultQueryOptions });
}

export function useCreateTeachingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => createTeachingGoal(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  });
}

export function useUpdateTeachingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, payload }: { goalId: string; payload: UpdateGoalPayload }) =>
      updateTeachingGoal(goalId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  });
}

export function useDeleteTeachingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => deleteTeachingGoal(goalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  });
}

export function useInsights() {
  const assignments = useRawAssignments();
  const courses = useRawCourses();
  const isLoading = assignments.isLoading || courses.isLoading;
  const data = useMemo(
    () => deriveInsights({ assignments: assignments.data ?? [], courses: courses.data ?? [] }),
    [assignments.data, courses.data]
  );
  return { data, isLoading };
}

export function useEngagementAnalytics() {
  const summary = useDashboardSummary();
  const data = useMemo(() => deriveEngagementAnalytics(summary.data), [summary.data]);
  return { data, isLoading: summary.isLoading };
}

/**
 * The instructor's own courses, raw, for the Home "My courses" grid.
 *
 * Reuses the same ["instructor-home", "raw", "courses"] query the KPI strip and
 * Needs Attention already read, so the grid costs no extra request. Returns the
 * course objects untouched because CourseGridCard — shared with the My Courses
 * page — expects the full server shape (thumbnailUrl, level, stats, _count),
 * not the narrowed CourseProgressOverview projection below.
 */
export function useMyCourses() {
  const courses = useRawCourses();
  return { data: courses.data ?? [], isLoading: courses.isLoading };
}

export function useCourseProgressOverview() {
  const courses = useRawCourses();
  const data = useMemo(() => deriveCourseProgressOverview(courses.data ?? []), [courses.data]);
  return { data, isLoading: courses.isLoading };
}

export function useRecentSubmissions() {
  const assignments = useRawAssignments();
  const data = useMemo(() => deriveRecentSubmissions(assignments.data ?? []), [assignments.data]);
  return { data, isLoading: assignments.isLoading };
}

// Internal raw hook to fetch results
const useRawResults = () =>
  useQuery({
    queryKey: ["instructor-home", "raw", "results"],
    queryFn: async () => {
      // Assuming getResults from results.service.js handles backend API
      const { getResults } = await import("@/services/results.service");
      const response = await getResults({});
      return asArray<RawResult>(Array.isArray(response) ? response : response?.data ?? []);
    },
    ...defaultQueryOptions,
  });

export function useGradeDistribution() {
  const results = useRawResults();
  const data = useMemo(() => deriveGradeDistribution(results.data ?? []), [results.data]);
  return { data, isLoading: results.isLoading };
}
