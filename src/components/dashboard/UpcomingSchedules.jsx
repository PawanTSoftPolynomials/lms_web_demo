"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCalendarEvents } from "@/services/calendar.service";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FaCalendarAlt, FaVideo, FaClipboardList, FaBookOpen, FaClock, FaChevronRight } from "react-icons/fa";

export default function UpcomingSchedules({ role }) {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCalendarEvents();
        
        // Filter by instructor if role is INSTRUCTOR
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
        console.error("Failed to load dashboard calendar items", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [role]);

  const todayString = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filter for today or future events, then sort chronologically and take next 3 items
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.date >= todayString)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 3);
  }, [events, todayString]);

  const getBadgeColor = (type) => {
    switch (type) {
      case "class":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "quiz":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      case "assignment":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "class":
        return <FaVideo className="text-emerald-400" />;
      case "quiz":
        return <FaClipboardList className="text-violet-400" />;
      case "assignment":
        return <FaBookOpen className="text-orange-400" />;
      default:
        return <FaClock className="text-slate-400" />;
    }
  };

  const formatType = (type) => {
    if (type === "class") return "Live Lecture";
    if (type === "quiz") return "Quiz Session";
    if (type === "assignment") return "Assignment";
    return type;
  };

  const handleNavigateToCalendar = () => {
    router.push(`/${role.toLowerCase()}/calendar`);
  };

  if (loading) {
    return (
      <Card className="p-6 border border-slate-800 bg-slate-900/30">
        <div className="h-28 flex items-center justify-center text-xs text-slate-400">
          Loading upcoming schedules...
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-850 bg-slate-900/40 p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-orange-500/5 blur-2xl pointer-events-none" />
      
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <FaCalendarAlt className="text-orange-500" size={16} />
            Upcoming Activities
          </h3>
          <p className="text-xs text-slate-400">Scheduled live classes, quizzes, and deliverables</p>
        </div>
        
        <button
          onClick={handleNavigateToCalendar}
          className="text-xs font-semibold text-orange-500 hover:text-orange-400 transition flex items-center gap-1"
        >
          View Full
          <FaChevronRight className="w-2 h-2" />
        </button>
      </div>

      <div className="space-y-3.5 flex-1">
        {upcomingEvents.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-4 text-center bg-slate-950/20">
            <FaCalendarAlt className="text-slate-600 w-8 h-8 mb-2" />
            <p className="text-xs font-semibold text-slate-400">No upcoming schedules</p>
            <p className="text-[10px] text-slate-500 mt-0.5">You are all caught up for now!</p>
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <div
              key={event.id || event._id}
              className="p-3 border border-slate-800/80 rounded-xl bg-slate-950/20 hover:bg-slate-900/30 transition flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2.5 rounded-lg border flex-shrink-0 ${getBadgeColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[120px]">
                      {event.courseName}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400">
                      {formatType(event.type)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1 truncate leading-tight">
                    {event.title}
                  </h4>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <FaClock className="w-2.5 h-2.5 flex-shrink-0" />
                    <span>
                      {event.date} • {event.startTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {event.type === "class" && event.link ? (
                  <a href={event.link} target="_blank" rel="noreferrer">
                    <button className="text-[10px] font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm">
                      <FaVideo className="w-2.5 h-2.5" />
                      Join
                    </button>
                  </a>
                ) : event.type === "quiz" ? (
                  <button
                    onClick={() => router.push("/student/quizzes")}
                    className="text-[10px] font-bold text-white bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(role === "STUDENT" ? "/student/my-courses" : `/instructor/courses`)}
                    className="text-[10px] font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                  >
                    Open
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
