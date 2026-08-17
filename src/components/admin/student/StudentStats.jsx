"use client";

import {
    Users,
    CircleDashed,
} from "lucide-react";

import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";

export default function StudentStats({
                                         students = [],
                                     }) {
    const totalStudents =
        students.length;

    const notStartedStudents =
        students.filter(
            (student) =>
                student.status ===
                "Not Started"
        ).length;

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DashboardStatCard
                title="Total Students"
                value={totalStudents}
                icon={<Users/>}
            />

            <DashboardStatCard
                title="Not Started"
                value={notStartedStudents}
                icon={<CircleDashed/>}
            />
        </div>
    );
}
