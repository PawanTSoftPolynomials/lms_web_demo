"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  CheckCheck,
  Bell,
  Info,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2
} from "lucide-react";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "@/services/notification.service";

export default function StudentAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState("all"); // 'all', 'unread', 'announcement', 'system'
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch notifications
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  // Filter logic
  const filteredNotifications = notifications.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.message || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "unread") return !item.read;
    if (filterTab === "announcement") return item.type === "ANNOUNCEMENT" || item.type === "COURSE";
    if (filterTab === "system") return item.type === "SYSTEM" || item.type === "ALERT";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryIcon = (type) => {
    switch (type) {
      case "ANNOUNCEMENT":
      case "COURSE":
        return <Megaphone className="text-orange-400" size={18} />;
      case "ALERT":
        return <AlertCircle className="text-rose-400" size={18} />;
      case "SYSTEM":
        return <Sparkles className="text-blue-400" size={18} />;
      default:
        return <Bell className="text-purple-400" size={18} />;
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "Recently";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Megaphone size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Announcements & Updates</h1>
          </div>
          <p className="text-xs text-slate-400 mt-2 max-w-xl">
            Stay informed with official course broadcasts, platform news, schedule changes, and live notifications.
          </p>
        </div>

        {/* Action Button */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-sm cursor-pointer shrink-0"
          >
            <CheckCheck size={16} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterTab === "all"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Updates ({notifications.length})
          </button>

          <button
            onClick={() => setFilterTab("unread")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterTab === "unread"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-slate-950 text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterTab("announcement")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterTab === "announcement"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Course Notices
          </button>

          <button
            onClick={() => setFilterTab("system")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterTab === "system"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            System & News
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition"
          />
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center border border-slate-800/80 bg-slate-900/40 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Bell size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-200">No Announcements Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? "No items match your search query. Try clearing your search keywords."
                : "You are all caught up! Check back later for new course announcements and updates."}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.read && markReadMutation.mutate(item.id)}
              className={`p-4 rounded-2xl border transition duration-200 flex items-start justify-between gap-4 cursor-pointer ${
                !item.read
                  ? "bg-slate-900/90 border-orange-500/30 shadow-md shadow-orange-500/5"
                  : "bg-slate-900/40 border-slate-800/60 hover:border-slate-700/60 opacity-80"
              }`}
            >
              {/* Left Side: Icon & Details */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 shrink-0 mt-0.5">
                  {getCategoryIcon(item.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white leading-snug truncate">
                      {item.title || "Course Announcement"}
                    </h3>

                    {!item.read && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {item.message || item.body || item.content}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-500" />
                      {formatTimestamp(item.createdAt)}
                    </span>
                    {item.courseTitle && (
                      <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 font-semibold border border-slate-700/40">
                        {item.courseTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Mark Read Action */}
              {!item.read && (
                <button
                  onClick={(e) => handleMarkAsRead(item.id, e)}
                  title="Mark as read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-slate-800 transition cursor-pointer shrink-0"
                >
                  <CheckCircle2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
