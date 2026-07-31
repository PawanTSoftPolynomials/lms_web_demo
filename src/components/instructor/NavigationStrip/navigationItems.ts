import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Database,
  Home,
  MessageSquare,
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
 * The single top navigation strip — every instructor destination lives here
 * or under "More" (see NavigationStrip.tsx's MORE_MENU_ITEMS). There is
 * intentionally no second row of action buttons; per-action buttons live
 * contextually inside the relevant page/Course Workspace tab instead.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/instructor/dashboard", icon: Home, primaryOnMobile: true },
  { label: "Courses", href: "/instructor/courses", icon: BookOpen, primaryOnMobile: true },
  { label: "Students", href: "/instructor/students", icon: Users, primaryOnMobile: true },
  {
    label: "Quiz & Question Bank",
    icon: ClipboardList,
    primaryOnMobile: true,
    children: [
      { label: "Quizzes", href: "/instructor/quizzes", icon: ClipboardList },
      { label: "Question Repository", href: "/instructor/questions", icon: Database },
    ],
  },
  { label: "Analytics", href: "/instructor/reports", icon: BarChart3 },
  { label: "Calendar", href: "/instructor/calendar", icon: CalendarDays },
  { label: "Messages", href: "/instructor/messages", icon: MessageSquare },
];

export interface MoreMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
