import { HelpCircle, CalendarCheck, Sparkles, BarChart2 } from "lucide-react";

export const QUESTION_COUNT_OPTIONS = [
  { value: 5, label: "5 Questions (Short Review)" },
  { value: 10, label: "10 Questions (Standard Quiz)" },
  { value: 15, label: "15 Questions (Full Test)" },
  { value: 20, label: "20 Questions (Grand Challenge)" },
];

// Single source of truth for tab id -> display label, shared by the course
// action-card menu (below) and the quizzes page's course-detail header.
export const QUIZ_TAB_LABELS = {
  new: "New Quizzes",
  completed: "Completed Quizzes",
  self_generate: "Self-Generate Practice",
  reports: "Quiz Reports",
};

export const getQuizActionItems = (courseId, setViewingCourseId, setActiveTab) => [
  {
    label: QUIZ_TAB_LABELS.new,
    icon: HelpCircle,
    iconColor: "text-blue-400",
    onClick: () => {
      setViewingCourseId(courseId);
      setActiveTab("new");
    },
  },
  {
    label: QUIZ_TAB_LABELS.completed,
    icon: CalendarCheck,
    iconColor: "text-emerald-400",
    onClick: () => {
      setViewingCourseId(courseId);
      setActiveTab("completed");
    },
  },
  {
    label: QUIZ_TAB_LABELS.self_generate,
    icon: Sparkles,
    iconColor: "text-amber-400",
    onClick: () => {
      setViewingCourseId(courseId);
      setActiveTab("self_generate");
    },
  },
  {
    label: QUIZ_TAB_LABELS.reports,
    icon: BarChart2,
    iconColor: "text-purple-400",
    onClick: () => {
      setViewingCourseId(courseId);
      setActiveTab("reports");
    },
  },
];
