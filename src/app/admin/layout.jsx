"use client";

import { useState } from "react";

import AdminSidebar from "../../components/layouts/AdminSidebar";
import Navbar from "../../components/layouts/Navbar";

export default function AdminLayout({
  children,
}) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="flex">
      <AdminSidebar
        open={open}
        setOpen={setOpen}
      />

      <div className="flex-1">
        <Navbar setOpen={setOpen} />

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}