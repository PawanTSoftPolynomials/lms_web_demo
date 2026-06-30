"use client";

import {
    Users,
    UserCheck,
    UserX,
    ShieldBan,
} from "lucide-react";

import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";

export default function StudentStats({
                                         students = [],
                                     }) {
    const totalStudents =
        students.length;

    const activeStudents =
        students.filter(
            (student) =>
                student.user.status ===
                "ACTIVE"
        ).length;

    const inactiveStudents =
        students.filter(
            (student) =>
                student.user.status ===
                "INACTIVE"
        ).length;

    const blockedStudents =
        students.filter(
            (student) =>
                student.user.status ===
                "BLOCKED"
        ).length;

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
                title="Total Students"
                value={totalStudents}
                icon={<Users/>}
            />

            <DashboardStatCard
                title="Active"
                value={activeStudents}
                icon={<UserCheck/>}
            />

            <DashboardStatCard
                title="Inactive"
                value={inactiveStudents}
                icon={<UserX/>}
            />

            <DashboardStatCard
                title="Blocked"
                value={blockedStudents}
                icon={<ShieldBan/>}
            />
        </div>
    );
}