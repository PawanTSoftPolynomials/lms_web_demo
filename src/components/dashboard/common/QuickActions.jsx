"use client";

import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi";

import Card from "@/components/ui/Card";

export default function QuickActions({ actions = [] }) {
  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>

        <p className="mt-1 text-sm text-slate-400">Frequently used shortcuts</p>
      </div>

      {actions.length === 0 ? (
        <p className="text-sm text-slate-400">No actions available.</p>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all duration-200 hover:border-orange-500/40 hover:bg-slate-800"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.iconBgClass}`}
                >
                  {action.icon}
                </div>

                <div>
                  <h3 className="font-medium text-white">{action.label}</h3>

                  <p className="text-sm text-slate-400">Open</p>
                </div>
              </div>

              <HiOutlineArrowRight
                size={20}
                className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-orange-400"
              />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
