"use client";

import { useState } from "react";

import Sidebar from "@/components/layouts/Sidebar";
import DashboardNavbar from "@/components/layouts/DashboardNavbar";

export default function DashboardLayout({ children, role, title }) {
  const [open, setOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        role={role}
        open={open}
        setOpen={setOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className="
          flex-1
          flex
          flex-col
          transition-all
          duration-300
        "
      >
        <DashboardNavbar
          title={title}
          setOpen={setOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
