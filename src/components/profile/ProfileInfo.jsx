"use client";

import {
    Building2,
    Briefcase,
    Calendar,
    Shield,
    MapPin,
    Phone,
} from "lucide-react";

import Card from "@/components/ui/Card";

function InfoItem({
                      icon,
                      label,
                      value,
                  }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-orange-500">
                {icon}

                <span className="text-sm font-medium">
          {label}
        </span>
            </div>

            <p className="text-gray-300 break-all">
                {value || "-"}
            </p>
        </div>
    );
}

export default function ProfileInfo({
                                        profile,
                                    }) {
    if (!profile) return null;

    return (
        <Card>
            <h2 className="mb-6 text-2xl font-semibold text-white">
                Profile Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
                <InfoItem
                    icon={<Phone size={18} />}
                    label="Phone Number"
                    value={
                        profile.phoneNumber
                    }
                />

                <InfoItem
                    icon={<MapPin size={18} />}
                    label="Address"
                    value={profile.address}
                />

                <InfoItem
                    icon={
                        <Building2 size={18} />
                    }
                    label="Department"
                    value={
                        profile.adminProfile
                            ?.department
                    }
                />

                <InfoItem
                    icon={
                        <Briefcase size={18} />
                    }
                    label="Designation"
                    value={
                        profile.adminProfile
                            ?.designation
                    }
                />

                <InfoItem
                    icon={<Shield size={18} />}
                    label="Permissions"
                    value={
                        profile
                            .adminProfile
                            ?.permissions
                            ?.length
                            ? profile.adminProfile.permissions.join(
                                ", "
                            )
                            : "No Permissions"
                    }
                />

                <InfoItem
                    icon={
                        <Calendar size={18} />
                    }
                    label="Account Created"
                    value={new Date(
                        profile.createdAt
                    ).toLocaleString()}
                />
            </div>
        </Card>
    );
}