"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
import { NavigationStrip } from "@/components/admin/NavigationStrip/NavigationStrip";
import AdminBottomNav from "@/components/layouts/AdminBottomNav";
import AdminNavDrawer from "@/components/layouts/AdminNavDrawer";
import { AdminNavDrawerProvider } from "@/context/AdminNavDrawerContext";

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
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null; // Let the useEffect redirect
  }

  return (
    <AdminNavDrawerProvider>
      <DashboardLayout role="ADMIN" title="Admin Dashboard">
        <div className="flex flex-col gap-4 max-w-[1600px] mx-auto mb-6 sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-2 pb-2">
          <NavigationStrip />
        </div>
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </DashboardLayout>
      <AdminBottomNav />
      <AdminNavDrawer />
    </AdminNavDrawerProvider>
  );
}
