"use client";

import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import ActionMenu from "@/components/menus/ActionMenu";
import {
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
} from "react-icons/fa";

import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";
import {
  getUsers,
  deleteUser,
  updateUserRole,
  updateUserStatus,
} from "@/services/user.service";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(id);
    await loadUsers();
  };

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, role);
    await loadUsers();
  };

  const handleStatusChange = async (id, status) => {
    await updateUserStatus(id, status);
    await loadUsers();
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "STUDENT").length,
    instructors: users.filter((u) => u.role === "INSTRUCTOR").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  const roleClass = (role) =>
    role === "ADMIN"
      ? "bg-red-500/10 text-red-400"
      : role === "INSTRUCTOR"
        ? "bg-purple-500/10 text-purple-400"
        : "bg-green-500/10 text-green-400";

  const statusClass = (status) =>
    status === "ACTIVE"
      ? "bg-green-500/10 text-green-400"
      : "bg-red-500/10 text-red-400";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage platform users and permissions"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total Users"
          value={stats.total}
          icon={<FaUsers />}
          color="blue"
        />
        <DashboardStatCard
          title="Students"
          value={stats.students}
          icon={<FaUserGraduate />}
          color="green"
        />
        <DashboardStatCard
          title="Instructors"
          value={stats.instructors}
          icon={<FaChalkboardTeacher />}
          color="purple"
        />
        <DashboardStatCard
          title="Admins"
          value={stats.admins}
          icon={<FaUserShield />}
          color="orange"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">User Directory</h2>
            <p className="mt-1 text-slate-400">
              Search and manage user accounts.
            </p>
          </div>

          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 lg:w-96"
          />
        </div>

        <div className="space-y-4 p-4 lg:hidden">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold">{user.name}</div>
                  <div className="break-all text-sm text-slate-400">
                    {user.email}
                  </div>
                  <div className="text-xs text-slate-500">{user.id}</div>
                </div>

                <ActionMenu
                  items={[
                    {
                      label: "Delete User",
                      onClick: () => handleDelete(user.id),
                    },
                  ]}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${roleClass(user.role)}`}
                >
                  {user.role}
                </span>

                <ActionMenu
                  items={[
                    {
                      label: "Make Admin",
                      onClick: () => handleRoleChange(user.id, "ADMIN"),
                    },
                    {
                      label: "Make Instructor",
                      onClick: () => handleRoleChange(user.id, "INSTRUCTOR"),
                    },
                    {
                      label: "Make Student",
                      onClick: () => handleRoleChange(user.id, "STUDENT"),
                    },
                  ]}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(user.status)}`}
                >
                  {user.status}
                </span>

                <ActionMenu
                  items={[
                    {
                      label: "Activate",
                      onClick: () => handleStatusChange(user.id, "ACTIVE"),
                    },
                    {
                      label: "Deactivate",
                      onClick: () => handleStatusChange(user.id, "INACTIVE"),
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto px-6 pb-6 lg:block">
          <table className="min-w-[900px] w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${roleClass(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <ActionMenu
                      items={[
                        {
                          label: "Delete User",
                          onClick: () => handleDelete(user.id),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
