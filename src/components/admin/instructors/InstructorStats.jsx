"use client";

import {
    Users,
    UserCheck,
    UserX,
    ShieldBan,
} from "lucide-react";

import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";

export default function InstructorStats({
                                            instructors = [],
                                        }) {
    const totalInstructors =
        instructors.length;

    const activeInstructors =
        instructors.filter(
            (instructor) =>
                instructor.user.status ===
                "ACTIVE"
        ).length;

    const inactiveInstructors =
        instructors.filter(
            (instructor) =>
                instructor.user.status ===
                "INACTIVE"
        ).length;

    const blockedInstructors =
        instructors.filter(
            (instructor) =>
                instructor.user.status ===
                "BLOCKED"
        ).length;

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
                title="Total Instructors"
                value={totalInstructors}
                icon={<Users/>}
            />

            <DashboardStatCard
                title="Active"
                value={activeInstructors}
                icon={<UserCheck/>}
            />

            <DashboardStatCard
                title="Inactive"
                value={inactiveInstructors}
                icon={<UserX/>}
            />

            <DashboardStatCard
                title="Blocked"
                value={blockedInstructors}
                icon={<ShieldBan/>}
            />
        </div>
    );
}