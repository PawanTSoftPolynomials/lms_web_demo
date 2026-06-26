"use client";

import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import ActionMenu from "@/components/menus/ActionMenu";

import {
  getEnrollments,
  deleteEnrollment,
} from "@/services/enrollment.service";

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const loadEnrollments =
    async () => {
      try {
        setLoading(true);

        const data =
          await getEnrollments();

        setEnrollments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const handleDelete =
    async (enrollmentId) => {
      const confirmed =
        window.confirm(
          "Remove this enrollment?"
        );

      if (!confirmed) return;

      try {
        await deleteEnrollment(
          enrollmentId
        );

        await loadEnrollments();
      } catch (error) {
        console.error(error);

        alert(
          "Failed to remove enrollment."
        );
      }
    };

  const filteredEnrollments =
    useMemo(() => {
      return enrollments.filter(
        (enrollment) =>
          enrollment.user?.name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          enrollment.user?.email
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          enrollment.course?.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [enrollments, search]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Enrollments"
        subtitle="Manage course enrollments"
      />

      <Card>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <Input
            placeholder="Search student or course..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="md:max-w-sm"
          />

          <div className="text-sm text-slate-400">
            Total Enrollments
            <span className="ml-2 font-semibold text-white">
              {
                filteredEnrollments.length
              }
            </span>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-slate-800 text-left text-slate-400">

                <th className="p-4">
                  Student
                </th>

                <th className="p-4">
                  Email
                </th>

                <th className="p-4">
                  Course
                </th>

                <th className="p-4 w-20">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredEnrollments.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={4}
                    className="p-10 text-center text-slate-400"
                  >
                    No enrollments found.
                  </td>

                </tr>

              ) : (

                filteredEnrollments.map(
                  (
                    enrollment
                  ) => (

                    <tr
                      key={
                        enrollment.id
                      }
                      className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                    >

                      <td className="p-4">
                        {
                          enrollment.user
                            ?.name
                        }
                      </td>

                      <td className="p-4 text-slate-300">
                        {
                          enrollment.user
                            ?.email
                        }
                      </td>

                      <td className="p-4">
                        {
                          enrollment.course
                            ?.title
                        }
                      </td>

                      <td className="p-4">

                        <ActionMenu
                          items={[
                            {
                              label:
                                "Remove",
                              onClick:
                                () =>
                                  handleDelete(
                                    enrollment.id
                                  ),
                            },
                          ]}
                        />

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}