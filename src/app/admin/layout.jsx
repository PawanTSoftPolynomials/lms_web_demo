"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
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
        <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1 min-h-0">
          {children}
        </div>
      </DashboardLayout>
      <AdminNavDrawer />
    </AdminNavDrawerProvider>
  );
}
