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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Delete this user?");

    if (!confirmed) return;

    try {
      await deleteUser(userId);

      await loadUsers();
    } catch (error) {
      console.error(error);

      alert("Failed to delete user.");
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);

      await loadUsers();
    } catch (error) {
      console.error(error);

      alert("Failed to update role.");
    }
  };

  const handleStatusChange = async (userId, status) => {
    try {
      await updateUserStatus(userId, status);

      await loadUsers();
    } catch (error) {
      console.error(error);

      alert("Failed to update status.");
    }
  };
  const totalUsers = users.length;

  const students = users.filter((user) => user.role === "STUDENT").length;

  const instructors = users.filter((user) => user.role === "INSTRUCTOR").length;

  const admins = users.filter((user) => user.role === "ADMIN").length;
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

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
        title="Users"
        subtitle="Manage platform users and permissions"
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total Users"
          value={totalUsers}
          icon={<FaUsers/>}
          color="blue"
        />

        <DashboardStatCard
          title="Students"
          value={students}
          icon={<FaUserGraduate/>}
          color="green"
        />

        <DashboardStatCard
          title="Instructors"
          value={instructors}
          icon={<FaChalkboardTeacher/>}
          color="purple"
        />

        <DashboardStatCard
          title="Admins"
          value={admins}
          icon={<FaUserShield/>}
          color="orange"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
            className="lg:w-96"
          />
        </div>

        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full">
            <thead>
              <tr
                className="
border-b
border-slate-800
transition-all
hover:bg-slate-800/30
"
              >
                <th className="p-4">Name</th>

                <th className="p-4">Email</th>

                <th className="p-4">Role</th>

                <th className="p-4">Status</th>

                <th className="p-4 w-20">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20">
                    <div className="text-center">
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
                        👤
                      </div>

                      <h3 className="text-xl font-semibold">No Users Found</h3>

                      <p className="mt-2 text-slate-400">
                        Try changing your search.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        bg-orange-500/10
        text-lg
        font-bold
        text-orange-400
      "
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {user.name}
                          </p>

                          <p className="text-xs text-slate-500">{user.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-slate-200">{user.email}</p>

                        <p className="text-xs text-slate-500">
                          Registered User
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`
      rounded-full
      px-3
      py-1
      text-xs
      font-semibold

      ${
        user.role === "ADMIN"
          ? "bg-red-500/10 text-red-400"
          : user.role === "INSTRUCTOR"
            ? "bg-purple-500/10 text-purple-400"
            : "bg-green-500/10 text-green-400"
      }
    `}
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
                              onClick: () =>
                                handleRoleChange(user.id, "INSTRUCTOR"),
                            },
                            {
                              label: "Make Student",
                              onClick: () =>
                                handleRoleChange(user.id, "STUDENT"),
                            },
                          ]}
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`
      rounded-full
      px-3
      py-1
      text-xs
      font-semibold

      ${
        user.status === "ACTIVE"
          ? "bg-green-500/10 text-green-400"
          : "bg-red-500/10 text-red-400"
      }
    `}
                        >
                          {user.status}
                        </span>

                        <ActionMenu
                          items={[
                            {
                              label: "Activate",
                              onClick: () =>
                                handleStatusChange(user.id, "ACTIVE"),
                            },
                            {
                              label: "Deactivate",
                              onClick: () =>
                                handleStatusChange(user.id, "INACTIVE"),
                            },
                          ]}
                        />
                      </div>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
