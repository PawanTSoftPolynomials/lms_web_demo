import {
  // Commented-out icons below belong to the disabled Work, Batches,
  // Schedule & Communication and Insights entries (see PRIMARY_NAV_ITEMS).
  // BarChart3,
  BookOpen,
  // Briefcase,
  // CalendarDays,
  ClipboardList,
  Database,
  // FileCheck2,
  // FileEdit,
  HelpCircle,
  Home,
  // Layers,
  // Megaphone,
  // MessageSquareText,
  // NotebookPen,
  // Newspaper,
  // TrendingUp,
  // UploadCloud,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  // One further level of nesting — currently only "Work" (under "Teaching")
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
 * deeper under "Teaching") rather than flattening its 6 items into the
 * section directly.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/instructor/dashboard", icon: Home, primaryOnMobile: true },
  {
    label: "Teaching",
    icon: BookOpen,
    primaryOnMobile: true,
    children: [
      { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
      // Grading assignment submissions and reviewing Final test (MCQ) results.
      // The route keeps its original /assignments path so existing links work.
      { label: "Grading & Results", href: "/instructor/assignments", icon: ClipboardList },
      // Work section — hidden from the nav for now. To bring it back, uncomment
      // this block and its icon imports at the top of the file. The routes
      // under /instructor/work are untouched and still reachable by URL.
      // {
      //   label: "Work",
      //   icon: Briefcase,
      //   children: [
      //     { label: "Create Quiz", href: "/instructor/work/quiz", icon: ClipboardList },
      //     { label: "Create Assessment", href: "/instructor/work/assessment", icon: FileEdit },
      //     { label: "Create Test", href: "/instructor/work/test", icon: FileCheck2 },
      //     { label: "Question Repository", href: "/instructor/work/questions", icon: Database },
      //     { label: "Upload Documents", href: "/instructor/work/documents", icon: UploadCloud },
      //     { label: "Notes", href: "/instructor/work/notes", icon: NotebookPen },
      //   ],
      // },
      // Points at /instructor/questions, not the /instructor/work/questions
      // copy listed in the disabled Work block above. Both render the same
      // QuestionRepositoryView, but this is the route that owns the
      // edit/[questionId] and view/[questionId] pages under it.
      { label: "Question Repository", href: "/instructor/questions", icon: Database },
      { label: "Q&A", href: "/instructor/qa", icon: HelpCircle },
    ],
  },
  // Was a "People & Classes" section. With Batches hidden it held Students
  // alone, so it is a flat link now — a dropdown with one child is a click of
  // pure ceremony. Restoring Batches means turning this back into a section
  // with both children, and uncommenting the Layers import.
  // { label: "Batches", href: "/instructor/batches", icon: Layers },
  { label: "Students", href: "/instructor/students", icon: Users, primaryOnMobile: true },
  // Schedule & Communication and Insights sections — hidden from the nav for
  // now, same as Work above. To bring either back, uncomment its block and the
  // matching icon imports at the top of the file. Every route underneath is
  // untouched and still reachable by URL.
  // {
  //   label: "Schedule & Communication",
  //   icon: CalendarDays,
  //   primaryOnMobile: true,
  //   children: [
  //     { label: "Calendar", href: "/instructor/calendar", icon: CalendarDays },
  //     { label: "News", href: "/instructor/news", icon: Newspaper },
  //     { label: "Announcements", href: "/instructor/announcements", icon: Megaphone },
  //     { label: "Reviews", href: "/instructor/feedback", icon: MessageSquareText },
  //   ],
  // },
  // {
  //   label: "Insights",
  //   icon: BarChart3,
  //   primaryOnMobile: true,
  //   children: [
  //     { label: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
  //     { label: "Results", href: "/instructor/results", icon: TrendingUp },
  //   ],
  // },
];
