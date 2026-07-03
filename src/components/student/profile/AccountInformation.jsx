"use client";

import {
    Shield,
    BadgeCheck,
    CalendarDays,
    UserCog,
} from "lucide-react";

import Card from "@/components/ui/Card";

function InfoItem({
                      icon: Icon,
                      label,
                      value,
                      valueClassName = "text-white",
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

            <p
                className={`warp-break-word text-base font-medium ${valueClassName}`}
            >
                {value}
            </p>
        </div>
    );
}

export default function AccountInformation({
                                               profile,
                                           }) {
    if (!profile) return null;

    const joinedDate = profile.createdAt
        ? new Date(
            profile.createdAt
        ).toLocaleDateString()
        : "Not Available";

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                    Account Information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Details about your LMS account.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <InfoItem
                    icon={UserCog}
                    label="Role"
                    value={profile.role}
                />

                <InfoItem
                    icon={Shield}
                    label="Account Status"
                    value={profile.status}
                    valueClassName={
                        profile.status === "ACTIVE"
                            ? "text-emerald-400"
                            : "text-red-400"
                    }
                />

                <InfoItem
                    icon={BadgeCheck}
                    label="Verification"
                    value={
                        profile.isVerified
                            ? "Verified"
                            : "Not Verified"
                    }
                    valueClassName={
                        profile.isVerified
                            ? "text-blue-400"
                            : "text-yellow-400"
                    }
                />

                <InfoItem
                    icon={CalendarDays}
                    label="Joined On"
                    value={joinedDate}
                />
            </div>
        </Card>
    );
}