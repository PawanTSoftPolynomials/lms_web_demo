"use client";

import { usePathname } from "next/navigation";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function Layout({
  children,
}) {
  const pathname = usePathname();

  const isLearningPage =
    pathname.startsWith("/student/learn/");

  if (isLearningPage) {
    return children;
  }

  return (
    <DashboardLayout
      role="STUDENT"
      title="Student Dashboard"
    >
      {children}
    </DashboardLayout>
  );
}