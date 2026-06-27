"use client";

import Link from "next/link";
import {
  HiOutlineMegaphone,
  HiOutlineClock,
} from "react-icons/hi2";
import { FaArrowRight } from "react-icons/fa6";

import ListCard from "@/components/dashboard/common/ListCard";

export default function Announcements({
  announcements = [],
  title = "Announcements",
  viewAllHref = "/instructor/announcements",
}) {
  return (
    <ListCard
      title={title}
      subtitle="Latest updates and notices"
      items={announcements}
      emptyMessage="No announcements available."
      action={
        <Link
          href={viewAllHref}
          className="flex items-center gap-2 text-sm font-medium text-orange-500 transition hover:text-orange-400"
        >
          View All
          <FaArrowRight size={12} />
        </Link>
      }
    >
      {announcements.slice(0, 5).map((announcement) => (
        <div
          key={announcement.id}
          className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 transition-all duration-300 hover:border-orange-500/40 hover:bg-slate-800/70"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <HiOutlineMegaphone size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-white">
                {announcement.title}
              </h3>

              {announcement.description && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                  {announcement.description}
                </p>
              )}

              {announcement.createdAt && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <HiOutlineClock size={14} />

                  <span>{announcement.createdAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </ListCard>
  );
}