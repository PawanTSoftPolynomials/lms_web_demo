"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
import InstructorNavDrawer from "@/components/layouts/InstructorNavDrawer";
import { InstructorNavDrawerProvider } from "@/context/InstructorNavDrawerContext";

export default function Layout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "INSTRUCTOR") {
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

  if (!user || user.role !== "INSTRUCTOR") {
    return null; // Let the useEffect redirect
  }

  return (
    <InstructorNavDrawerProvider>
      <DashboardLayout role="INSTRUCTOR" title="Instructor Home">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1 min-h-0">
          {children}
        </div>
      </DashboardLayout>
      <InstructorNavDrawer />
    </InstructorNavDrawerProvider>
  );
}
