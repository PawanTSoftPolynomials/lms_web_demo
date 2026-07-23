"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function AuthAlert({
  type = "error",
  message,
}) {
  if (!message) return null;

  const styles = {
    success: {
      text: "text-green-400",
      icon: <CheckCircle2 size={14} className="text-green-500 shrink-0" />
    },
    error: {
      text: "text-red-500",
      icon: <AlertCircle size={14} className="text-red-500 shrink-0" />
    },
    info: {
      text: "text-blue-400",
      icon: <Info size={14} className="text-blue-500 shrink-0" />
    },
  };

  const currentStyle = styles[type] || styles.error;

  return (
    <div
      className={`flex gap-2 items-center text-xs font-semibold px-1 py-1.5 select-none animate-in fade-in slide-in-from-top-1 duration-200 ${currentStyle.text}`}
    >
      {currentStyle.icon}
      <span>{message}</span>
    </div>
  );
}