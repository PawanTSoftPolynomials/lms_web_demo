"use client";

import { useState } from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import ProfileHeader from "@/components/student/profile/ProfileHeader";
import ProfileOverview from "@/components/student/profile/ProfileOverview";
import PersonalInformation from "@/components/student/profile/PersonalInformation";
import StudentInformation from "@/components/student/profile/StudentInformation";
import AccountInformation from "@/components/student/profile/AccountInformation";
import ProfileActions from "@/components/student/profile/ProfileActions";
import EditProfileModal from "@/components/student/profile/EditProfileModal";

import useProfile from "@/hooks/queries/student/useProfile";

export default function StudentProfilePage() {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useProfile();

  const [isEditModalOpen, setIsEditModalOpen] =
      useState(false);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !profile) {
    return (
        <Card className="p-10 text-center">
          <h2 className="text-xl font-semibold text-white">
            Unable to load profile
          </h2>

          <p className="mt-2 text-slate-400">
            Please refresh the page or try again later.
          </p>
        </Card>
    );
  }

  return (
      <>
        <div className="space-y-8">
          <PageHeader
              title="My Profile"
              subtitle="View and manage your personal information."
          />

          <ProfileHeader
              profile={profile}
          />

          <ProfileOverview
              profile={profile}
          />

          <div className="grid gap-8 xl:grid-cols-2">
            <PersonalInformation
                profile={profile}
            />

            <StudentInformation
                profile={profile}
            />
          </div>

          <AccountInformation
              profile={profile}
          />

          <ProfileActions
              onRefresh={refetch}
              isRefreshing={isRefetching}
              onEdit={() =>
                  setIsEditModalOpen(true)
              }
          />
        </div>

        <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() =>
                setIsEditModalOpen(false)
            }
            profile={profile}
        />
      </>
  );
}