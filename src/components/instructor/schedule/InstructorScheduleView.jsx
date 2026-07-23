"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent } from "@/services/calendar.service";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Video,
  HelpCircle,
  Users,
  Sparkles,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
  X,
  Layers,
  Grid,
  List,
  FileText,
  ChevronDown,
  Paperclip,
  Sun
} from "lucide-react";

// ==========================================
// CONSTANTS & COLOR CONFIGS
// ==========================================
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_TYPES = {
  lecture: { label: "Lecture", color: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30", bgSoft: "bg-emerald-500/10", icon: Video },
  assignment: { label: "Assignment", color: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30", bgSoft: "bg-orange-500/10", icon: FileText },
  quiz: { label: "Quiz", color: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/30", bgSoft: "bg-purple-500/10", icon: HelpCircle },
  meeting: { label: "Meeting", color: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/30", bgSoft: "bg-blue-500/10", icon: Users },
  office_hours: { label: "Office Hours", color: "bg-pink-500", text: "text-pink-400", border: "border-pink-500/30", bgSoft: "bg-pink-500/10", icon: Clock },
  holiday: { label: "Holiday", color: "bg-slate-500", text: "text-slate-400", border: "border-slate-500/30", bgSoft: "bg-slate-500/10", icon: Sun },
};

export default function InstructorScheduleView() {
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week' | 'agenda'
  
  // Drawer & Modal States
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addMenuRef = useRef(null);

  // Load dynamic events from database API on mount
  useEffect(() => {
    async function loadDbEvents() {
      try {
        const dbEvents = await getCalendarEvents();
        if (Array.isArray(dbEvents)) {
          const formatted = dbEvents.map((e) => ({
            id: e.id || e._id,
            title: e.title,
            type: e.type === "class" ? "lecture" : (e.type || "lecture"),
            course: e.courseName || "General Course",
            batch: e.batch || "Batch A",
            date: e.date,
            startTime: e.startTime || "09:00 AM",
            endTime: e.endTime || "10:30 AM",
            duration: e.duration || "60 mins",
            status: e.status || "UPCOMING",
            room: e.room || e.location || "Online",
            meetingUrl: e.link || e.meetingUrl || "",
            instructor: e.instructorName || "Instructor",
            priority: e.priority || "MEDIUM",
            studentsCount: e.studentsCount || 0,
            attendanceRate: e.attendanceRate || "-",
            description: e.description || "",
            attachments: e.attachments || []
          }));

          setScheduleEvents(formatted);
        } else {
          setScheduleEvents([]);
        }
      } catch (err) {
        console.error("Failed to load events from DB:", err);
        setScheduleEvents([]);
      }
    }

    loadDbEvents();

    const handleClickOutside = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setShowAddMenu(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map = {};
    scheduleEvents.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    return map;
  }, [scheduleEvents]);

  // Calendar Calculation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const daysGrid = useMemo(() => {
    const days = [];
    // Prev Month Padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const dateObj = new Date(year, month - 1, d);
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr: dateObj.toISOString().split("T")[0],
      });
    }
    // Current Month
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      days.push({
        day: d,
        isCurrentMonth: true,
        dateStr: dateObj.toISOString().split("T")[0],
      });
    }
    // Next Month Padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(year, month + 1, d);
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr: dateObj.toISOString().split("T")[0],
      });
    }
    return days;
  }, [year, month, firstDayIndex, totalDays, prevMonthTotalDays]);

  // Month Navigation Actions
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split("T")[0]);
  };

  // Click on date cell
  const handleDateClick = (dateStr) => {
    setSelectedDateStr(dateStr);
    setIsDrawerOpen(true);
  };

  // Click on event pill
  const handleEventClick = (evt, e) => {
    e.stopPropagation();
    setSelectedEvent(evt);
    setSelectedDateStr(evt.date);
    setIsDrawerOpen(true);
  };

  // Event Mutations Persistent to DB API
  const handleCreateEvent = async (typeKey) => {
    setShowAddMenu(false);
    const newEvt = {
      id: `evt-${Date.now()}`,
      title: `New ${EVENT_TYPES[typeKey].label} Session`,
      type: typeKey,
      course: "General Course",
      batch: "Batch A",
      date: selectedDateStr || new Date().toISOString().split("T")[0],
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      duration: "60 mins",
      status: "UPCOMING",
      room: "Online",
      meetingUrl: "https://meet.google.com/new-session",
      instructor: "Instructor",
      priority: "MEDIUM",
      studentsCount: 0,
      attendanceRate: "-",
      description: "Newly created scheduled instruction item.",
      attachments: []
    };

    setScheduleEvents((prev) => [newEvt, ...prev]);
    setSelectedEvent(newEvt);
    setIsDrawerOpen(true);

    try {
      await createCalendarEvent({
        title: newEvt.title,
        type: newEvt.type,
        date: newEvt.date,
        startTime: newEvt.startTime,
        endTime: newEvt.endTime,
        description: newEvt.description,
        instructorName: newEvt.instructor,
        link: newEvt.meetingUrl,
        courseName: newEvt.course,
      });
    } catch (err) {
      console.warn("Unable to persist created event to DB backend:", err?.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this scheduled session?")) {
      setScheduleEvents((prev) => prev.filter((e) => e.id !== eventId));
      if (selectedEvent?.id === eventId) setSelectedEvent(null);

      try {
        await deleteCalendarEvent(eventId);
      } catch (err) {
        console.warn("Unable to delete event from DB backend:", err?.message);
      }
    }
  };

  const handleDuplicateEvent = (evt) => {
    const dup = {
      ...evt,
      id: `evt-${Date.now()}`,
      title: `${evt.title} (Copy)`,
    };
    setScheduleEvents((prev) => [dup, ...prev]);
  };

  // Dynamic Monthly Snapshot Calculations from DB scheduleEvents
  const totalLecturesCount = useMemo(() => scheduleEvents.filter(e => e.type === "lecture" || e.type === "class").length, [scheduleEvents]);
  const totalAssignmentsCount = useMemo(() => scheduleEvents.filter(e => e.type === "assignment").length, [scheduleEvents]);
  const totalQuizzesCount = useMemo(() => scheduleEvents.filter(e => e.type === "quiz").length, [scheduleEvents]);
  const totalMeetingsCount = useMemo(() => scheduleEvents.filter(e => e.type === "meeting").length, [scheduleEvents]);
  const totalHoursCount = useMemo(() => (scheduleEvents.length * 1.5).toFixed(1), [scheduleEvents]);

  const todayDateStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div className="min-h-screen text-slate-100 bg-[#080B11] p-4 sm:p-6 space-y-6 animate-fade-in">
      
      {/* =========================================================================
          1. TOP HEADER CARD
         ========================================================================= */}
      <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        {/* Left Title & Month Switcher */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-3.5 bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-2xl text-orange-400">
            <CalendarIcon size={24} />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight font-mono">
                {MONTHS[month]} {year}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Command Center
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage lectures, assignments, quizzes, meetings, and office hours.
            </p>
          </div>

          {/* Month Prev/Next/Today Controls */}
          <div className="flex items-center bg-[#05070E] p-1.5 rounded-xl border border-[#1A1F35] ml-0 sm:ml-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-black text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition mx-1 cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right View Switcher & Floating Add Button */}
        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-between lg:justify-end">

          {/* Segmented View Switcher: Month / Week / Agenda */}
          <div className="flex items-center bg-[#05070E] p-1.5 rounded-xl border border-[#1A1F35]">
            {[
              { id: "month", label: "Month", icon: Grid },
              { id: "agenda", label: "Agenda", icon: List },
            ].map((v) => {
              const VIcon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                    viewMode === v.id
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <VIcon size={13} />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>

          {/* Floating Add Session Button */}
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => setShowAddMenu((prev) => !prev)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Schedule Session</span>
              <ChevronDown size={14} />
            </button>

            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#1A1F35] bg-[#05070E] p-1.5 shadow-2xl z-50 text-left animate-in fade-in duration-150">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 py-2 border-b border-[#1A1F35]">
                  Quick Add Event
                </div>
                {Object.keys(EVENT_TYPES).map((key) => {
                  const item = EVENT_TYPES[key];
                  const IconComp = item.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleCreateEvent(key)}
                      className="w-full flex items-center gap-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition text-left cursor-pointer"
                    >
                      <IconComp size={14} className={item.text} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. MONTHLY SUMMARY SNAPSHOT BAR (Dynamic DB Counts)
         ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D1021]/80 border border-[#1A1F35] p-3.5 rounded-2xl backdrop-blur-md text-xs font-bold text-slate-400">
        <div className="flex items-center gap-2 text-white font-mono uppercase tracking-wider text-[11px]">
          <Sparkles size={14} className="text-orange-400" />
          <span>Monthly Snapshot:</span>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs font-extrabold">
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            <Video size={13} /> {totalLecturesCount} Lectures
          </span>
          <span className="flex items-center gap-1.5 text-orange-400 bg-orange-500/10 px-3 py-1 rounded-xl border border-orange-500/20">
            <FileText size={13} /> {totalAssignmentsCount} Assignments
          </span>
          <span className="flex items-center gap-1.5 text-purple-400 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20">
            <HelpCircle size={13} /> {totalQuizzesCount} Quizzes
          </span>
          <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
            <Users size={13} /> {totalMeetingsCount} Meetings
          </span>
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-800/40 px-3 py-1 rounded-xl border border-slate-700/50">
            <Clock size={13} /> {totalHoursCount} Teaching Hours
          </span>
        </div>
      </div>



      {/* =========================================================================
          3. FULL-WIDTH CALENDAR AREA
         ========================================================================= */}
      <div className="space-y-4">
        
        {viewMode === "month" && (
          <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl overflow-hidden shadow-2xl">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 border-b border-[#1A1F35] bg-[#05070E]">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-2 sm:py-3 text-center text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest font-mono border-r last:border-r-0 border-[#1A1F35]"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.substring(0, 3)}</span>
                </div>
              ))}
            </div>

            {/* 42-Cell Month Grid */}
            <div className="grid grid-cols-7 grid-rows-6">
              {daysGrid.map(({ day, isCurrentMonth, dateStr }, idx) => {
                const dayEvents = eventsByDate[dateStr] || [];
                const isToday = dateStr === todayDateStr;
                const isSelected = dateStr === selectedDateStr;

                return (
                  <div
                    key={`${dateStr}-${idx}`}
                    onClick={() => handleDateClick(dateStr)}
                    className={`min-h-[75px] sm:min-h-[125px] p-1 sm:p-2 border-r border-b border-[#1A1F35] flex flex-col justify-between transition-all group relative cursor-pointer hover:bg-white/[0.03] ${
                      isCurrentMonth ? "bg-transparent" : "bg-[#05070E]/50 opacity-40"
                    } ${
                      isToday ? "ring-2 ring-inset ring-orange-500/50 bg-orange-500/[0.03]" : ""
                    } ${
                      isSelected ? "bg-orange-500/[0.05]" : ""
                    }`}
                  >
                    {/* Cell Header */}
                    <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                      <span
                        className={`text-[10px] sm:text-xs font-extrabold font-mono rounded-lg flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 ${
                          isToday
                            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-black shadow-md"
                            : "text-slate-300"
                        } ${!isCurrentMonth ? "text-slate-600" : ""}`}
                      >
                        {day}
                      </span>

                      {/* Hover Quick Add Button */}
                      {isCurrentMonth && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateStr(dateStr);
                            setShowAddMenu(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-orange-400 hover:bg-white/10 rounded transition"
                          title="Schedule on this date"
                        >
                          <Plus size={13} />
                        </button>
                      )}
                    </div>

                    {/* Event Pills List inside Cell */}
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      {dayEvents.slice(0, 3).map((evt) => {
                        const typeConfig = EVENT_TYPES[evt.type] || EVENT_TYPES.lecture;
                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => handleEventClick(evt, e)}
                            className={`px-2 py-1 rounded-lg text-[10.5px] font-extrabold truncate transition flex items-center gap-1.5 hover:brightness-125 ${typeConfig.color} text-slate-950 shadow-sm`}
                            title={`${evt.title} (${evt.startTime})`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0" />
                            <span className="truncate">{evt.title}</span>
                          </div>
                        );
                      })}

                      {/* Overflow Indicator (+X More) */}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] font-black text-orange-400 px-1.5 py-0.5 bg-orange-500/10 rounded border border-orange-500/20 text-center">
                          +{dayEvents.length - 3} More
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agenda View Mode */}
        {viewMode === "agenda" && (
          <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">
              Chronological Agenda List
            </h3>
            <div className="space-y-3">
              {scheduleEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-bold border border-dashed border-[#1A1F35] rounded-xl">
                  No scheduled activities found.
                </div>
              ) : (
                scheduleEvents.map((evt) => {
                  const typeConfig = EVENT_TYPES[evt.type] || EVENT_TYPES.lecture;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setIsDrawerOpen(true);
                      }}
                      className="p-4 rounded-2xl bg-[#05070E] border border-[#1A1F35] flex items-center justify-between gap-4 hover:border-orange-500/40 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${typeConfig.bgSoft} ${typeConfig.text} ${typeConfig.border}`}>
                          <typeConfig.icon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{evt.title}</span>
                            <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${typeConfig.bgSoft} ${typeConfig.text}`}>
                              {typeConfig.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {evt.course} &bull; {evt.batch} &bull; {evt.date} at {evt.startTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500">{evt.room}</span>
                        <ChevronRight size={16} className="text-slate-600" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* CALENDAR LEGEND */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-400">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
            Category Color Legend:
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs font-extrabold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Lecture</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Assignment</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Quiz</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Meeting</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Office Hours</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Holiday</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SLIDE-IN DRAWER (Date & Event Details)
         ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0D1021] border-l border-[#1A1F35] h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            
            {/* Drawer Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A1F35] pb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 font-mono">
                    Schedule Details
                  </h3>
                  <p className="text-xs text-orange-400 font-bold mt-0.5">
                    {selectedDateStr}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Selected Event Details or Create Trigger */}
              {selectedEvent ? (
                <div className="space-y-5">
                  
                  {/* Event Type & Status Badges */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${EVENT_TYPES[selectedEvent.type]?.bgSoft} ${EVENT_TYPES[selectedEvent.type]?.text} ${EVENT_TYPES[selectedEvent.type]?.border}`}>
                      {EVENT_TYPES[selectedEvent.type]?.label}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                      {selectedEvent.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-black text-white leading-tight">
                    {selectedEvent.title}
                  </h2>

                  {/* Metadata List */}
                  <div className="space-y-3 bg-[#05070E] p-4 rounded-2xl border border-[#1A1F35] text-xs font-bold text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase tracking-wider text-[9.5px]">Course</span>
                      <span>{selectedEvent.course}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase tracking-wider text-[9.5px]">Batch</span>
                      <span>{selectedEvent.batch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase tracking-wider text-[9.5px]">Time & Duration</span>
                      <span>{selectedEvent.startTime} ({selectedEvent.duration})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase tracking-wider text-[9.5px]">Room / Location</span>
                      <span className="text-orange-400">{selectedEvent.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase tracking-wider text-[9.5px]">Instructor</span>
                      <span>{selectedEvent.instructor}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedEvent.description && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-1.5">
                        Session Details
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-[#05070E] p-3 rounded-xl border border-[#1A1F35]">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}

                  {/* Attachments */}
                  {selectedEvent.attachments?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-1.5">
                        Attachments ({selectedEvent.attachments.length})
                      </h4>
                      <div className="space-y-1.5">
                        {selectedEvent.attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-[#05070E] border border-[#1A1F35] rounded-xl text-xs text-slate-300">
                            <Paperclip size={13} className="text-orange-400" />
                            <span className="truncate flex-1">{att}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Join Link Button */}
                  {selectedEvent.meetingUrl && (
                    <a
                      href={selectedEvent.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <Video size={16} />
                      <span>Join Online Session</span>
                    </a>
                  )}

                  {/* Quick Action Bar: Edit, Delete, Duplicate */}
                  <div className="grid grid-cols-3 gap-2 border-t border-[#1A1F35] pt-4">
                    <button
                      onClick={() => handleDuplicateEvent(selectedEvent)}
                      className="py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy size={13} />
                      <span>Duplicate</span>
                    </button>
                    <button
                      onClick={() => alert("Edit session dialog opened")}
                      className="py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-bold text-rose-400 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* Date Details & Quick Add */
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Scheduled sessions for <strong className="text-white">{selectedDateStr}</strong>:
                  </p>

                  <button
                    onClick={() => handleCreateEvent("lecture")}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Create Session on {selectedDateStr}</span>
                  </button>

                  <div className="space-y-3 pt-2">
                    {(eventsByDate[selectedDateStr] || []).length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs font-bold border border-dashed border-[#1A1F35] rounded-xl">
                        No events on this date.
                      </div>
                    ) : (
                      (eventsByDate[selectedDateStr] || []).map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className="p-3.5 rounded-xl bg-[#05070E] border border-[#1A1F35] hover:border-orange-500/40 transition cursor-pointer space-y-1"
                        >
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-white">{evt.title}</span>
                            <span className="text-orange-400 font-mono">{evt.startTime}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{evt.course} &bull; {evt.batch}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#1A1F35] text-center">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
