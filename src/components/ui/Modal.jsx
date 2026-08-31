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
  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
     className="
  fixed
  inset-0
  z-9999
  flex
  items-center
  justify-center
  bg-black/40
  backdrop-blur-md
  animate-in
  fade-in
  duration-200
  p-6
"
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
    px-6
    py-4
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
    rounded-[0.625rem]
    text-muted-foreground
    hover:bg-muted
    hover:text-foreground
    cursor-pointer
  "
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1 min-h-0 flex flex-col overflow-hidden text-foreground">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}