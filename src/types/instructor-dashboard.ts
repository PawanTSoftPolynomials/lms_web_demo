import type { LucideIcon } from "lucide-react";

export interface InstructorProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  role: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: number | string;
  subtitle: string;
  /** Optional secondary line, e.g. "Python Basics · 2:30 PM" or "Continue Editing" */
  meta?: string;
  icon: LucideIcon;
  href?: string;
  accent: "orange" | "pink" | "sky" | "emerald" | "violet" | "amber";
}

export interface ActivityItem {
  id: string;
  type:
    | "enrollment"
    | "submission"
    | "quiz_published"
    | "course_updated"
    | "lesson_completed"
    | "discussion"
    | "announcement"
    | "grade";
  title: string;
  courseName: string;
  timestamp: string;
}

export interface PendingAction {
  id: string;
  label: string;
  count: number;
  severity: "high" | "medium" | "low";
  href: string;
  icon: LucideIcon;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  endTime?: string;
  courseName: string;
  batch?: string;
  type: "class" | "live" | "deadline" | "meeting";
  location?: string;
  joinLink?: string;
  status: "live" | "upcoming" | "ended";
}

export interface InstructorCourseSummary {
  id: string;
  title: string;
  coverColor: string;
  imageUrl?: string | null;
  studentsCount: number;
  completionRate: number;
  averageScore: number;
  publishedLessons: number;
  pendingLessons: number;
  isPublished: boolean;
}

export interface DraftCourse {
  id: string;
  title: string;
  progress: number;
  lastEdited: string;
}

export interface ContinueEditingItem {
  id: string;
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  href: string;
  lastEditedLabel: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  courseName?: string;
  postedAt: string;
}

export interface ConversationPreview {
  id: string;
  name: string;
  avatarUrl?: string | null;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface CalendarHighlight {
  date: string;
  type: "class" | "deadline" | "live" | "meeting";
}

export interface TeachingGoal {
  id: string;
  label: string;
  current: number;
  target: number;
  done: boolean;
}

export interface InsightItem {
  id: string;
  text: string;
  tone: "positive" | "negative" | "neutral";
  metricLabel?: string;
}

export interface EngagementSeriesPoint {
  label: string;
  dailyActiveStudents: number;
  quizParticipation: number;
  lessonCompletion: number;
  watchTimeMinutes: number;
}
