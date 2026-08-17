import {
  BookOpen,
  CheckSquare,
  Calendar,
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
 * shape/order as the Instructor's PRIMARY_NAV_ITEMS
 * (@/components/instructor/NavigationStrip/navigationItems), rendered
 * through the shared QuickActionStrip component. Only the destinations
 * differ; layout, styling, and behavior are identical to Instructor.
 */
export const PRIMARY_NAV_ITEMS = [
  { label: "Home", href: "/student/dashboard", icon: Home, primaryOnMobile: true },
  { label: "My Courses", href: "/student/my-courses", icon: BookOpen, primaryOnMobile: true },
  { label: "My Work", href: "/student/assignments", icon: CheckSquare, primaryOnMobile: true },
  { label: "Batches", href: "/student/batches", icon: Layers, primaryOnMobile: true },
  { label: "Calendar", href: "/student/calendar", icon: Calendar, primaryOnMobile: true },
  { label: "Q/A", href: "/student/qa", icon: MessageSquare, primaryOnMobile: true },
  { label: "Reports", href: "/student/reports", icon: BarChart3, primaryOnMobile: true },
  { label: "News", href: "/student/news", icon: Newspaper, primaryOnMobile: true },
  { label: "Announcements", href: "/student/announcements", icon: Megaphone, primaryOnMobile: true },
  { label: "Activity", href: "/student/activity", icon: Activity, primaryOnMobile: true },
  { label: "Suggestions", href: "/student/feedback", icon: Lightbulb, primaryOnMobile: true },
  { label: "AI Recommendations", href: "/student/courses", icon: Sparkles, primaryOnMobile: true },
];
