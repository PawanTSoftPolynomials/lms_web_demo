"use client";

import {
    User,
    Mail,
    Phone,
    MapPin,
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

            <p className="break-words text-base font-medium text-white">
                {value || "Not Provided"}
            </p>
        </div>
    );
}

export default function PersonalInformation({
                                                profile,
                                            }) {
    if (!profile) return null;

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                    Personal Information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Your basic contact and identity details.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <InfoItem
                    icon={User}
                    label="Full Name"
                    value={profile.name}
                />

                <InfoItem
                    icon={Mail}
                    label="Email Address"
                    value={profile.email}
                />

                <InfoItem
                    icon={Phone}
                    label="Phone Number"
                    value={profile.phoneNumber}
                />

                <InfoItem
                    icon={MapPin}
                    label="Address"
                    value={profile.address}
                />
            </div>
        </Card>
    );
}