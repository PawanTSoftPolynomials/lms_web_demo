import {
    FaTachometerAlt,
    FaUsers,
    FaBook,
    FaClipboardList,
    FaGraduationCap,
    FaUserCircle,
    FaCalendarAlt,
    FaVideo,
    FaQuestionCircle,
    FaFileAlt,
    FaBookmark,
    FaTrophy,
    FaEnvelope,
    FaCog
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
            title: "Calendar",
            icon: FaCalendarAlt,
            href: "/admin/calendar",
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
        {
            title: "Calendar",
            icon: FaCalendarAlt,
            href: "/instructor/calendar",
        },
    ],

    STUDENT: [
        {
            title: "Dashboard",
            icon: FaTachometerAlt,
            href: "/student/dashboard",
        },
        {
            title: "My Learning",
            icon: FaGraduationCap,
            href: "/student/my-courses",
        },
        {
            title: "Courses",
            icon: FaBook,
            href: "/student/courses",
        },
        {
            title: "Live Classes",
            icon: FaVideo,
            href: "/student/live-classes",
        },
        {
            title: "Assignments",
            icon: FaClipboardList,
            href: "/student/assignments",
        },
        {
            title: "Quizzes",
            icon: FaQuestionCircle,
            href: "/student/quizzes",
        },
        {
            title: "Notes",
            icon: FaFileAlt,
            href: "/student/notes",
        },
        {
            title: "Bookmarks",
            icon: FaBookmark,
            href: "/student/bookmarks",
        },
        {
            title: "Achievements",
            icon: FaTrophy,
            href: "/student/achievements",
        },
        {
            title: "Messages",
            icon: FaEnvelope,
            href: "/student/messages",
        },
        {
            title: "Settings",
            icon: FaCog,
            href: "/student/settings",
        },
    ],
};