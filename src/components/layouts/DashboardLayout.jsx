"use client";

import { useState } from "react";

import Sidebar from "@/components/layouts/Sidebar";
import DashboardNavbar from "@/components/layouts/DashboardNavbar";

export default function DashboardLayout({
  children,
  role,
  title,
}) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        role={role}
        open={open}
        setOpen={setOpen}
      />

      <div className="flex-1 flex flex-col">
        <DashboardNavbar
          title={title}
          setOpen={setOpen}
        />

        <main className="p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}