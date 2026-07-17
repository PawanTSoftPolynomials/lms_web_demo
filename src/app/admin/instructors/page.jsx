"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import InstructorStats from "@/components/admin/instructors/InstructorStats";
import InstructorToolbar from "@/components/admin/instructors/InstructorToolbar";
import InstructorTable from "@/components/admin/instructors/InstructorTable";

import { useInstructors } from "@/hooks/queries/admin/useInstructors";

export default function AdminInstructorsPage() {
    const router = useRouter();

    const {
        data: instructors = [],
        isLoading,
        isError,
        refetch,
    } = useInstructors();

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("");

    const filteredInstructors =
        useMemo(() => {
            return instructors.filter(
                (instructor) => {
                    const matchesSearch =
                        instructor.user.name
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        instructor.user.email
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        instructor.specialization
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        instructor.qualification
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            );

                    const matchesStatus =
                        !status ||
                        instructor.user.status ===
                        status;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            instructors,
            search,
            status,
        ]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-24">
                <Loader />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-24 text-center text-red-500">
                Failed to load instructors.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Instructors"
                subtitle="Manage all instructors."
            />

            <InstructorStats
                instructors={instructors}
            />

            <Card>
                <InstructorToolbar
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

                <InstructorTable
                    instructors={
                        filteredInstructors
                    }
                    onView={(
                        instructor
                    ) =>
                        router.push(
                            `/admin/instructors/${instructor.id}`
                        )
                    }
                    onEdit={(
                        instructor
                    ) =>
                        router.push(
                            `/admin/users/edit/${instructor.user.id}`
                        )
                    }
                    onDelete={(
                        instructor
                    ) =>
                        console.log(
                            "Delete Instructor:",
                            instructor
                        )
                    }
                />
            </Card>
        </div>
    );
}