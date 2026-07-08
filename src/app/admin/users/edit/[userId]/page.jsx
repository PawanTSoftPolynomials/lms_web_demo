"use client";

import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import UserForm from "@/components/admin/users/UserForm";

import { useUser, useUpdateUser } from "@/hooks/queries/admin/useUsers";

export default function EditUserPage() {
  const router = useRouter();
  const { userId } = useParams();

  const { data: user, isLoading, isError } = useUser(userId);

  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (formData) => {
    try {
      await updateUserMutation.mutateAsync({
        userId,
        userData: formData,
      });

      router.push("/admin/users");
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !user) {
    return (
      <div className="py-24 text-center text-red-500">Failed to load user.</div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Edit User" subtitle="Update user information." />

      <UserForm
        initialValues={user}
        onSubmit={handleSubmit}
        isSubmitting={updateUserMutation.isPending}
      />
    </div>
  );
}
