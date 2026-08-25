"use client";

import React from "react";
import { MoreVertical, ChevronRight, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/shadcn/dropdown-menu";

export function CourseComposerItemCard({
  orderNumber,
  title,
  subtitle,
  metadataText,
  onClick,
  menuItems = [],
  badgeColorClass = "bg-orange-500/15 text-orange-400 border-orange-500/30",
  hoverTextClass = "group-hover:text-orange-400",
  hoverBorderClass = "hover:border-orange-500/40",
  arrowColorClass = "group-hover:text-orange-400",
}) {
  const formattedNum = String(orderNumber).padStart(2, "0");

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-4 rounded-xl border border-slate-800/90 bg-slate-900/60 hover:bg-slate-900 ${hoverBorderClass} transition duration-150 shadow-sm cursor-pointer min-h-[125px]`}
    >
      {/* Top Bar: Order Badge & 3-Dot Kebab Menu */}
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${badgeColorClass}`}>
          {formattedNum}
        </span>

        {/* 3-Dot Menu */}
        {menuItems.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Item actions"
                >
                  <MoreVertical size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-slate-200">
                {menuItems.map((item, idx) =>
                  item.separator ? (
                    <DropdownMenuSeparator key={`sep-${idx}`} className="bg-slate-800" />
                  ) : (
                    <DropdownMenuItem
                      key={item.label || idx}
                      disabled={item.disabled}
                      onClick={item.onSelect}
                      className={`cursor-pointer text-xs ${
                        item.destructive
                          ? "text-red-400 hover:bg-red-950/40"
                          : item.highlight
                          ? "text-purple-400 hover:bg-slate-900 font-semibold"
                          : "hover:bg-slate-900"
                      }`}
                    >
                      {item.icon && <item.icon className="mr-2 size-3.5" />}
                      {item.label}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Middle: Title & Subtitle */}
      <div className="my-2 space-y-1">
        <h4 className={`text-sm font-bold text-white line-clamp-2 ${hoverTextClass} transition`}>
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-slate-400 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom Bar: Metadata & Arrow Affordance */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 text-slate-400">
        <span className="text-[11px] font-mono font-medium">
          {metadataText}
        </span>
        <ArrowRight size={13} className={`text-slate-500 ${arrowColorClass} group-hover:translate-x-0.5 transition`} />
      </div>
    </div>
  );
}
