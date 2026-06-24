"use client";

import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  href,
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className="
        cursor-pointer
        transition
        hover:scale-105
      "
    >
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">
              {title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {value}
            </h2>
          </div>

          {Icon && (
            <Icon className="text-4xl text-orange-500" />
          )}
        </div>
      </Card>
    </div>
  );
}