"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { QaProvider } from "@/context/QaContext";
import Loader from "@/components/common/Loader";
import StudentDashboardNav from "@/components/layouts/StudentDashboardNav";
import StudentBottomNav from "@/components/layouts/StudentBottomNav";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "STUDENT") {
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

  if (!user || user.role !== "STUDENT") {
    return null; // Let the useEffect redirect
  }

  const isLearnPage = pathname?.includes("/student/learn/");

  if (isLearnPage) {
    return <QaProvider>{children}</QaProvider>;
  }

  return (
    <QaProvider>
      <DashboardLayout role="STUDENT" title="Student Dashboard">
        <div className="flex flex-col gap-4 max-w-[1600px] mx-auto mb-6 sticky top-0 z-30 bg-[#080B11]/90 backdrop-blur-md pt-2 pb-2">
          <StudentDashboardNav />
        </div>
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </DashboardLayout>
      <StudentBottomNav />
    </QaProvider>
  );
}
