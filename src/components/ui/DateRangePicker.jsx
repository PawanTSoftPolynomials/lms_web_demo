"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ArrowRight } from "lucide-react";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/shadcn/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/shadcn/sheet";
import { cn } from "@/lib/utils";

function parseISO(value) {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function toISO(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatWeekdayName(date) {
  return date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
}

function DayButtonImpl({ day, modifiers, className, children, ...props }) {
  // react-day-picker marks the WHOLE range as `selected`, not just the two
  // endpoints — only range_start/range_end (or a lone from-only pick) should
  // render as a solid circle; range_middle days get the subtle band instead.
  const isEdge = modifiers.range_start || modifiers.range_end || (modifiers.selected && !modifiers.range_middle);
  const isMiddle = modifiers.range_middle && !isEdge;
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold outline-none transition-all duration-150",
        !isEdge && !isMiddle && !modifiers.disabled && "text-foreground hover:bg-primary/15 hover:text-foreground",
        modifiers.outside && !isEdge && "text-slate-600",
        modifiers.today && !isEdge && "border border-primary text-primary",
        isMiddle && "text-orange-200 hover:bg-primary/20",
        isEdge && "bg-primary text-foreground shadow-[0_2px_10px_-2px_rgba(255,122,0,0.6)] hover:bg-orange-600",
        modifiers.disabled && "pointer-events-none text-slate-700 opacity-40 hover:bg-transparent"
      )}
    >
      {children}
    </button>
  );
}

function DayImpl({ day, modifiers, className, children, ...props }) {
  return (
    <td
      {...props}
      className={cn(
        "p-0 text-center",
        modifiers.range_middle && "bg-primary/10",
        modifiers.range_start && "bg-primary/10 rounded-l-full",
        modifiers.range_end && "bg-primary/10 rounded-r-full"
      )}
    >
      {children}
    </td>
  );
}

const calendarClassNames = {
  months: "flex flex-col",
  month: "relative space-y-3",
  month_caption: "flex items-center justify-center h-9 px-10",
  caption_label: "text-[13px] font-black text-foreground tracking-tight",
  dropdowns: "flex items-center gap-1.5",
  dropdown_root: "relative",
  months_dropdown:
    "bg-[#141930] border border-border text-[12px] font-black text-foreground rounded-lg px-2 py-1 outline-none cursor-pointer",
  years_dropdown:
    "bg-[#141930] border border-border text-[12px] font-black text-foreground rounded-lg px-2 py-1 outline-none cursor-pointer",
  button_previous:
    "absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition disabled:opacity-30 disabled:pointer-events-none",
  button_next:
    "absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition disabled:opacity-30 disabled:pointer-events-none",
  month_grid: "w-full border-collapse mt-1",
  weekdays: "flex",
  weekday: "w-9 h-8 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center",
  week: "flex w-full mt-0.5",
  day: "p-0 text-center",
};

function CalendarBody({ range, onRangeChange, month, onMonthChange }) {
  return (
    <DayPicker
      mode="range"
      selected={range}
      onSelect={onRangeChange}
      month={month}
      onMonthChange={onMonthChange}
      captionLayout="dropdown"
      navLayout="around"
      showOutsideDays
      classNames={calendarClassNames}
      formatters={{ formatWeekdayName }}
      components={{ DayButton: DayButtonImpl, Day: DayImpl }}
    />
  );
}

function Footer({ onCancel, onToday, onApply }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted transition"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onToday}
        className="inline-flex items-center px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-primary border border-primary/30 hover:bg-primary/10 transition"
      >
        Today
      </button>
      <button
        type="button"
        onClick={onApply}
        className="inline-flex items-center px-4 py-2 rounded-xl text-[10.5px] font-black text-foreground bg-primary hover:bg-orange-600 shadow-sm transition"
      >
        Apply
      </button>
    </div>
  );
}

/**
 * Dark-themed analytics date-range filter. Emits the same plain YYYY-MM-DD
 * strings the two-native-inputs pattern it replaces used, so callers don't
 * need to change how they store/consume startDate/endDate.
 */
export function DateRangePicker({ startDate, endDate, onChange, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ from: undefined, to: undefined });
  const [month, setMonth] = useState(new Date());
  // Defaults to desktop so SSR/first paint matches the CSS `hidden sm:block`
  // trigger that's actually visible before this effect corrects it.
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mql.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleOpenChange = (next) => {
    if (next) {
      const from = parseISO(startDate);
      const to = parseISO(endDate);
      setDraft({ from, to });
      setMonth(from || new Date());
    }
    setOpen(next);
  };

  const commit = (nextFrom, nextTo) => {
    onChange?.(toISO(nextFrom), toISO(nextTo || nextFrom));
    setOpen(false);
  };

  const handleApply = () => commit(draft.from, draft.to);
  const handleToday = () => setDraft({ from: new Date(), to: new Date() });
  const handleCancel = () => setOpen(false);

  const fromDisplay = formatDisplay(parseISO(startDate));
  const toDisplay = formatDisplay(parseISO(endDate));

  const renderTrigger = (onClick) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 bg-[#141930] border border-border text-[10.5px] px-3 py-2 rounded-lg outline-none text-foreground hover:border-primary/40 focus:border-primary/60 transition",
        triggerClassName
      )}
    >
      <CalendarDays size={13} className="text-primary shrink-0" />
      {fromDisplay ? (
        <span className="flex items-center gap-1.5 font-bold text-foreground">
          {fromDisplay}
          <ArrowRight size={10} className="text-muted-foreground" />
          {toDisplay || fromDisplay}
        </span>
      ) : (
        <span className="text-muted-foreground font-semibold">Date Range</span>
      )}
    </button>
  );

  return (
    <>
      {/* Desktop: popover */}
      <div className="hidden sm:block">
        <Popover open={open && isDesktop} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
          <PopoverContent
            className="w-auto bg-[#111827] border-border rounded-2xl p-0 shadow-2xl"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onFocusOutside={(e) => e.preventDefault()}
          >
            <div className="p-4">
              <CalendarBody
                range={draft}
                onRangeChange={(r) => setDraft(r || { from: undefined, to: undefined })}
                month={month}
                onMonthChange={setMonth}
              />
            </div>
            <Footer onCancel={handleCancel} onToday={handleToday} onApply={handleApply} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile: fullscreen bottom sheet */}
      <div className="sm:hidden">
        {renderTrigger(() => handleOpenChange(true))}
        <Sheet open={open && !isDesktop} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className="h-[92dvh] max-h-[92dvh] bg-[#111827] border-border rounded-t-2xl p-0 flex flex-col"
          >
            <SheetTitle className="sr-only">Select date range</SheetTitle>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
              <CalendarBody
                range={draft}
                onRangeChange={(r) => setDraft(r || { from: undefined, to: undefined })}
                month={month}
                onMonthChange={setMonth}
              />
            </div>
            <Footer onCancel={handleCancel} onToday={handleToday} onApply={handleApply} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
