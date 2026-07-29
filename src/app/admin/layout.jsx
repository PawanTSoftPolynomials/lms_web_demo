"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";

export default function Layout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null; // Let the useEffect redirect
  }

  return (
    <DashboardLayout role="ADMIN" title="Admin Dashboard">
      {children}
    </DashboardLayout>
  );
}
