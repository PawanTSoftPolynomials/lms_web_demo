"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Trash2,
  Search,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Link,
  Star,
  Loader2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import {
  useBookmarks,
  useDeleteBookmark,
} from "@/hooks/queries/student/useBookmarks";

const TYPE_TABS = ["All", "Lesson", "Video", "Document", "Note", "Web Link", "Course"];

const typeIcon = (type) => {
  switch (type) {
    case "Video": return <Video size={14} />;
    case "Document": return <FileText size={14} />;
    case "Web Link": return <Link size={14} />;
    case "Course": return <Star size={14} />;
    default: return <BookOpen size={14} />;
  }
};

const typeColor = (type) => {
  switch (type) {
    case "Video": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "Document": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "Web Link": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    case "Course": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    default: return "text-orange-400 bg-orange-500/10 border-orange-500/20";
  }
};

export default function BookmarksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: bookmarks = [], isLoading, isError } = useBookmarks();
  const deleteBookmark = useDeleteBookmark();

  const filtered = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesType = activeTab === "All" || b.type === activeTab;
      const matchesSearch =
        !searchQuery ||
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.detail?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [bookmarks, activeTab, searchQuery]);

  const handleDelete = async (id) => {
    if (!confirm("Remove this bookmark?")) return;
    try { await deleteBookmark.mutateAsync(id); } catch {}
  };

  const handleCardClick = (bookmark) => {
    if (bookmark.type === "Course" && bookmark.courseId) {
      router.push(`/student/courses/${bookmark.courseId}`);
    } else if (
      (bookmark.type === "Lesson" || bookmark.type === "Video" || bookmark.type === "Document") &&
      bookmark.courseId &&
      bookmark.lessonId
    ) {
      router.push(`/student/learn/${bookmark.courseId}?lessonId=${bookmark.lessonId}`);
    } else if (bookmark.type === "Note") {
      router.push("/student/notes");
    } else if (bookmark.url) {
      window.open(bookmark.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Bookmarks</h1>
          <p className="text-xs text-slate-400 mt-1">{bookmarks.length} saved items</p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-orange-500 transition"
          />
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
              activeTab === tab
                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                : "bg-slate-900/50 text-slate-400 border-slate-800/80 hover:border-orange-500/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading bookmarks…
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-20 text-red-500 gap-2 text-sm">
          <AlertCircle size={18} /> Failed to load bookmarks. Please refresh.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-40 text-slate-450" />
          <p className="text-sm font-semibold text-white">No bookmarks found</p>
          <p className="text-xs mt-1 text-slate-400">Bookmark lessons, videos, and docs while studying to find them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((bookmark) => (
            <div
              key={bookmark.id}
              onClick={() => handleCardClick(bookmark)}
              className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl px-5 py-4 shadow-luxury-md hover:border-orange-500/30 transition group flex items-center gap-4 cursor-pointer hover:bg-slate-900/80"
            >
              {/* Type Icon */}
              <div className={`p-2.5 rounded-xl flex-shrink-0 border ${typeColor(bookmark.type)}`}>
                {typeIcon(bookmark.type)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white truncate">{bookmark.title}</h3>
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeColor(bookmark.type)}`}>
                    {bookmark.type}
                  </span>
                </div>
                {bookmark.detail && (
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{bookmark.detail}</p>
                )}
                <span className="text-[9px] text-slate-500 mt-1.5 block font-semibold">
                  {new Date(bookmark.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                {bookmark.url && (
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 hover:bg-orange-500/10 rounded-xl transition text-slate-400 hover:text-orange-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(bookmark.id);
                  }}
                  className="p-2 hover:bg-red-500/10 rounded-xl transition text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
