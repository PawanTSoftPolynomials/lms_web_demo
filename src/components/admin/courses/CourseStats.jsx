"use client";

import {
    BookOpen,
    CheckCircle,
    FileText,
    Layers,
} from "lucide-react";

import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";

export default function CourseStats({
                                        courses = [],
                                    }) {
    const totalCourses =
        courses.length;

    const publishedCourses =
        courses.filter(
            (course) =>
                course.status ===
                "PUBLISHED"
        ).length;

    const draftCourses =
        courses.filter(
            (course) =>
                course.status ===
                "DRAFT"
        ).length;

    const totalCategories =
        new Set(
            courses.map(
                (course) =>
                    course.category
            )
        ).size;

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
                title="Total Courses"
                value={totalCourses}
                icon={<BookOpen/>}
            />

            <DashboardStatCard
                title="Published"
                value={publishedCourses}
                icon={<CheckCircle/>}
            />

            <DashboardStatCard
                title="Draft"
                value={draftCourses}
                icon={<FileText/>}
            />

            <DashboardStatCard
                title="Categories"
                value={totalCategories}
                icon={<Layers/>}
            />
        </div>
    );
}