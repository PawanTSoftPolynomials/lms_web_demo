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
  bg-slate-950/80
  backdrop-blur-sm
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
  w-full
  ${width[size]}
  overflow-hidden
  rounded-2xl
  border
  border-slate-800
  bg-slate-900
  shadow-[0_20px_80px_rgba(0,0,0,0.55)]
  animate-in
  zoom-in-95
  duration-200
`}
      >
       <div
  className="
    flex
    items-center
    justify-between
    border-b
    border-slate-800
    bg-slate-900/80
    px-7
    py-5
  "
>
       <h2 className="text-2xl font-bold text-white">
            {title}
          </h2>

       <button
  onClick={onClose}
  className="
    flex
    h-10
    w-10
    items-center
    justify-center
    rounded-xl
    text-slate-400
    transition-all
    hover:bg-slate-800
    hover:text-white
  "
>
  ✕
</button>
        </div>

        <div className="p-7">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}