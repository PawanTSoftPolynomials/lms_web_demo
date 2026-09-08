"use client";

import {
    Users,
} from "lucide-react";

import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";

export default function StudentStats({
                                         students = [],
                                     }) {
    const totalStudents =
        students.length;

    return (
        <div className="grid grid-cols-1 gap-6">
            <DashboardStatCard
                title="Total Students"
                value={totalStudents}
                icon={<Users/>}
            />
        </div>
    );
}
