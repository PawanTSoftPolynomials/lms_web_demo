"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  ChevronLeft,
  LayoutGrid,
  Calendar,
  Megaphone,
  ClipboardList,
  FolderOpen,
  MessageSquare,
  Users,
} from "lucide-react";

import { useBatchDashboard } from "@/hooks/queries/student/useBatches";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "resources", label: "Resources", icon: FolderOpen },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "classmates", label: "Classmates", icon: Users },
];

// Shared workspace shell for a single batch — header + tab nav. Each tab is
// its own route/page under this layout (student/batches/[batchId]/<tab>/page.jsx),
// matching the folder structure used elsewhere in the app. The dashboard
// query is called here AND independently in each tab's page; both share the
// same React Query cache entry (same queryKey), so this only ever fires one
// network request per batch, not one per tab.
export default function BatchWorkspaceLayout({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const batchId = params.batchId;

  const { data: dashboard, isLoading } = useBatchDashboard(batchId);

  const activeTab = TABS.find((t) => pathname?.endsWith(`/${t.id}`))?.id || "overview";

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/student/batches"
          className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition mb-2"
        >
          <ChevronLeft size={14} /> Back to Batches
        </Link>

        {isLoading ? (
          <div className="h-8 w-64 bg-slate-800/50 rounded animate-pulse" />
        ) : (
          <>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-white">{dashboard?.name || "Batch"}</h1>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {dashboard?.status || "ACTIVE"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{dashboard?.course?.title}</p>
          </>
        )}
      </div>

      <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={`/student/batches/${batchId}/${tab.id}`}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold whitespace-nowrap transition ${
                active ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} /> {tab.label}
            </Link>
          );
        })}
      </nav>

      <div>{children}</div>
    </div>
  );
}
