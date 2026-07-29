"use client";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";

import ProfileCard from "@/components/profile/ProfileCard";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileForm from "@/components/profile/ProfileForm";

import { useProfile } from "@/hooks/queries/admin/useProfile";
import useUpdateProfile from "@/hooks/queries/student/useUpdateProfile";

export default function AdminProfilePage() {
  const {
    data: profile,
    isLoading,
    isError,
  } = useProfile();

  const updateProfileMutation = useUpdateProfile();

  const handleUpdateProfile = async (formData) => {
    try {
      await updateProfileMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center py-24">
          <Loader />
        </div>
    );
  }

  if (isError || !profile) {
    return (
        <div className="py-24 text-center text-red-500">
          Failed to load profile.
        </div>
    );
  }

  return (
      <div className="space-y-8">
        <PageHeader
            title="My Profile"
            subtitle="View your account information."
        />

        <div className="grid gap-8 lg:grid-cols-3">
          <div>
            <ProfileCard
                profile={profile}
            />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <ProfileInfo
                profile={profile}
            />

            <ProfileForm
                profile={profile}
                onSubmit={handleUpdateProfile}
                isSubmitting={updateProfileMutation.isPending}
            />

            {updateProfileMutation.isSuccess && (
                <p className="text-sm font-semibold text-emerald-400">
                  Profile updated successfully.
                </p>
            )}

            {updateProfileMutation.isError && (
                <p className="text-sm font-semibold text-red-400">
                  {updateProfileMutation.error?.response?.data?.message ||
                    "Failed to update profile."}
                </p>
            )}
          </div>
        </div>
      </div>
  );
}