import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Database,
  FileCheck2,
  FileEdit,
  HelpCircle,
  Home,
  Layers,
  Lightbulb,
  Megaphone,
  MessageSquareText,
  NotebookPen,
  Newspaper,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  primaryOnMobile?: boolean;
  children?: NavSubItem[];
}

/**
 * The single top navigation strip — every instructor destination lives here.
 * "Work" is the only dropdown, grouping the course-authoring pages (quiz,
 * assessment, test, question repository, document upload, notes) that share
 * a course/batch/module filter. Everything else is a flat, wrapping row.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/instructor/dashboard", icon: Home, primaryOnMobile: true },
  { label: "My Courses", href: "/instructor/courses", icon: BookOpen, primaryOnMobile: true },
  {
    label: "Work",
    icon: Briefcase,
    primaryOnMobile: true,
    children: [
      { label: "Create Quiz", href: "/instructor/work/quiz", icon: ClipboardList },
      { label: "Create Assessment", href: "/instructor/work/assessment", icon: FileEdit },
      { label: "Create Test", href: "/instructor/work/test", icon: FileCheck2 },
      { label: "Question Repository", href: "/instructor/work/questions", icon: Database },
      { label: "Upload Documents", href: "/instructor/work/documents", icon: UploadCloud },
      { label: "Notes", href: "/instructor/work/notes", icon: NotebookPen },
    ],
  },
  { label: "Students", href: "/instructor/students", icon: Users, primaryOnMobile: true },
  { label: "Batches", href: "/instructor/batches", icon: Layers, primaryOnMobile: true },
  { label: "Calendar", href: "/instructor/calendar", icon: CalendarDays, primaryOnMobile: true },
  { label: "Q&A", href: "/instructor/qa", icon: HelpCircle, primaryOnMobile: true },
  { label: "News", href: "/instructor/news", icon: Newspaper, primaryOnMobile: true },
  { label: "Announcements", href: "/instructor/announcements", icon: Megaphone, primaryOnMobile: true },
  { label: "Analytics", href: "/instructor/analytics", icon: BarChart3, primaryOnMobile: true },
  { label: "Suggestions", href: "/instructor/suggestions", icon: Lightbulb, primaryOnMobile: true },
  { label: "Recommendations", href: "/instructor/recommendations", icon: Sparkles, primaryOnMobile: true },
  { label: "Feedback", href: "/instructor/feedback", icon: MessageSquareText, primaryOnMobile: true },
  { label: "Results", href: "/instructor/results", icon: TrendingUp, primaryOnMobile: true },
];
