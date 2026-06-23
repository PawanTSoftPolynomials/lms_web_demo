"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function Layout({
  children,
}) {
  return (
    <DashboardLayout
      role="INSTRUCTOR"
      title="Instructor Dashboard"
    >
      {children}
    </DashboardLayout>
  );
}