"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getCalendarEvents } from "@/services/calendar.service";
import EventModal from "./EventModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaVideo,
  FaClipboardList,
  FaBookOpen,
  FaClock,
  FaFilter,
  FaCalendarAlt,
  FaList,
  FaUsers
} from "react-icons/fa";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView({ role }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("month"); // 'month' or 'list'
  const [filterType, setFilterType] = useState("all"); // 'all', 'class', 'quiz', 'assignment'
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [selectedDateString, setSelectedDateString] = useState("");

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCalendarEvents();
      // Filter events by role if needed
      // Admin: see all
      // Instructor: see their own
      // Student: see their enrolled courses (we match all events, but filter by instructor if instructor)
      if (role === "INSTRUCTOR" && typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const instId = user.id || user._id;
          const filtered = data.filter(e => e.instructorId === instId || e.instructorId === "inst-current");
          setEvents(filtered);
          setIsLoading(false);
          return;
        }
      }
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const daysGrid = useMemo(() => {
    const days = [];

    // Prev month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        day: d,
        isCurrentMonth: false,
        dateString: prevDate.toISOString().split("T")[0],
        date: prevDate,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const currDate = new Date(year, month, d);
      days.push({
        day: d,
        isCurrentMonth: true,
        dateString: currDate.toISOString().split("T")[0],
        date: currDate,
      });
    }

    // Next month padding days
    const totalGridCells = 42; // 6 rows * 7 columns
    const remainingCells = totalGridCells - days.length;
    for (let d = 1; d <= remainingCells; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        day: d,
        isCurrentMonth: false,
        dateString: nextDate.toISOString().split("T")[0],
        date: nextDate,
      });
    }

    return days;
  }, [year, month, firstDayIndex, totalDays, prevMonthTotalDays]);

  // Filter events based on active selection
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesType = filterType === "all" || e.type === filterType;
      return matchesType;
    });
  }, [events, filterType]);

  // Group events by date string (YYYY-MM-DD) for fast grid lookups
  const eventsByDate = useMemo(() => {
    const groups = {};
    filteredEvents.forEach((event) => {
      const dateKey = event.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const openAddEventModal = (dateString) => {
    if (role === "STUDENT") return; // Students cannot schedule
    setActiveEvent(null);
    setSelectedDateString(dateString);
    setModalOpen(true);
  };

  const openViewEventModal = (event, e) => {
    e.stopPropagation(); // Prevent triggering cell click
    setActiveEvent(event);
    setModalOpen(true);
  };

  const getEventBadgeClass = (type) => {
    switch (type) {
      case "class":
        return "bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-500";
      case "quiz":
        return "bg-violet-500/20 text-violet-300 border-l-2 border-violet-500";
      case "assignment":
        return "bg-orange-500/20 text-orange-300 border-l-2 border-orange-500";
      default:
        return "bg-slate-800 text-slate-300 border-l-2 border-slate-500";
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "class":
        return <FaVideo className="w-2.5 h-2.5" />;
      case "quiz":
        return <FaClipboardList className="w-2.5 h-2.5" />;
      case "assignment":
        return <FaBookOpen className="w-2.5 h-2.5" />;
      default:
        return <FaClock className="w-2.5 h-2.5" />;
    }
  };

  const todayString = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-orange-500/10 to-pink-500/10 rounded-xl border border-orange-500/20">
            <FaCalendarAlt className="text-2xl text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {MONTHS[month]} {year}
            </h1>
            <p className="text-xs text-slate-400">
              {role === "ADMIN" && "Admin Control • Scheduled online lectures"}
              {role === "INSTRUCTOR" && "Instructor Schedule • Lectures, assignments & quizzes"}
              {role === "STUDENT" && "Student Activities • Stay up to date"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Previous Month"
            >
              <FaChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition mx-1"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Next Month"
            >
              <FaChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition ${
                viewMode === "month"
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FaCalendarAlt className="w-3 h-3" />
              Calendar Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FaList className="w-3 h-3" />
              Chronological List
            </button>
          </div>

          {role !== "STUDENT" && (
            <Button
              onClick={() => openAddEventModal(new Date().toISOString().split("T")[0])}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2"
            >
              <FaPlus className="w-3 h-3" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Filter Options & Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
          <FaFilter className="text-orange-500" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
              filterType === "all"
                ? "bg-slate-700 text-white border-slate-600"
                : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-800"
            }`}
          >
            All Activities
          </button>
          <button
            onClick={() => setFilterType("class")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterType === "class"
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-emerald-400 hover:bg-emerald-950/20"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Online Lectures
          </button>
          <button
            onClick={() => setFilterType("quiz")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterType === "quiz"
                ? "bg-violet-950/40 text-violet-400 border-violet-500/30"
                : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-violet-400 hover:bg-violet-950/20"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
            Quizzes
          </button>
          <button
            onClick={() => setFilterType("assignment")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterType === "assignment"
                ? "bg-orange-950/40 text-orange-400 border-orange-500/30"
                : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-orange-400 hover:bg-orange-950/20"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Assignments
          </button>
        </div>
      </div>

      {viewMode === "month" ? (
        /* Calendar Month Grid View */
        <Card className="p-0 overflow-hidden border border-slate-800 bg-slate-900/20 backdrop-blur-md">
          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/80">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-r last:border-r-0 border-slate-800/60"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 grid-rows-6">
            {daysGrid.map(({ day, isCurrentMonth, dateString, date }, index) => {
              const dayEvents = eventsByDate[dateString] || [];
              const isToday = dateString === todayString;
              const isSelected = selectedDate && dateString === selectedDate.toISOString().split("T")[0];

              return (
                <div
                  key={`${dateString}-${index}`}
                  onClick={() => {
                    setSelectedDate(date);
                    if (role !== "STUDENT") {
                      // Optionally select, or double click to add
                    }
                  }}
                  onDoubleClick={() => openAddEventModal(dateString)}
                  className={`min-h-[110px] p-2 border-r border-b border-slate-800/65 flex flex-col justify-between transition group relative cursor-pointer hover:bg-slate-800/15 ${
                    isCurrentMonth ? "text-slate-100" : "text-slate-600 hover:text-slate-400"
                  } ${
                    isToday ? "bg-slate-900/30 ring-1 ring-inset ring-orange-500/30" : ""
                  } ${
                    isSelected ? "bg-orange-500/5" : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-sm font-semibold rounded-md flex items-center justify-center w-6.5 h-6.5 ${
                        isToday
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow"
                          : "text-slate-300"
                      } ${!isCurrentMonth ? "!text-slate-600" : ""}`}
                    >
                      {day}
                    </span>

                    {/* Quick Scheduler link for Admin/Instructors on Hover */}
                    {role !== "STUDENT" && isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddEventModal(dateString);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-orange-400 bg-slate-800/60 hover:bg-slate-800 rounded transition"
                        title="Schedule on this day"
                      >
                        <FaPlus className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {/* Cell Events List */}
                  <div className="flex-1 space-y-1.5 overflow-hidden py-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id || event._id}
                        onClick={(e) => openViewEventModal(event, e)}
                        className={`px-2 py-1 text-[11px] rounded font-medium flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition cursor-pointer ${getEventBadgeClass(
                          event.type
                        )}`}
                      >
                        {getEventIcon(event.type)}
                        <span className="truncate flex-1 leading-normal">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-bold px-1.5">
                        + {dayEvents.length - 3} more activities
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* Calendar Chronological List View */
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card className="p-12 text-center border border-slate-800">
              <FaCalendarAlt className="mx-auto text-4xl text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white">No scheduled activities found</h3>
              <p className="text-slate-400 text-sm mt-1">
                There are no scheduled activities matching the selected filter.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredEvents
                .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                .map((event) => (
                  <Card
                    key={event.id || event._id}
                    onClick={(e) => openViewEventModal(event, e)}
                    className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-orange-500/40 cursor-pointer transition border border-slate-800 bg-slate-900/30 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3.5 rounded-xl border ${getEventBadgeClass(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {event.courseName}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <FaClock /> {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1.5">{event.title}</h3>
                        {event.instructorName && (
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <FaUsers className="text-pink-500/80" /> Instructor: {event.instructorName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800/80 pt-3.5 md:pt-0">
                      <span className="text-xs text-slate-400 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800">
                        {event.date}
                      </span>
                      {event.type === "class" && event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg transition"
                        >
                          <FaVideo /> Join
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Shared Event Dialog Modal */}
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={activeEvent}
        selectedDate={selectedDateString}
        onSave={loadEvents}
        role={role}
      />
    </div>
  );
}
