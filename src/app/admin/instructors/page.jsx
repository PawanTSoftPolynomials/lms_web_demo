"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaChalkboardTeacher,
  FaUserCheck,
  FaUserClock,
  FaEnvelope,
} from "react-icons/fa";

import DashboardStatCard from "@/components/dashboard/DashboardStatCard";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import Button from "@/components/ui/Button";

import { getUsers } from "@/services/user.service";

export default function InstructorsPage() {
  const [instructors, setInstructors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const loadInstructors =
    async () => {
      try {
        setLoading(true);

        const users =
          await getUsers();

        setInstructors(
          users.filter(
            (user) =>
              user.role ===
              "INSTRUCTOR"
          )
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadInstructors();
  }, []);

  const filteredInstructors =
    useMemo(() => {
      return instructors.filter(
        (instructor) =>
          `${instructor.name} ${instructor.email}`
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [instructors, search]);

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
        title="Instructors"
        subtitle="Manage all instructors"
      />

      <Card>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <Input
            placeholder="Search instructors..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="md:max-w-sm"
          />

          <div className="text-sm text-slate-400">
            Total Instructors
            <span className="ml-2 font-semibold text-white">
              {
                filteredInstructors.length
              }
            </span>
          </div>

        </div>

        {filteredInstructors.length ===
        0 ? (

          <div className="py-12 text-center text-slate-400">
            No instructors found.
          </div>

        ) : (

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {filteredInstructors.map(
              (
                instructor
              ) => (

                <Card
                  key={
                    instructor.id
                  }
                  hover
                  className="border border-slate-800"
                >

                  <h2 className="text-xl font-semibold">
                    {
                      instructor.name
                    }
                  </h2>

                  <p className="mt-2 text-slate-400">
                    {
                      instructor.email
                    }
                  </p>

                  <div className="mt-6">

                    <Link
                      href={`/admin/users/${instructor.id}`}
                    >
                      <Button size="sm">
                        View Profile
                      </Button>
                    </Link>

                  </div>

                </Card>

              )
            )}

          </div>

        )}

      </Card>

    </div>
  );
}