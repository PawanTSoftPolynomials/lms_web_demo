import {
  BookOpen,
  Calendar,
  CalendarDays,
  BarChart3,
  Newspaper,
  Megaphone,
  Activity,
  Lightbulb,
  Home,
  Compass,
} from "lucide-react";

/**
 * The floating quick-action strip's items for the Student dashboard — same
 * grouped shape as the Instructor's PRIMARY_NAV_ITEMS
 * (@/components/instructor/NavigationStrip/navigationItems), rendered
 * through the shared QuickActionStrip component: Dashboard, Learning and
 * Explore stay flat links, everything else lives inside a section dropdown.
 * Only the destinations differ; layout, styling, and behavior are identical
 * to Instructor.
 */
export const PRIMARY_NAV_ITEMS = [
  { label: "Dashboard", href: "/student/dashboard", icon: Home, primaryOnMobile: true },
  { label: "Learning", href: "/student/my-courses", icon: BookOpen, primaryOnMobile: true },
  { label: "Explore", href: "/student/courses", icon: Compass, primaryOnMobile: true },
  {
    label: "Schedule & Communication",
    icon: CalendarDays,
    primaryOnMobile: true,
    children: [
      { label: "Calendar", href: "/student/calendar", icon: Calendar },
      { label: "News", href: "/student/news", icon: Newspaper },
      { label: "Announcements", href: "/student/announcements", icon: Megaphone },
      { label: "Suggestions", href: "/student/feedback", icon: Lightbulb },
    ],
  },
  {
    label: "Insights",
    icon: BarChart3,
    primaryOnMobile: true,
    children: [
      { label: "Reports", href: "/student/reports", icon: BarChart3 },
      { label: "Activity", href: "/student/activity", icon: Activity },
    ],
  },
];
