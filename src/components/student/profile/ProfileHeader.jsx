"use client";

import {
    CheckCircle2,
    Shield,
    User,
} from "lucide-react";

import Card from "@/components/ui/Card";
import UserAvatar from "@/components/admin/users/UserAvatar";

export default function ProfileHeader({
                                          profile,
                                      }) {
    if (!profile) return null;

    const {
        name,
        email,
        role,
        status,
        isVerified,
    } = profile;

    return (
        <Card className="overflow-hidden p-0">
            <div className="h-2 bg-linear-to-r from-orange-500 via-orange-400 to-amber-500"/>

            <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                    <UserAvatar
                        name={name}
                        image={profile.avatar}
                        size="lg"
                    />

                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {name}
                        </h1>

                        <p className="mt-1 text-slate-400">
                            {email}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
              <span
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400">
                <User className="h-4 w-4"/>
                  {role}
              </span>

                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                                    status === "ACTIVE"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-red-500/10 text-red-400"
                                }`}
                            >
                <Shield className="h-4 w-4"/>
                                {status}
              </span>

                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                                    isVerified
                                        ? "bg-blue-500/10 text-blue-400"
                                        : "bg-yellow-500/10 text-yellow-400"
                                }`}
                            >
                <CheckCircle2 className="h-4 w-4"/>

                                {isVerified
                                    ? "Verified"
                                    : "Not Verified"}
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}