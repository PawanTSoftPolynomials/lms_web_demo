import {
  FaTachometerAlt,
  FaUsers,
  FaBook,
  FaClipboardList,
  FaGraduationCap,
} from "react-icons/fa";
import { FcGraduationCap } from "react-icons/fc";

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
      title: "Students",
      icon: FaUsers,
      href: "/admin/students",
    },
    {
      title: "Instructor",
      icon: FaUsers,
      href: "/admin/instructors",
    },
    {
      title: "Courses",
      icon: FaBook,
      href: "/admin/courses",
    },
    {
      title: "Enrollments",
      href: "/admin/enrollments",
      icon: FcGraduationCap,
    }, {
      title: "certificates",
      href: "/admin/certificates",
      icon: FcGraduationCap,
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
      title: "Courses",
      icon: FaBook,
      href: "/student/courses", // Browse all available courses
    },
    {
      title: "My Courses",
      icon: FaBook,
      href: "/student/my-courses", // Only enrolled courses
    },
    {
      title: "Progress",
      icon: FaGraduationCap,
      href: "/student/progress",
    },
  ],
};