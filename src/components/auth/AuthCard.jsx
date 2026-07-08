"use client";

import Card from "@/components/ui/Card";

export default function AuthCard({
  children,
  className = "",
}) {
  return (
    <Card
      className={`w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl ${className}`}
    >
      {children}
    </Card>
  );
}