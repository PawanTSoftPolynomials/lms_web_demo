"use client";

import { X } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function EditProfileModal({
                                             isOpen,
                                             onClose,
                                             profile,
                                         }) {
    if (!isOpen) return null;

    const student =
        profile?.studentProfile || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                    <h2 className="text-2xl font-bold text-white">
                        Edit Profile
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="grid gap-5 p-6 md:grid-cols-2">
                    <Input
                        label="Full Name"
                        value={profile?.name || ""}
                        disabled
                    />

                    <Input
                        label="Email"
                        value={profile?.email || ""}
                        disabled
                    />

                    <Input
                        label="Phone Number"
                        value={profile?.phoneNumber || ""}
                        disabled
                    />

                    <Input
                        label="Address"
                        value={profile?.address || ""}
                        disabled
                    />

                    <Input
                        label="Education"
                        value={student.education || ""}
                        disabled
                    />

                    <Input
                        label="Guardian Name"
                        value={
                            student.guardianName || ""
                        }
                        disabled
                    />
                </div>

                {/* Footer */}
                <div className="border-t border-slate-800 px-6 py-5">
                    <div className="mb-5 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">
                            Profile editing is currently unavailable.
                            This modal is ready and will be connected
                            once the backend provides an authenticated
                            update profile endpoint.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={onClose}
                            className="bg-slate-700 hover:bg-slate-600"
                        >
                            Close
                        </Button>

                        <Button disabled>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}