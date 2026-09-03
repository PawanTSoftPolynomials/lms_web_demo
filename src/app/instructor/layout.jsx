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

  if (!user || user.role !== "INSTRUCTOR") {
    return null; // Let the useEffect redirect
  }

  return (
    <InstructorNavDrawerProvider>
      <DashboardLayout role="INSTRUCTOR" title="Instructor Home">
        {/* DashboardLayout's <main> carries generous p-8/sm:p-12/md:p-16 padding
            on every side. That's fine horizontally/at the bottom, but it makes
            for a much bigger navbar-to-content gap than intended up top — so
            this cancels just the inherited top padding (matching its exact
            8/12/16 scale) and replaces it with a small, deliberate one. */}
        <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1 min-h-0 -mt-8 sm:-mt-12 md:-mt-16 pt-4 sm:pt-5 md:pt-6">
          {children}
        </div>
      </DashboardLayout>
      <InstructorNavDrawer />
    </InstructorNavDrawerProvider>
  );
}
