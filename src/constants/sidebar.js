import {
    FaTachometerAlt,
    FaUsers,
    FaBook,
    FaClipboardList,
    FaGraduationCap,
    FaUserCircle
} from "react-icons/fa";
import {FcGraduationCap} from "react-icons/fc";
import {FaCertificate} from "react-icons/fa6";

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
            title: "Certificates",
            href: "/admin/certificates",
            icon: FaCertificate,
        },
        {
            title: "Profile",
            icon: FaUserCircle,
            href: "/admin/profile",
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