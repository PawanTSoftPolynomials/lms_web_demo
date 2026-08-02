import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { defaultQueryOptions } from "@/lib/queryOptions";
import {
  createTeachingGoal,
  deleteTeachingGoal,
  updateTeachingGoal,
  type CreateGoalPayload,
  type UpdateGoalPayload,
} from "@/services/instructor/teachingGoals.service";
import { getCourses } from "@/services/course.service";
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

const useRawModules = () =>
  useQuery({
    queryKey: ["instructor-home", "raw", "modules"],
    queryFn: async () => asArray<RawModule>(await getModules()),
    ...defaultQueryOptions,
  });

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

const useRawCalendarEvents = () =>
  useQuery({
    queryKey: ["instructor-home", "raw", "calendar"],
    queryFn: async () => asArray<RawCalendarEvent>(await getCalendarEvents()),
    ...defaultQueryOptions,
  });

const useRawNotifications = () =>
  useQuery({
    queryKey: ["instructor-home", "raw", "notifications"],
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

/* ------------------------------- Derived hooks --------------------------- */

export function useDashboardStats() {
  const courses = useRawCourses();
  const assignments = useRawAssignments();
  const calendarEvents = useRawCalendarEvents();
  const notifications = useRawNotifications();
  const conversations = useRawConversations();
  const quizzes = useRawQuizzes();

  const isLoading =
    courses.isLoading || assignments.isLoading || calendarEvents.isLoading || notifications.isLoading || conversations.isLoading || quizzes.isLoading;
  const data = useMemo(
    () =>
      deriveDashboardStats({
        courses: courses.data ?? [],
        assignments: assignments.data ?? [],
        calendarEvents: calendarEvents.data ?? [],
        notifications: notifications.data ?? [],
        conversations: conversations.data ?? [],
        quizzes: quizzes.data ?? [],
      }),
    [courses.data, assignments.data, calendarEvents.data, notifications.data, conversations.data, quizzes.data]
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

  const isLoading =
    assignments.isLoading || quizzes.isLoading || modules.isLoading || courses.isLoading || calendarEvents.isLoading;
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
  return { data, isLoading: modules.isLoading };
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
      return asArray<any>(Array.isArray(response) ? response : response?.data ?? []);
    },
    ...defaultQueryOptions,
  });

export function useGradeDistribution() {
  const results = useRawResults();
  const data = useMemo(() => deriveGradeDistribution(results.data ?? []), [results.data]);
  return { data, isLoading: results.isLoading };
}

