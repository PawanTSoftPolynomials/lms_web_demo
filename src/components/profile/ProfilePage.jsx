"use client";

import { useState } from "react";
import { Shield, Mail, Key, UserCheck, Lock } from "lucide-react";
import { changePassword } from "@/services/auth.service";
import useAuth from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import DesktopEditProfileView from "@/components/student/profile/DesktopEditProfileView";
import useProfile from "@/hooks/queries/student/useProfile";

export default function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();

  if (isLoading) {
    return (
      <Card className="p-12 border border-slate-800 bg-slate-900/60 shadow-lg flex justify-center">
        <Loader />
      </Card>
    );
  }

  if (isError || !profile) {
    return (
      <Card className="p-10 text-center border border-slate-800 bg-slate-900/60">
        <h2 className="text-xl font-semibold text-white">Unable to load profile</h2>
        <p className="mt-2 text-slate-400">Please refresh the page or try again later.</p>
      </Card>
    );
  }

  return <DesktopEditProfileView profile={profile} onRefresh={refetch} />;
}