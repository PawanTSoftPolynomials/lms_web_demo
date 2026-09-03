import {
  BookOpen,
  CheckSquare,
  Calendar,
  CalendarDays,
  Compass,
  MessageSquare,
  BarChart3,
  Newspaper,
  Megaphone,
  Activity,
  Lightbulb,
  Sparkles,
  Home,
  Layers,
} from "lucide-react";

/**
 * The floating quick-action strip's items for the Student dashboard — same
 * grouped shape as the Instructor's PRIMARY_NAV_ITEMS
 * (@/components/instructor/NavigationStrip/navigationItems), rendered
 * through the shared QuickActionStrip component: Home and Batches stay flat
 * links, everything else lives inside a section dropdown. Only the
 * destinations differ; layout, styling, and behavior are identical to
 * Instructor.
 */
export const PRIMARY_NAV_ITEMS = [
  { label: "Home", href: "/student/dashboard", icon: Home, primaryOnMobile: true },
  {
    label: "Learning",
    icon: BookOpen,
    primaryOnMobile: true,
    children: [
      {
        label: "Courses",
        icon: BookOpen,
        children: [
          { label: "All Available Courses", href: "/student/store", icon: Compass },
          { label: "My Courses", href: "/student/my-courses", icon: BookOpen },
        ],
      },
      { label: "My Work", href: "/student/assignments", icon: CheckSquare },
      { label: "Q/A", href: "/student/qa", icon: MessageSquare },
    ],
  },
  { label: "Batches", href: "/student/batches", icon: Layers, primaryOnMobile: true },
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
      { label: "AI Recommendations", href: "/student/courses", icon: Sparkles },
    ],
  },
];
