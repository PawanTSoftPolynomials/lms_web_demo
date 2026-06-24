"use client";

import { useEffect, useState } from "react";

import {
  getEnrollments,
  deleteEnrollment,
} from "@/services/enrollment.service";

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] =
    useState([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
  const fetchEnrollments =
    async () => {
      try {
        const data =
          await getEnrollments();

        setEnrollments(data);
      } catch (error) {
        console.error(error);
      }
    };

  fetchEnrollments();
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

        alert(
          "Enrollment removed successfully"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to remove enrollment"
        );
      }
    };

  const filteredEnrollments =
    enrollments.filter(
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

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Enrollments
          </h1>

          <p className="text-slate-400 mt-1">
            Manage course enrollments
          </p>
        </div>

        <div className="bg-slate-800 px-4 py-2 rounded-lg">
          Total Enrollments:{" "}
          {enrollments.length}
        </div>

      </div>

      <input
        type="text"
        placeholder="Search student or course..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="
          w-full
          bg-slate-800
          rounded-lg
          p-3
        "
      />

      <div className="bg-slate-900 rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-slate-800">

                <th className="text-left p-4">
                  Student
                </th>

                <th className="text-left p-4">
                  Email
                </th>

                <th className="text-left p-4">
                  Course
                </th>

                <th className="text-left p-4">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredEnrollments.map(
                (
                  enrollment
                ) => (
                  <tr
                    key={
                      enrollment.id
                    }
                    className="border-b border-slate-800"
                  >
                    <td className="p-4">
                      {
                        enrollment
                          .user
                          ?.name
                      }
                    </td>

                    <td className="p-4">
                      {
                        enrollment
                          .user
                          ?.email
                      }
                    </td>

                    <td className="p-4">
                      {
                        enrollment
                          .course
                          ?.title
                      }
                    </td>

                    <td className="p-4">

                      <button
                        onClick={() =>
                          handleDelete(
                            enrollment.id
                          )
                        }
                        className="
                          bg-red-600
                          px-3
                          py-2
                          rounded
                        "
                      >
                        Remove
                      </button>

                    </td>
                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}