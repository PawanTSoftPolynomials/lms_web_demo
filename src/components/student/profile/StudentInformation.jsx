"use client";

import {
    GraduationCap,
    Calendar,
    Users,
} from "lucide-react";

import Card from "@/components/ui/Card";

function InfoItem({
                      icon: Icon,
                      label,
                      value,
                  }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Icon className="h-5 w-5 text-orange-500" />
                </div>

                <p className="text-sm font-medium text-slate-400">
                    {label}
                </p>
            </div>

            <p className="warp-break-word text-base font-medium text-white">
                {value || "Not Provided"}
            </p>
        </div>
    );
}

export default function StudentInformation({
                                               profile,
                                           }) {
    if (!profile) return null;

    const student =
        profile.studentProfile || {};

    const formattedDate =
        student.dateOfBirth
            ? new Date(
                student.dateOfBirth
            ).toLocaleDateString()
            : "Not Provided";

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                    Student Information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Your academic details and student profile information.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem
                    icon={GraduationCap}
                    label="Education"
                    value={student.education}
                />

                <InfoItem
                    icon={Calendar}
                    label="Date of Birth"
                    value={formattedDate}
                />

                <InfoItem
                    icon={Users}
                    label="Guardian Name"
                    value={student.guardianName}
                />
            </div>
        </Card>
    );
}