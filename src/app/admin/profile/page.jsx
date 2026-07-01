"use client";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";

import ProfileCard from "@/components/profile/ProfileCard";
import ProfileInfo from "@/components/profile/ProfileInfo";

import { useProfile } from "@/hooks/queries/admin/useProfile";

export default function AdminProfilePage() {
  const {
    data: profile,
    isLoading,
    isError,
  } = useProfile();

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

          <div className="lg:col-span-2">
            <ProfileInfo
                profile={profile}
            />
          </div>
        </div>

        {/* Render ProfileForm here when
          the backend provides an
          update profile API */}
      </div>
  );
}