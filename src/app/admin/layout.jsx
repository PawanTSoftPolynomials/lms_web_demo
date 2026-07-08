"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function Layout({
  children,
}) {
  return (
    <DashboardLayout
      role="ADMIN"
      title="Admin Dashboard"
    >
      {children}
    </DashboardLayout>
  );
}