import { Video, ClipboardList, ClipboardCheck, HelpCircle, Clock } from "lucide-react";

export const getBadgeStyle = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "class" || t === "lecture") {
    return { label: "Lecture", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  }
  if (t === "office hours" || t === "session" || t === "q&a" || t === "live_class") {
    return { label: "Live Class", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
  }
  if (t === "assignment" || t === "deadline") {
    return { label: "Assignment Due", className: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  }
  if (t === "exam") {
    return { label: "Exam", className: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  }
  if (t === "quiz") {
    return { label: "Quiz Starts", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
  }
  return { label: type || "Event", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
};

export const getEventIcon = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "class" || t === "lecture" || t === "office hours" || t === "session" || t === "q&a" || t === "live_class") return Video;
  if (t === "assignment" || t === "deadline") return ClipboardList;
  if (t === "exam") return ClipboardCheck;
  if (t === "quiz") return HelpCircle;
  return Clock;
};

export const getMobileEventBadge = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "assignment" || t === "deadline") return { label: "Assignment", className: "bg-purple-500/15 text-purple-300" };
  if (t === "exam") return { label: "Exam", className: "bg-rose-500/15 text-rose-300" };
  if (t === "quiz") return { label: "Quiz", className: "bg-orange-500/15 text-orange-300" };
  return { label: "Live Class", className: "bg-blue-500/15 text-blue-300" };
};
