"use client";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import InstructorProfileView from "@/components/instructor/profile/InstructorProfileView";
import useProfile from "@/hooks/queries/student/useProfile";

export default function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();

  if (isLoading) {
    return (
      <Card className="p-12 border border-border bg-background/60 shadow-lg flex justify-center">
        <Loader />
      </Card>
    );
  }

  if (isError || !profile) {
    return (
      <Card className="p-10 text-center border border-border bg-background/60">
        <h2 className="text-xl font-semibold text-foreground">Unable to load profile</h2>
        <p className="mt-2 text-muted-foreground">Please refresh the page or try again later.</p>
      </Card>
    );
  }

  return <InstructorProfileView profile={profile} onRefresh={refetch} />;
}