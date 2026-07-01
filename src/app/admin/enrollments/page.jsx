"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import EnrollmentStats from "@/components/admin/enrollments/EnrollmentStats";
import EnrollmentToolbar from "@/components/admin/enrollments/EnrollmentToolbar";
import EnrollmentTable from "@/components/admin/enrollments/EnrollmentTable";

import {
  useEnrollments,
  useDeleteEnrollment,
} from "@/hooks/queries/admin/useEnrollments";

export default function AdminEnrollmentsPage() {
  const router = useRouter();

  const {
    data: enrollments = [],
    isLoading,
    isError,
    refetch,
  } = useEnrollments();

  const deleteEnrollmentMutation =
      useDeleteEnrollment();

  const [search, setSearch] =
      useState("");

  const filteredEnrollments =
      useMemo(() => {
        return enrollments.filter(
            (enrollment) => {
              const studentName =
                  enrollment.student?.user?.name?.toLowerCase() ||
                  "";

              const studentEmail =
                  enrollment.student?.user?.email?.toLowerCase() ||
                  "";

              const courseTitle =
                  enrollment.course?.title?.toLowerCase() ||
                  "";

              const keyword =
                  search.toLowerCase();

              return (
                  studentName.includes(
                      keyword
                  ) ||
                  studentEmail.includes(
                      keyword
                  ) ||
                  courseTitle.includes(
                      keyword
                  )
              );
            }
        );
      }, [
        enrollments,
        search,
      ]);

  const handleDelete =
      async (
          enrollment
      ) => {
        const confirmed =
            window.confirm(
                `Delete enrollment for "${enrollment.student?.user?.name}"?`
            );

        if (!confirmed) return;

        try {
          await deleteEnrollmentMutation.mutateAsync(
              enrollment.id
          );
        } catch (error) {
          console.error(error);
        }
      };

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
          Failed to load enrollments.
        </div>
    );
  }

  return (
      <div className="space-y-8">
        <PageHeader
            title="Enrollments"
            subtitle="Manage all course enrollments."
        />

        <EnrollmentStats
            enrollments={
              enrollments
            }
        />

        <Card>
          <EnrollmentToolbar
              search={search}
              onSearchChange={
                setSearch
              }
              onRefresh={refetch}
          />

          <EnrollmentTable
              enrollments={
                filteredEnrollments
              }
              onView={(
                  enrollment
              ) =>
                  router.push(
                      `/admin/students/${enrollment.studentId}`
                  )
              }
              onDelete={
                handleDelete
              }
          />
        </Card>
      </div>
  );
}