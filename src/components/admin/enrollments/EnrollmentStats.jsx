"use client";

import {
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
} from "lucide-react";

import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";

export default function EnrollmentStats({
                                            enrollments = [],
                                        }) {
    const totalEnrollments =
        enrollments.length;

    const totalStudents =
        new Set(
            enrollments.map(
                (enrollment) =>
                    enrollment.studentId
            )
        ).size;

    const totalCourses =
        new Set(
            enrollments.map(
                (enrollment) =>
                    enrollment.courseId
            )
        ).size;

    const todayEnrollments =
        enrollments.filter(
            (enrollment) =>
                new Date(
                    enrollment.enrolledAt
                ).toDateString() ===
                new Date().toDateString()
        ).length;

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
                title="Total Enrollments"
                value={totalEnrollments}
                icon={<Users />}
            />

            <DashboardStatCard
                title="Students"
                value={totalStudents}
                icon={<GraduationCap />}
            />

            <DashboardStatCard
                title="Courses"
                value={totalCourses}
                icon={<BookOpen />}
            />

            <DashboardStatCard
                title="Today's Enrollments"
                value={todayEnrollments}
                icon={<Calendar />}
            />
        </div>
    );
}