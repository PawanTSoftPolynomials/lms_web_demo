"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaUserGraduate,
  FaUserCheck,
  FaUserClock,
  FaEnvelope,
} from "react-icons/fa";

import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import Button from "@/components/ui/Button";
import { getStudents } from "@/services/student.service";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);

      const response = await getStudents();

      setStudents(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);
  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.status === "ACTIVE",
  ).length;

  const inactiveStudents = students.filter(
    (student) => student.status === "INACTIVE",
  ).length;
  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      `${student.user.name} ${student.user.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [students, search]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Students" subtitle="Manage student accounts" />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Students"
          value={totalStudents}
          icon={FaUserGraduate}
          color="blue"
        />

        <DashboardStatCard
          title="Active"
          value={activeStudents}
          icon={FaUserCheck}
          color="green"
        />

        <DashboardStatCard
          title="Inactive"
          value={inactiveStudents}
          icon={FaUserClock}
          color="red"
        />

        <DashboardStatCard
          title="Emails"
          value={students.length}
          icon={FaEnvelope}
          color="purple"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Student Directory</h2>

            <p className="mt-1 text-slate-400">Search and browse students.</p>
          </div>
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-sm"
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="
      mx-auto
      mb-5
      flex
      h-16
      w-16
      items-center
      justify-center
      rounded-full
      bg-slate-800
    "
            >
              🎓
            </div>

            <h3 className="text-xl font-semibold">No Students Found</h3>

            <p className="mt-2 text-slate-400">Try another search term.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                hover
                className="
    border
    border-slate-800
    transition-all
    duration-300
    hover:border-orange-500/30
  "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
      flex
      h-14
      w-14
      items-center
      justify-center
      rounded-full
      bg-orange-500/10
      text-xl
      font-bold
      text-orange-400
    "
                  >
                    {student.user.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      {student.user.name}
                    </h2>

                    <p className="text-sm text-slate-400">
                      {student.user.email}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span
                    className={`
      rounded-full
      px-3
      py-1
      text-xs
      font-semibold
      ${
        student.status === "ACTIVE"
          ? "bg-green-500/10 text-green-400"
          : "bg-red-500/10 text-red-400"
      }
    `}
                  >
                    {student.user.status}
                  </span>

                  <Link href={`/admin/students/${student.id}`}>
                    <Button size="sm">View Profile</Button>
                  </Link>
                </div>{" "}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
