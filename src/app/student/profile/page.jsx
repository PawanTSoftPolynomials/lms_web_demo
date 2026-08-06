"use client";

import { useState } from "react";

import { UserX } from "lucide-react";

import Loader from "@/components/common/Loader";
<<<<<<< HEAD
import EmptyState from "@/components/ui/EmptyState";
import MobileProfileView from "@/components/student/profile/MobileProfileView";
import MobileEditProfileView from "@/components/student/profile/MobileEditProfileView";
import DesktopEditProfileView from "@/components/student/profile/DesktopEditProfileView";
=======
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import ProfileHeader from "@/components/student/profile/ProfileHeader";
import ProfileOverview from "@/components/student/profile/ProfileOverview";
import PersonalInformation from "@/components/student/profile/PersonalInformation";
import StudentInformation from "@/components/student/profile/StudentInformation";
import AcademicCareerInformation from "@/components/student/profile/AcademicCareerInformation";
import LearningPreferences from "@/components/student/profile/LearningPreferences";
import AccountInformation from "@/components/student/profile/AccountInformation";
import ProfileActions from "@/components/student/profile/ProfileActions";
import EditProfileModal from "@/components/student/profile/EditProfileModal";
>>>>>>> 3a2a149af33ddab1101f22c815a2cdd8a794cd7e

import useProfile from "@/hooks/queries/student/useProfile";

export default function StudentProfilePage() {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useProfile();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !profile) {
    return (
      <EmptyState
        icon={UserX}
        title="Unable to load profile"
        description="Please refresh the page or try again later."
      />
    );
  }

  return (
<<<<<<< HEAD
    <>
      {/* Mobile: compact, reorganized layout */}
      <div className="sm:hidden">
        <MobileProfileView
          profile={profile}
          onEdit={() => setIsEditModalOpen(true)}
=======
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

          <AcademicCareerInformation
              profile={profile}
          />

          <LearningPreferences
              profile={profile}
          />

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
>>>>>>> 3a2a149af33ddab1101f22c815a2cdd8a794cd7e
        />
      </div>

      {/* Desktop / Tablet: Premium 2-Column Edit Profile Layout matching mockup */}
      <div className="hidden sm:block">
        <DesktopEditProfileView profile={profile} onRefresh={refetch} />
      </div>

      {/* Mobile Edit Profile View */}
      <MobileEditProfileView
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
      />
    </>
  );
}