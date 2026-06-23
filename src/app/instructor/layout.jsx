"use client";

import { useState } from "react";
import InstructorSidebar from "../../components/layouts/InstructorSidebar";
import Navbar from "../../components/layouts/Navbar";

export default function Layout({
  children,
}) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="flex">
      <InstructorSidebar
        open={open}
        setOpen={setOpen}
      />

      <div className="flex-1">
        <Navbar
          setOpen={setOpen}
        />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}