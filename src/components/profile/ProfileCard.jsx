"use client";

import {
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    CheckCircle,
} from "lucide-react";

import Card from "@/components/ui/Card";

export default function ProfileCard({
                                        profile,
                                    }) {
    if (!profile) return null;

    return (
        <Card>
            <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div
                    className="flex h-28 w-28 items-center justify-center rounded-full bg-orange-600 text-4xl font-bold text-white">
                    {profile.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                </div>

                {/* Name */}
                <h2 className="mt-5 text-2xl font-bold text-white">
                    {profile.name}
                </h2>

                {/* Role */}
                <span className="mt-2 rounded-full bg-orange-500/20 px-4 py-1 text-sm font-medium text-orange-400">
          {profile.role}
        </span>

                {/* Status */}
                <div className="mt-5 flex flex-wrap justify-center gap-3">
          <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                  profile.status ===
                  "ACTIVE"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
              }`}
          >
            {profile.status}
          </span>

                    <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                            profile.isVerified
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}
                    >
            <CheckCircle size={15}/>

                        {profile.isVerified
                            ? "Verified"
                            : "Not Verified"}
          </span>
                </div>

                {/* Information */}
                <div className="mt-8 w-full space-y-4 border-t border-white/10 pt-6">
                    <div className="flex items-center gap-3">
                        <Mail
                            size={18}
                            className="text-orange-500"
                        />

                        <span className="text-gray-300">
              {profile.email}
            </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Phone
                            size={18}
                            className="text-orange-500"
                        />

                        <span className="text-gray-300">
              {profile.phoneNumber ||
                  "-"}
            </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin
                            size={18}
                            className="text-orange-500"
                        />

                        <span className="text-gray-300">
              {profile.address ||
                  "-"}
            </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ShieldCheck
                            size={18}
                            className="text-orange-500"
                        />

                        <span className="text-gray-300">
              {profile.role}
            </span>
                    </div>

                    <div className="pt-4 text-sm text-gray-500">
                        Member since{" "}
                        {new Date(
                            profile.createdAt
                        ).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </Card>
    );
}