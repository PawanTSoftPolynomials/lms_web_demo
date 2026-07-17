"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import StudentStats from "@/components/admin/student/StudentStats";
import StudentToolbar from "@/components/admin/student/StudentToolbar";
import StudentTable from "@/components/admin/student/StudentTable";

import {
    useStudents,
} from "@/hooks/queries/admin/useStudents";

export default function AdminStudentsPage() {
    const router = useRouter();

    const {
        data: students = [],
        isLoading,
        isError,
        refetch,
    } = useStudents();

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("");

    const filteredStudents =
        useMemo(() => {
            return students.filter(
                (student) => {
                    const matchesSearch =
                        student.user.name
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        student.user.email
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            );

                    const matchesStatus =
                        !status ||
                        student.user.status ===
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

            <Card>
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
                    onEdit={(student) =>
                        router.push(
                            `/admin/users/edit/${student.user.id}`
                        )
                    }
                    onDelete={(student) =>
                        console.log(
                            "Delete Student:",
                            student
                        )
                    }
                />
            </Card>
        </div>
    );
}