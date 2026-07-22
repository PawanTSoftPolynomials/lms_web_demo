"use client";

import { useState, useEffect } from "react";
import {
  X,
  Check,
  AlertCircle,
  Search,
  BookPlus,
  UserPlus,
  UserCheck,
  Award,
  Megaphone,
  Layers,
  Activity,
  RotateCcw,
  ShieldCheck,
  Send,
  FileSpreadsheet,
  Download,
  Terminal,
  ChevronRight
} from "lucide-react";

export default function ActionDrawerModal({ actionState, onClose, onPerformAction }) {
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setFormData({});
    setSuccessMessage("");
    setIsSubmitting(false);
  }, [actionState]);

  if (!actionState) return null;

  const { type, title, data } = actionState;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(`Operation completed successfully for: ${title}`);
      setTimeout(() => {
        onClose();
      }, 1400);
    }, 600);
  };

  // Search Command Palette View
  if (type === "search_palette") {
    const searchResults = [
      { category: "Courses", title: "Enterprise Cybersecurity Governance & Risk", path: "Queue: Pending Approval" },
      { category: "Courses", title: "Cloud Microservices Architecture", path: "Active • 245 Students" },
      { category: "Instructors", title: "Dr. Aris Thorne", path: "AI & ML Department • Rating 4.9" },
      { category: "Instructors", title: "Prof. Elena Rostova", path: "Application Pending Review" },
      { category: "Students", title: "Alex Rivera", path: "Behind Schedule • Cybersecurity 101" },
      { category: "Tickets", title: "Ticket #ST-991: Proctoring extension conflict", path: "Support Desk • Unread" },
      { category: "System", title: "PostgreSQL Database Cluster Indexing", path: "System Health • Healthy" }
    ].filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-16 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
          <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3.5 bg-slate-950">
            <Search className="h-4 w-4 text-orange-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type course name, instructor, student ID, system service, or ticket..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-3 space-y-1">
            {searchResults.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No matching enterprise entities found for "{searchQuery}"</p>
            ) : (
              searchResults.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    alert(`Navigating to ${res.category}: ${res.title}`);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/80 cursor-pointer transition border border-transparent hover:border-slate-700"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-orange-400">{res.category}</span>
                    <h5 className="text-xs font-bold text-white">{res.title}</h5>
                    <p className="text-[11px] text-slate-400">{res.path}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-800 px-4 py-2 bg-slate-950 text-[11px] text-slate-500 flex justify-between">
            <span>Press ESC to exit</span>
            <span>Orange Tree LMS Admin Command Palette</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-slate-900 p-6 shadow-2xl ring-1 ring-white/10 animate-in slide-in-from-right duration-200 overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400">
              Administrative Command Workflow
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="my-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-emerald-300 flex items-center gap-3">
            <Check className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-bold">{successMessage}</p>
          </div>
        )}

        {/* Dynamic Workflow Content */}
        <div className="mt-4 flex-1">
          {/* Quick Action Forms */}
          {type === "create_course" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Cloud Security & Risk Management"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Lead Instructor</label>
                  <select className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none">
                    <option>Dr. Aris Thorne</option>
                    <option>Prof. Elena Rostova</option>
                    <option>Marcus Vance</option>
                    <option>Assign Later (Unassigned)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    defaultValue="Computer Science & Engineering"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Syllabus Overview & Target Competencies</label>
                <textarea
                  rows={4}
                  placeholder="Enter course scope, learning objectives, and lab setup requirements..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition">
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          )}

          {type === "add_instructor" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Legal Name</label>
                <input type="text" required placeholder="Dr. Jane Doe" className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Institutional Email</label>
                  <input type="email" required placeholder="j.doe@university.edu" className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Academic Department</label>
                  <input type="text" defaultValue="Artificial Intelligence & ML" className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Verification Documents & Portfolio Link</label>
                <input type="url" placeholder="https://credentials.university.edu/verify/ins-101" className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition">
                  {isSubmitting ? "Processing..." : "Register Instructor"}
                </button>
              </div>
            </form>
          )}

          {/* Generic Item Details / Review View */}
          {data && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Item Inspection</h4>
                <p className="text-sm font-bold text-white mt-1">{data.title || data.name || data.action || title}</p>
                <p className="text-xs text-slate-400 mt-1">{data.details || data.description || data.message || "Detailed operational record payload loaded for administrative decision."}</p>
                
                {data.priority && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Priority Tier:</span>
                    <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-extrabold text-rose-300 border border-rose-500/30">
                      {data.priority}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Administrator Review Notes</label>
                <textarea rows={3} placeholder="Enter official decision rationale, override note, or audit comment..." className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none" />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button onClick={onClose} className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      setIsSubmitting(false);
                      setSuccessMessage("Approved & Executed successfully!");
                      setTimeout(onClose, 1200);
                    }, 500);
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                >
                  Approve / Execute Action
                </button>
              </div>
            </div>
          )}

          {/* Catch-all Default Form if no data */}
          {!type?.includes("create") && !type?.includes("add") && !data && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                You are performing administrative action: <span className="font-bold text-white">{title}</span>. All actions are recorded in the system compliance audit trail.
              </p>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Action Parameters</label>
                <textarea rows={4} placeholder="Enter command parameters or rationale..." className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button onClick={onClose} className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">Cancel</button>
                <button onClick={() => { setSuccessMessage("Action Executed Successfully"); setTimeout(onClose, 1200); }} className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600">Execute</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
