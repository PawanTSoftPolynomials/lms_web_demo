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
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await getEnrollments();
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

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this enrollment?")) return;

    try {
      await deleteEnrollment(id);
      await loadEnrollments();
    } catch (error) {
      console.error(error);
      alert("Failed to remove enrollment.");
    }
  };

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(
      (enrollment) =>
        enrollment.student?.user?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        enrollment.student?.user?.email
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        enrollment.course?.title?.toLowerCase().includes(search.toLowerCase()),
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
      <PageHeader title="Enrollments" subtitle="Manage course enrollments" />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 lg:w-96"
          />

          <div className="text-sm text-slate-400">
            Total Enrollments
            <span className="ml-2 font-semibold text-white">
              {filteredEnrollments.length}
            </span>
          </div>
        </div>

        <div className="space-y-4 py-6 lg:hidden">
          {filteredEnrollments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No enrollments found.
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition hover:border-orange-500/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div
                      className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-orange-500/10
                font-semibold
                text-orange-400
              "
                    >
                      {enrollment.student?.user?.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white">
                        {enrollment.student?.user?.name}
                      </h3>

                      <p className="mt-1 break-all text-sm text-slate-400">
                        {enrollment.student?.user?.email}
                      </p>
                    </div>
                  </div>

                  <ActionMenu
                    items={[
                      {
                        label: "Remove",
                        onClick: () => handleDelete(enrollment.id),
                      },
                    ]}
                  />
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Course
                  </p>

                  <p className="mt-2 font-medium text-slate-200">
                    {enrollment.course?.title}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto px-6 pb-6 lg:block">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">Course</th>
                <th className="w-20 p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-400">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="border-b border-slate-800 transition hover:bg-slate-800/40"
                  >
                    <td className="p-4">{enrollment.student?.user?.name}</td>
                    <td className="p-4 text-slate-300">
                      {enrollment.student?.user?.email}
                    </td>
                    <td className="p-4">{enrollment.course?.title}</td>
                    <td className="p-4">
                      <ActionMenu
                        items={[
                          {
                            label: "Remove",
                            onClick: () => handleDelete(enrollment.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
