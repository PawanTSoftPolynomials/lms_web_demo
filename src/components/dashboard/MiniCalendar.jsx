"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCalendarEvents } from "@/services/calendar.service";
import Card from "@/components/ui/Card";
import { FaChevronLeft, FaChevronRight, FaVideo, FaClipboardList, FaBookOpen, FaClock, FaCalendarAlt } from "react-icons/fa";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function MiniCalendar({ role }) {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const data = await getCalendarEvents();
      if (role === "INSTRUCTOR" && typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const instId = user.id || user._id;
          const instructorEvents = data.filter(e => e.instructorId === instId || e.instructorId === "inst-current");
          setEvents(instructorEvents);
          setLoading(false);
          return;
        }
      }
      setEvents(data);
    } catch (err) {
      console.error("Failed to load mini calendar events", err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadData();

    const handleStorageChange = (e) => {
      if (e.key === "calendar_events") {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadData]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Grid days array containing padding days and current month days
  const gridDays = useMemo(() => {
    const days = [];
    
    // Padding from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateString: null });
    }
    
    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      // Format YYYY-MM-DD
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateString, date });
    }

    return days;
  }, [year, month, firstDayIndex, totalDays]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const selectedDateString = useMemo(() => {
    return selectedDate.toISOString().split("T")[0];
  }, [selectedDate]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return events.filter(e => e.date === selectedDateString);
  }, [events, selectedDateString]);

  // Check if a day has any events
  const getDayEventIndicators = useCallback((dateString) => {
    if (!dateString) return null;
    const dayEvents = events.filter(e => e.date === dateString);
    if (dayEvents.length === 0) return null;
    
    // Return unique types present on that day
    return Array.from(new Set(dayEvents.map(e => e.type)));
  }, [events]);

  const handleNavigateToFullCalendar = () => {
    router.push(`/${role.toLowerCase()}/calendar`);
  };

  const getDotColor = (type) => {
    switch (type) {
      case "class": return "bg-emerald-500";
      case "quiz": return "bg-violet-500";
      case "assignment": return "bg-orange-500";
      default: return "bg-slate-400";
    }
  };

  if (loading) {
    return (
      <Card className="p-4 border border-slate-850 bg-slate-900/30">
        <div className="h-56 flex items-center justify-center text-xs text-slate-400">
          Loading calendar...
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-850 bg-slate-900/40 p-4 relative overflow-hidden flex flex-col justify-between h-full">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-orange-500/5 blur-xl pointer-events-none" />

      {/* Mini Calendar Header */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
          <FaCalendarAlt className="text-orange-500" />
          Schedule Widget
        </h4>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-800 rounded text-[9px] text-slate-400 hover:text-white transition">
            <FaChevronLeft />
          </button>
          <span className="text-[10px] font-bold text-slate-300 px-1 truncate w-14 text-center select-none">
            {MONTHS[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-slate-800 rounded text-[9px] text-slate-400 hover:text-white transition">
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center gap-y-1 mb-3">
        {WEEKDAYS.map((w, idx) => (
          <span key={idx} className="text-[9px] font-extrabold text-slate-500 uppercase">
            {w}
          </span>
        ))}
        {gridDays.map((d, idx) => {
          if (d.day === null) {
            return <div key={`empty-${idx}`} />;
          }
          
          const isSelected = selectedDateString === d.dateString;
          const isToday = new Date().toISOString().split("T")[0] === d.dateString;
          const indicators = getDayEventIndicators(d.dateString);

          return (
            <div
              key={d.dateString}
              onClick={() => setSelectedDate(d.date)}
              className={`h-7 w-7 mx-auto rounded-lg flex flex-col items-center justify-center text-[10px] font-semibold transition cursor-pointer relative ${
                isSelected
                  ? "bg-gradient-to-tr from-orange-500 to-pink-500 text-white font-bold"
                  : isToday
                  ? "bg-slate-850 text-orange-400 border border-orange-500/20"
                  : "text-slate-300 hover:bg-slate-800/40"
              }`}
            >
              <span className="leading-none">{d.day}</span>
              {/* Little dots for event types */}
              {indicators && (
                <div className="absolute bottom-0.5 flex gap-0.5 justify-center">
                  {indicators.slice(0, 3).map((type, i) => (
                    <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : getDotColor(type)}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Event List */}
      <div className="border-t border-slate-800/80 pt-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5 flex-1 min-h-[90px] max-h-[110px] overflow-y-auto pr-1">
          <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
            Agenda for {selectedDateString === new Date().toISOString().split("T")[0] ? "Today" : selectedDateString}
          </div>
          {selectedDateEvents.length === 0 ? (
            <div className="text-[10px] text-slate-500 italic py-2">
              No activities scheduled on this day.
            </div>
          ) : (
            selectedDateEvents.map(e => (
              <div key={e.id || e._id} className="text-[10px] flex items-center justify-between p-1.5 rounded-md bg-slate-950/30 border border-slate-850 hover:bg-slate-950/50 transition gap-2">
                <span className="truncate text-slate-200 font-bold max-w-[120px]">{e.title}</span>
                <span className="text-[8px] px-1 py-0.5 rounded font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 flex-shrink-0">
                  {e.startTime}
                </span>
              </div>
            ))
          )}
        </div>

        <button
          onClick={handleNavigateToFullCalendar}
          className="w-full text-center text-[10px] font-semibold text-orange-500 hover:text-orange-400 mt-2 pt-2 border-t border-slate-800/50 transition"
        >
          Open Full Calendar
        </button>
      </div>
    </Card>
  );
}
