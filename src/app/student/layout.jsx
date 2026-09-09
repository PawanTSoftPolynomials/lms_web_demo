"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardNavbar from "@/components/layouts/DashboardNavbar";
import { useAuth } from "@/context/AuthContext";
import { QaProvider } from "@/context/QaContext";
import Loader from "@/components/common/Loader";
import StudentNavDrawer from "@/components/layouts/StudentNavDrawer";
import { StudentNavDrawerProvider } from "@/context/StudentNavDrawerContext";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "STUDENT") {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader />
      </div>
    );
  }

  if (!user || user.role !== "STUDENT") {
    return null; // Let the useEffect redirect
  }

  const isLearnPage = pathname?.includes("/student/learn/");

  if (isLearnPage) {
    // Same top bar as every other Student page, but the learn page still
    // owns its own fixed-viewport, internally-scrolling layout below it
    // (not DashboardLayout's Sidebar/padded <main>/ChatWidget — the learn
    // page already renders its own ChatWidget).
    return (
      <QaProvider>
        <StudentNavDrawerProvider>
          <div className="h-screen flex flex-col overflow-hidden">
            <DashboardNavbar role="STUDENT" title="Learning Workspace" />
            <div className="flex-1 min-h-0">{children}</div>
          </div>
          <StudentNavDrawer />
        </StudentNavDrawerProvider>
      </QaProvider>
    );
  }

  return (
    <QaProvider>
      <StudentNavDrawerProvider>
        <DashboardLayout role="STUDENT" title="Student Dashboard">
          <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1 min-h-0">
            {children}
          </div>
        </DashboardLayout>
        <StudentNavDrawer />
      </StudentNavDrawerProvider>
    </QaProvider>
  );
}
