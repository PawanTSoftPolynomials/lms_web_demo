"use client";

import { useState } from "react";

import StudentSidebar from "../../components/layouts/StudentSidebar";
import Navbar from "../../components/layouts/Navbar";

export default function StudentLayout({
  children,
}) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="flex">
      <StudentSidebar
        open={open}
        setOpen={setOpen}
      />

      <div className="flex-1">
        <Navbar
          setOpen={setOpen}
        />

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}