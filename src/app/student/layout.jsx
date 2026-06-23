"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function Layout({
  children,
}) {
  return (
    <DashboardLayout
      role="STUDENT"
      title="Student Dashboard"
    >
      {children}
    </DashboardLayout>
  );
}