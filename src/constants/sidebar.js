import {
  FaTachometerAlt,
  FaUsers,
  FaBook,
  FaClipboardList,
  FaGraduationCap,
} from "react-icons/fa";

export const SIDEBAR_ITEMS = {
  ADMIN: [
    {
      title: "Dashboard",
      icon: FaTachometerAlt,
      href: "/admin/dashboard",
    },
    {
      title: "Users",
      icon: FaUsers,
      href: "/admin/users",
    },
    {
      title: "Courses",
      icon: FaBook,
      href: "/admin/courses",
    },
  ],

  INSTRUCTOR: [
    {
      title: "Dashboard",
      icon: FaTachometerAlt,
      href: "/instructor/dashboard",
    },
    {
      title: "Courses",
      icon: FaBook,
      href: "/instructor/courses",
    },
    {
      title: "Quizzes",
      icon: FaClipboardList,
      href: "/instructor/quizzes",
    },
  ],

  STUDENT: [
    {
      title: "Dashboard",
      icon: FaTachometerAlt,
      href: "/student/dashboard",
    },
    {
      title: "My Courses",
      icon: FaBook,
      href: "/student/courses",
    },
    {
      title: "Progress",
      icon: FaGraduationCap,
      href: "/student/progress",
    },
  ],
};