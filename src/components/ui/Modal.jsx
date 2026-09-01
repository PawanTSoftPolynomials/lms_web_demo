"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  const width = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${width[size]} max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-border-strong bg-card shadow-lg animate-in zoom-in-95 duration-200`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 flex-1 min-h-0 flex flex-col overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}