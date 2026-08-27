import { BookOpen, CheckCircle, Activity, Trophy } from "lucide-react";

export const getStatCards = ({
  enrolledCount = 0,
  completedLessonsCount = 0,
  completionRate = 0,
  certificatesCount = 0,
}) => [
  {
    key: "enrolled",
    label: "Enrolled Courses",
    value: enrolledCount,
    icon: BookOpen,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    hint: "View all courses",
    href: "/student/my-courses",
  },
  {
    key: "completed",
    label: "Completed Lessons",
    value: completedLessonsCount,
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    hint: "Keep it up! 🎉",
  },
  {
    key: "rate",
    label: "Completion Rate",
    value: `${completionRate}%`,
    icon: Activity,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    progress: completionRate,
  },
  {
    key: "certificates",
    label: "Certificates Earned",
    value: certificatesCount,
    icon: Trophy,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    hint: "View certificates",
    href: "/student/certificates",
  },
];
