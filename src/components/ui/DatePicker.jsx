"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import {
  format,
  parseISO,
  isValid,
  setYear,
  setMonth,
  getYear,
  getMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isAfter,
  startOfDay,
  subMonths,
  addMonths,
} from "date-fns";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({
  label,
  name,
  value,
  onChange,
  placeholder = "Select Date of Birth",
  disabled = false,
  maxDate = new Date(),
  minYear = 1920,
  maxYear = new Date().getFullYear(),
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' | 'year' | 'month'

  // Parse initial selected date or default to 2000-01-01 if none provided
  const parseValue = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isValid(val) ? val : null;
    try {
      const parsed = parseISO(val);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const selectedDate = parseValue(value);
  const [displayDate, setDisplayDate] = useState(() => {
    return selectedDate || new Date(2000, 0, 1);
  });

  const yearGridRef = useRef(null);

  // Sync internal display date when value prop changes or picker opens
  useEffect(() => {
    const valid = parseValue(value);
    if (valid) {
      setDisplayDate(valid);
    }
  }, [value, isOpen]);

  // Scroll to selected year in year grid mode
  useEffect(() => {
    if (viewMode === "year" && yearGridRef.current) {
      const selectedYearElem = yearGridRef.current.querySelector("[data-selected='true']");
      if (selectedYearElem) {
        selectedYearElem.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [viewMode]);

  const handleOpen = () => {
    if (disabled) return;
    setViewMode("calendar");
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelectDay = (day) => {
    if (isAfter(startOfDay(day), startOfDay(maxDate))) return;
    setDisplayDate(day);
  };

  const handleConfirm = () => {
    const formattedISO = format(displayDate, "yyyy-MM-dd");
    if (onChange) {
      onChange({
        target: {
          name,
          value: formattedISO,
        },
      });
    }
    setIsOpen(false);
  };

  const handleYearSelect = (year) => {
    const updated = setYear(displayDate, year);
    setDisplayDate(updated);
    setViewMode("calendar");
  };

  const handleMonthSelect = (monthIndex) => {
    const updated = setMonth(displayDate, monthIndex);
    setDisplayDate(updated);
    setViewMode("calendar");
  };

  // Generate day grid cells
  const monthStart = startOfMonth(displayDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Generate year range list
  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  const formattedDisplay = selectedDate
    ? format(selectedDate, "dd MMM yyyy")
    : "";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-slate-900 border ${
          isOpen ? "border-orange-500 shadow-md shadow-orange-500/10" : "border-slate-800 hover:border-slate-700"
        } rounded-xl px-3.5 py-2.5 text-sm transition text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className={formattedDisplay ? "text-white font-medium" : "text-slate-500"}>
          {formattedDisplay || placeholder}
        </span>
        <CalendarIcon size={17} className="text-orange-500 shrink-0 ml-2" />
      </button>

      {/* Modal / Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 p-5 text-white relative">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-3.5 right-3.5 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "year" ? "calendar" : "year")}
                  className="text-xs font-bold uppercase tracking-wider text-orange-100/90 hover:text-white flex items-center gap-1 cursor-pointer bg-white/10 px-2 py-0.5 rounded-md w-fit"
                >
                  <span>{getYear(displayDate)}</span>
                  <span className="text-[9px]">▼</span>
                </button>
                <h3 className="text-2xl font-black tracking-tight">
                  {format(displayDate, "EEE, MMM d")}
                </h3>
              </div>
            </div>

            {/* View Selector Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60">
              {viewMode === "calendar" ? (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("month")}
                      className="text-sm font-bold text-white hover:text-orange-400 transition cursor-pointer"
                    >
                      {MONTHS[getMonth(displayDate)]}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("year")}
                      className="text-sm font-bold text-slate-400 hover:text-orange-400 transition cursor-pointer"
                    >
                      {getYear(displayDate)}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDisplayDate(subMonths(displayDate, 1))}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayDate(addMonths(displayDate, 1))}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              ) : viewMode === "year" ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Select Birth Year
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode("calendar")}
                    className="text-xs text-orange-400 hover:underline font-semibold cursor-pointer"
                  >
                    Back to Calendar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Select Month
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode("calendar")}
                    className="text-xs text-orange-400 hover:underline font-semibold cursor-pointer"
                  >
                    Back to Calendar
                  </button>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-4 h-72 overflow-y-auto custom-scrollbar bg-slate-950">
              {viewMode === "calendar" && (
                <div>
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 mb-2 text-center">
                    {WEEKDAYS.map((wd) => (
                      <span key={wd} className="text-[11px] font-bold text-slate-500 py-1">
                        {wd}
                      </span>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {days.map((d, i) => {
                      const isSelected = isSameDay(d, displayDate);
                      const isCurrentMonth = isSameMonth(d, displayDate);
                      const isFuture = isAfter(startOfDay(d), startOfDay(maxDate));

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isFuture}
                          onClick={() => handleSelectDay(d)}
                          className={`h-9 w-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? "bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20 scale-105"
                              : isCurrentMonth
                              ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                              : "text-slate-600 hover:bg-slate-900"
                          } ${isFuture ? "opacity-25 cursor-not-allowed hover:bg-transparent" : ""}`}
                        >
                          {format(d, "d")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewMode === "year" && (
                <div ref={yearGridRef} className="grid grid-cols-3 gap-2.5">
                  {years.map((y) => {
                    const isSelected = y === getYear(displayDate);
                    return (
                      <button
                        key={y}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => handleYearSelect(y)}
                        className={`py-3 rounded-xl text-sm font-black transition cursor-pointer ${
                          isSelected
                            ? "bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20"
                            : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/60"
                        }`}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              )}

              {viewMode === "month" && (
                <div className="grid grid-cols-3 gap-2.5">
                  {MONTHS.map((m, idx) => {
                    const isSelected = idx === getMonth(displayDate);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleMonthSelect(idx)}
                        className={`py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20"
                            : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/60"
                        }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} className="stroke-[3]" />
                <span>Select Date</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
