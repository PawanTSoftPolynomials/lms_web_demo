"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  // Additive, opt-out only — every existing caller keeps the blurred/dimmed
  // backdrop unchanged. Pass false for a plain popup where the page behind
  // it should stay fully sharp/visible (no blur, no dimming tint).
  blurBackdrop = true,
}) {
  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open)
    return null;

  const width = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return createPortal(
    <div
     className={`
  fixed
  inset-0
  z-9999
  flex
  items-center
  justify-center
  animate-in
  fade-in
  duration-200
  p-3
  sm:p-6
  ${blurBackdrop ? "bg-background/80 backdrop-blur-sm" : "bg-transparent"}
`}
      onClick={onClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className={`
  glass-modal
  w-full
  ${width[size]}
  max-h-[85vh]
  flex
  flex-col
  overflow-hidden
  rounded-2xl
  border
  border-border
  bg-background
  shadow-[0_20px_80px_rgba(0,0,0,0.55)]
  animate-in
  zoom-in-95
  duration-200
`}
      >
        <div
          className="
    flex
    shrink-0
    items-center
    justify-between
    border-b
    border-border
    bg-background/80
    px-4
    py-3
    sm:px-6
    sm:py-4
  "
        >
          <h2 className="text-xl font-bold text-foreground">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
    glass-button
    flex
    h-9
    w-9
    items-center
    justify-center
    rounded-xl
    text-muted-foreground
    transition-all
    hover:bg-muted
    hover:text-foreground
    cursor-pointer
  "
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 flex-1 min-h-0 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}