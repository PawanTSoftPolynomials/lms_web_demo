import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Database,
  FileEdit,
  HelpCircle,
  Home,
  Layers,
  Megaphone,
  MessageSquareText,
  NotebookPen,
  Newspaper,
  TrendingUp,
  UploadCloud,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  // One further level of nesting — currently only "Work" (under "Learning")
  // uses this, to keep its own grouping instead of flattening into its parent.
  children?: NavSubItem[];
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  primaryOnMobile?: boolean;
  children?: NavSubItem[];
}

/**
 * The top navigation strip, grouped into 5 sections so it fits the top bar
 * without wrapping: Home stays a flat link, everything else lives inside a
 * section dropdown. "Work" keeps its own sub-grouping (nested one level
 * deeper under "Learning") rather than flattening its 6 items into the
 * section directly.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/instructor/dashboard", icon: Home, primaryOnMobile: true },
  {
    label: "Learning",
    icon: BookOpen,
    primaryOnMobile: true,
    children: [
      { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
      {
        label: "Work",
        icon: Briefcase,
        children: [
          { label: "Create Quiz", href: "/instructor/work/quiz", icon: ClipboardList },
          { label: "Create Assessment", href: "/instructor/work/assessment", icon: FileEdit },
          { label: "Question Repository", href: "/instructor/work/questions", icon: Database },
          { label: "Upload Documents", href: "/instructor/work/documents", icon: UploadCloud },
          { label: "Notes", href: "/instructor/work/notes", icon: NotebookPen },
        ],
      },
      { label: "Q&A", href: "/instructor/qa", icon: HelpCircle },
    ],
  },
  {
    label: "People & Classes",
    icon: Users,
    primaryOnMobile: true,
    children: [
      { label: "Students", href: "/instructor/students", icon: Users },
      { label: "Batches", href: "/instructor/batches", icon: Layers },
    ],
  },
  {
    label: "Schedule & Communication",
    icon: CalendarDays,
    primaryOnMobile: true,
    children: [
      { label: "Calendar", href: "/instructor/calendar", icon: CalendarDays },
      { label: "News", href: "/instructor/news", icon: Newspaper },
      { label: "Announcements", href: "/instructor/announcements", icon: Megaphone },
      { label: "Feedback", href: "/instructor/feedback", icon: MessageSquareText },
    ],
  },
  {
    label: "Insights",
    icon: BarChart3,
    primaryOnMobile: true,
    children: [
      { label: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
      { label: "Results", href: "/instructor/results", icon: TrendingUp },
    ],
  },
];
