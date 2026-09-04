"use client";

import { useState, useEffect } from "react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useUpdateUserRole } from "@/hooks/queries/admin/useUsers";
import { useConfirm, useAlert } from "@/context/ConfirmContext";

const ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN", "GUEST"];

export default function ChangeRoleModal({ open, onClose, user }) {
    const confirm = useConfirm();
    const alert = useAlert();
    const updateRoleMutation = useUpdateUserRole();

    const [selectedRole, setSelectedRole] = useState(
        user?.currentRole || "STUDENT"
    );

    useEffect(() => {
        if (open) {
            setSelectedRole(user?.currentRole || "STUDENT");
        }
    }, [open, user]);

    if (!user) return null;

    const hasChanged = selectedRole !== user.currentRole;

    const handleSave = async () => {
        if (!hasChanged) {
            onClose?.();
            return;
        }

        const confirmed = await confirm({
            title: "Change User Role",
            message: `Change "${user.name}" from ${user.currentRole} to ${selectedRole}? This immediately changes what they can access in the app.`,
            confirmText: "Change Role",
            cancelText: "Cancel",
        });

        if (!confirmed) return;

        try {
            await updateRoleMutation.mutateAsync({
                userId: user.userId,
                role: selectedRole,
            });

            onClose?.();
            await alert({
                title: "Role Updated",
                message: `${user.name} is now ${selectedRole}.`,
            });
        } catch (error) {
            await alert({
                title: "Failed to Change Role",
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong. Please try again.",
            });
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Change User Role" size="sm">
            <div className="space-y-5">
                <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-400">
                        Role
                    </label>

                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full rounded-lg border border-transparent bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                    >
                        {ROLES.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>

                    {hasChanged && (
                        <p className="mt-2 text-xs text-amber-400">
                            This changes {user.name}&apos;s access from {user.currentRole} to {selectedRole}.
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSave}
                        loading={updateRoleMutation.isPending}
                        disabled={!hasChanged && !updateRoleMutation.isPending}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
