import {
    BookOpen,
    CircleDashed,
    TrendingUp,
    GraduationCap,
} from "lucide-react";

import StudentStatCard from "@/components/dashboard/StudentStatCard";

export default function CourseStats({
                                        courses = [],
                                    }) {
    const totalCourses = courses.length;

    const beginnerCourses = courses.filter(
        (course) => course.level === "Beginner"
    ).length;

    const intermediateCourses = courses.filter(
        (course) => course.level === "Intermediate"
    ).length;

    const advancedCourses = courses.filter(
        (course) => course.level === "Advanced"
    ).length;

    const stats = [
        {
            key: "total",
            label: "Total Courses",
            value: totalCourses,
            icon: BookOpen,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
        },
        {
            key: "beginner",
            label: "Beginner",
            value: beginnerCourses,
            icon: GraduationCap,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            key: "intermediate",
            label: "Intermediate",
            value: intermediateCourses,
            icon: CircleDashed,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            key: "advanced",
            label: "Advanced",
            value: advancedCourses,
            icon: TrendingUp,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <StudentStatCard key={stat.key} stat={stat} />
            ))}
        </div>
    );
}
