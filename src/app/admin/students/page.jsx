"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import StudentStats from "@/components/admin/student/StudentStats";
import StudentToolbar from "@/components/admin/student/StudentToolbar";
import StudentTable from "@/components/admin/student/StudentTable";
import ChangeRoleModal from "@/components/admin/users/ChangeRoleModal";

import {
    useStudents,
} from "@/hooks/queries/admin/useStudents";
import { useDeleteUser } from "@/hooks/queries/admin/useUsers";
import { useConfirm } from "@/context/ConfirmContext";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function AdminStudentsPage() {
    const router = useRouter();
    const confirm = useConfirm();
    const queryClient = useQueryClient();

    const {
        data: students = [],
        isLoading,
        isError,
        refetch,
    } = useStudents();

    const deleteUserMutation = useDeleteUser();

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [roleModalTarget, setRoleModalTarget] =
        useState(null);

    const filteredStudents =
        useMemo(() => {
            return students.filter(
                (student) => {
                    const matchesSearch =
                        student.name
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        student.email
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            );

                    const matchesStatus =
                        !status ||
                        student.status ===
                        status;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            students,
            search,
            status,
        ]);

    const handleDelete = async (student) => {
        const confirmed = await confirm({
            title: "Delete Student",
            message: `Are you sure you want to delete "${student.name}"? This permanently removes their account and all associated data.`,
            confirmText: "Delete",
            cancelText: "Cancel",
        });

        if (!confirmed) return;

        try {
            await deleteUserMutation.mutateAsync(student.userId);

            // Reflect the deletion immediately instead of waiting on a slow
            // refetch of this endpoint's heavier per-student computation.
            queryClient.setQueryData(
                [QUERY_KEYS.ADMIN_STUDENTS],
                (old = []) => old.filter((s) => s.id !== student.id)
            );
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-24">
                <Loader/>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-24 text-center text-red-500">
                Failed to load students.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Students"
                subtitle="Manage all registered students."
            />

            <StudentStats
                students={students}
            />

            <Card tone="flat">
                <StudentToolbar
                    search={search}
                    onSearchChange={
                        setSearch
                    }
                    status={status}
                    onStatusChange={
                        setStatus
                    }
                    onRefresh={refetch}
                />

                <StudentTable
                    students={
                        filteredStudents
                    }
                    onView={(student) =>
                        router.push(
                            `/admin/students/${student.id}`
                        )
                    }
                    onDelete={handleDelete}
                    onChangeRole={setRoleModalTarget}
                />
            </Card>

            <ChangeRoleModal
                open={!!roleModalTarget}
                onClose={() => setRoleModalTarget(null)}
                user={
                    roleModalTarget && {
                        userId: roleModalTarget.userId,
                        name: roleModalTarget.name,
                        email: roleModalTarget.email,
                        currentRole: "STUDENT",
                    }
                }
            />
        </div>
    );
}