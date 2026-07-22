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
            icon: "🏠",
            href: "/instructor/dashboard",
        },
        {
            title: "Courses",
            icon: "📚",
            href: "/instructor/courses",
        },
        {
            title: "Students",
            icon: "👨‍🎓",
            href: "/instructor/students",
        },
        {
            title: "Assignments",
            icon: "📝",
            href: "/instructor/assignments",
        },
        {
            title: "Quizzes",
            icon: "❓",
            href: "/instructor/quizzes",
        },
        {
            title: "Schedule",
            icon: "📅",
            href: "/instructor/calendar",
        },
        {
            title: "Certificates",
            icon: "📜",
            href: "/instructor/certificates",
        },
        {
            title: "Messages",
            icon: "💬",
            href: "/instructor/messages",
        },
        {
            title: "Analytics",
            icon: "📊",
            href: "/instructor/reports",
        },
        {
            title: "Settings",
            icon: "⚙",
            href: "/instructor/settings",
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
            title: "Settings",
            icon: FaCog,
            href: "/student/settings",
        },
    ],
};