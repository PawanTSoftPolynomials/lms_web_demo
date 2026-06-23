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
      "bg-green-500/20 text-green-400 border border-green-500/30",
  },

  DRAFT: {
    icon: FaClock,
    className:
      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
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
      <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-white">
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
        font-medium
        ${config.className}
      `}
    >
      <Icon className="text-xs" />

      {status}
    </span>
  );
}