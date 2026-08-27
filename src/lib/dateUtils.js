export const formatTime = (timeStr) => {
  if (!timeStr) return "";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) return timeStr;
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

export const toMinutesSinceMidnight = (timeStr) => {
  if (!timeStr) return null;
  const t = timeStr.trim().toLowerCase();
  const ampmMatch = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)/);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2], 10);
    if (ampmMatch[3] === "pm" && h !== 12) h += 12;
    if (ampmMatch[3] === "am" && h === 12) h = 0;
    return h * 60 + m;
  }
  const parts = t.split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

// Relative "time ago" label for a millisecond timestamp — e.g. Q&A threads
// and replies, activity feed entries.
export const timeAgo = (timestamp) => {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Short "DD Mon YYYY" date label used throughout the batch workspace pages —
// `fallback` covers the "no date yet" case, which differs by call site
// ("Date TBA", "No due date", "—", or just an empty string).
export const formatShortDate = (value, fallback = "") => {
  if (!value) return fallback;
  return new Date(value).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDueIn = (dateObj) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((dateObj - startOfToday) / 86400000);
  const dateLabel = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  if (diffDays <= 0) return `Due today • ${dateLabel}`;
  if (diffDays === 1) return `Due tomorrow • ${dateLabel}`;
  return `Due in ${diffDays} days • ${dateLabel}`;
};
