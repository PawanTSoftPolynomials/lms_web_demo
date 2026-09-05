"use client";

import {
  FaCheckCircle,
  FaClock,
  FaArchive,
} from "react-icons/fa";

const statusConfig = {
  PUBLISHED: {
    icon: FaCheckCircle,
    className:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  },

  DRAFT: {
    icon: FaClock,
    className:
      "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  },

  ARCHIVED: {
    icon: FaArchive,
    className:
      "bg-red-500/20 text-red-400 border border-red-500/30",
  },
};

export default function StatusBadge({
  status,
}) {
  const config =
    statusConfig[status];

  if (!config) {
    return (
      <span className="px-3 py-1 rounded-full text-xs bg-muted text-foreground">
        {status}
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        ${config.className}
      `}
    >
      <Icon className="text-xs" />

      {status}
    </span>
  );
}