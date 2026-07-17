"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import { useRouter } from "next/navigation";

import UserStats from "@/components/admin/users/UserStats";
import UserToolbar from "@/components/admin/users/UserToolbar";
import UserTable from "@/components/admin/users/UserTable";

import { useUsers, useDeleteUser } from "@/hooks/queries/admin/useUsers";
import { useConfirm } from "@/context/ConfirmContext";

export default function AdminUsersPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const { data: users = [], isLoading, isError, refetch } = useUsers();

  const deleteUserMutation = useDeleteUser();

  const [search, setSearch] = useState("");

  const [role, setRole] = useState("");

  const [status, setStatus] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = !role || user.role === role;

      const matchesStatus = !status || user.status === status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, role, status]);

  const handleDelete = async (user) => {
    const confirmed = await confirm({
      title: "Delete User",
      message: `Are you sure you want to delete the user "${user.name}"?`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (!confirmed) return;

    await deleteUserMutation.mutateAsync(user.id);
    refetch();
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div className="text-red-500">Failed to load users.</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        subtitle="Manage all users across the platform."
      />

      <UserStats users={users} />

      <Card>
        <UserToolbar
          search={search}
          onSearchChange={setSearch}
          role={role}
          onRoleChange={setRole}
          status={status}
          onStatusChange={setStatus}
          onRefresh={refetch}
        />

        <UserTable
          users={filteredUsers}
          onEdit={(user) => router.push(`/admin/users/edit/${user.id}`)}
          onView={(user) => router.push(`/admin/users/${user.id}`)}
          onDelete={handleDelete}
        />
      </Card>
    </div>
  );
}
