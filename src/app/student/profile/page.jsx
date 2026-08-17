"use client";

import { useState } from "react";

import { UserX } from "lucide-react";

import Loader from "@/components/common/Loader";
import EmptyState from "@/components/ui/EmptyState";
import MobileProfileView from "@/components/student/profile/MobileProfileView";
import MobileEditProfileView from "@/components/student/profile/MobileEditProfileView";
import DesktopEditProfileView from "@/components/student/profile/DesktopEditProfileView";

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
    <>
      {/* Mobile: compact, reorganized layout */}
      <div className="sm:hidden">
        <MobileProfileView
          profile={profile}
          onEdit={() => setIsEditModalOpen(true)}
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