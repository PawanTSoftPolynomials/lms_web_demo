import { BookOpen, Trophy } from "lucide-react";

export const getStatCards = ({
  enrolledCount = 0,
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
