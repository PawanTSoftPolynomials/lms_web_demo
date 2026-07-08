import {
    BookOpen,
    CircleDashed,
    TrendingUp,
    GraduationCap,
} from "lucide-react";

import StatCard from "@/components/student/dashboard/StatCard";

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

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Total Courses"
                value={totalCourses}
                icon={<BookOpen className="h-6 w-6"/>}
            />

            <StatCard
                title="Beginner"
                value={beginnerCourses}
                icon={<GraduationCap className="h-6 w-6"/>}
            />

            <StatCard
                title="Intermediate"
                value={intermediateCourses}
                icon={<CircleDashed className="h-6 w-6"/>}
            />

            <StatCard
                title="Advanced"
                value={advancedCourses}
                icon={<TrendingUp className="h-6 w-6"/>}
            />
        </div>
    );
}