"use client";

import {
    GraduationCap,
    Calendar,
    Users,
} from "lucide-react";

import Card from "@/components/ui/Card";

function InfoRow({
                     icon: Icon,
                     label,
                     value,
                 }) {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Icon className="h-5 w-5 text-orange-500" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-400">
                    {label}
                </p>

                <p className="mt-1 warp-break-word font-medium text-white">
                    {value || "Not Provided"}
                </p>
            </div>
        </div>
    );
}

export default function EducationCard({
                                          profile,
                                      }) {
    if (!profile) return null;

    const student =
        profile.studentProfile || {};

    const dob = student.dateOfBirth
        ? new Date(
            student.dateOfBirth
        ).toLocaleDateString()
        : "Not Provided";

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                    Academic Information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Your education details and student records.
                </p>
            </div>

            <div className="space-y-4">
                <InfoRow
                    icon={GraduationCap}
                    label="Education"
                    value={student.education}
                />

                <InfoRow
                    icon={Calendar}
                    label="Date of Birth"
                    value={dob}
                />

                <InfoRow
                    icon={Users}
                    label="Guardian Name"
                    value={student.guardianName}
                />
            </div>
        </Card>
    );
}