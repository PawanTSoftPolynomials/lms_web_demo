"use client";

import {
    Edit,
    KeyRound,
    RefreshCw,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ProfileActions({
                                           onEdit,
                                           onRefresh,
                                           isRefreshing = false,
                                       }) {
    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                    Account Actions
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Manage your profile and account settings.
                </p>
            </div>

            <div className="flex flex-wrap gap-4">
                <Button
                    onClick={onEdit}
                    className="flex items-center gap-2"
                >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                </Button>

                <Button
                    disabled
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600"
                >
                    <KeyRound className="h-4 w-4" />
                    Change Password
                </Button>

                <Button
                    onClick={onRefresh}
                    loading={isRefreshing}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Profile
                </Button>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-4">
                <h3 className="mb-2 text-sm font-semibold text-white">
                    Coming Soon
                </h3>

                <p className="text-sm text-slate-400">
                    Profile editing and password management will be enabled
                    once the required backend APIs are available.
                </p>
            </div>
        </Card>
    );
}