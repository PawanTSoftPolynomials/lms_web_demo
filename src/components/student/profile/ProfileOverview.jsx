"use client";

import {
    Mail,
    Phone,
    MapPin,
    GraduationCap,
} from "lucide-react";

import Card from "@/components/ui/Card";

export default function ProfileOverview({
                                            profile,
                                        }) {
    if (!profile) return null;

    const studentProfile =
        profile.studentProfile || {};

    const overviewItems = [
        {
            icon: Mail,
            label: "Email",
            value: profile.email,
        },
        {
            icon: Phone,
            label: "Phone",
            value:
                profile.phoneNumber ||
                studentProfile.phone ||
                "Not Provided",
        },
        {
            icon: MapPin,
            label: "Address",
            value:
                profile.address ||
                "Not Provided",
        },
        {
            icon: GraduationCap,
            label: "Education",
            value:
                studentProfile.education ||
                "Not Provided",
        },
    ];

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                    Profile Overview
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Your basic personal information.
                </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                {overviewItems.map(
                    ({
                         icon: Icon,
                         label,
                         value,
                     }) => (
                        <div
                            key={label}
                            className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                        >
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500/10">
                                <Icon className="h-5 w-5 text-orange-500" />
                            </div>

                            <p className="text-sm text-slate-400">
                                {label}
                            </p>

                            <p className="mt-1 warp-break-word font-medium text-white">
                                {value}
                            </p>
                        </div>
                    )
                )}
            </div>
        </Card>
    );
}