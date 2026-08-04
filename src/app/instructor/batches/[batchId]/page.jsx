"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Users,
  UserPlus,
  X,
  Loader2,
  CheckCircle2,
  Upload,
  Award,
  Video,
  ClipboardList,
  HelpCircle,
  CalendarClock,
  Megaphone,
  FileText,
  FileVideo,
  Link2,
  BookOpenCheck,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  useBatchDetail,
  useEnrollableStudentsForBatch,
  useAddStudentToBatch,
  useRemoveStudentFromBatch,
  useBatchDetailDashboard,
  useBatchAnnouncements,
  useCreateBatchAnnouncement,
} from "@/hooks/queries/instructor/useBatches";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Loader from "@/components/common/Loader";
import DataTable from "@/components/ui/DataTable";
import BatchActionsMenu from "@/components/instructor/batches/BatchActionsMenu";
import TrendSparkline from "@/components/instructor/batches/TrendSparkline";
import { useBatchPerformanceOverview } from "@/hooks/queries/instructor/useBatchPerformanceOverview";

const STUDENT_STATUS_STYLES = {
  "Top Performer": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "On Track": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Struggling: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Not Started": "bg-slate-800 text-slate-400 border-slate-700",
};

const ACTIVITY_ICON = {
  LESSON_COMPLETED: { icon: CheckCircle2, color: "text-emerald-400" },
  ASSIGNMENT_SUBMITTED: { icon: Upload, color: "text-sky-400" },
  QUIZ_SCORED: { icon: Award, color: "text-orange-400" },
};

const SCHEDULE_ICON = {
  SESSION: { icon: Video, color: "text-sky-400", label: "Live Session" },
  EXAM: { icon: ClipboardList, color: "text-rose-400", label: "Exam" },
  ASSIGNMENT_DUE: { icon: ClipboardList, color: "text-amber-400", label: "Assignment Due" },
  QUIZ_DUE: { icon: HelpCircle, color: "text-orange-400", label: "Quiz Due" },
};

const MATERIAL_ICON = {
  VIDEO: FileVideo,
  PDF: FileText,
  DOCUMENT: FileText,
  PRESENTATION: FileText,
  FILE: FileText,
};

function Section({ title, icon: Icon, action, children }) {
  return (
    <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-orange-450" />}
          <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-350">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-[#1A1F35] bg-[#141930] p-3.5 text-center">
      <Icon size={16} className={`mx-auto mb-1.5 ${color}`} />
      <p className="text-lg font-black text-white leading-none">{value}</p>
      <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-1.5">{label}</p>
    </div>
  );
}

function activityText(item) {
  if (item.type === "LESSON_COMPLETED") {
    return (
      <>
        <span className="font-bold text-slate-200">{item.studentName}</span> completed{" "}
        <span className="text-slate-300">{item.title}</span>
        {item.subtitle ? <span className="text-slate-500"> in {item.subtitle}</span> : null}
      </>
    );
  }
  if (item.type === "ASSIGNMENT_SUBMITTED") {
    return (
      <>
        <span className="font-bold text-slate-200">{item.studentName}</span> submitted{" "}
        <span className="text-slate-300">{item.title}</span>
      </>
    );
  }
  return (
    <>
      <span className="font-bold text-slate-200">{item.studentName}</span> scored{" "}
      <span className="text-orange-400 font-bold">{item.percentage}%</span> on{" "}
      <span className="text-slate-300">{item.title}</span>
    </>
  );
}

function groupSchedule(items) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - startOfToday.getDay()));
  const endOfNextWeek = new Date(endOfWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

  const groups = { Today: [], Tomorrow: [], "This Week": [], "Next Week": [], Later: [] };
  items.forEach((item) => {
    const date = new Date(item.date);
    if (date < startOfTomorrow) groups.Today.push(item);
    else if (date < new Date(startOfTomorrow.getTime() + 86400000)) groups.Tomorrow.push(item);
    else if (date < endOfWeek) groups["This Week"].push(item);
    else if (date < endOfNextWeek) groups["Next Week"].push(item);
    else groups.Later.push(item);
  });
  return Object.entries(groups).filter(([, list]) => list.length > 0);
}

function AddStudentPanel({ batchId, courseTitle }) {
  const { data: enrollableStudents = [], isLoading: loadingEnrollable } = useEnrollableStudentsForBatch(batchId);
  const addStudent = useAddStudentToBatch();
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const handleAdd = () => {
    if (!selectedStudentId) return;
    addStudent.mutate({ batchId, studentId: selectedStudentId }, { onSuccess: () => setSelectedStudentId("") });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          disabled={loadingEnrollable || enrollableStudents.length === 0}
          className="flex-1 bg-[#141930] border border-[#1A1F35] text-xs px-3 py-2.5 rounded-xl outline-none text-slate-200 focus:border-orange-500/60 transition disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[#141930] [&>option]:text-slate-200"
        >
          <option value="">
            {loadingEnrollable
              ? "Loading students..."
              : enrollableStudents.length === 0
              ? "No enrolled students available to add"
              : "Select a student"}
          </option>
          {enrollableStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.user?.name} ({s.user?.email})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedStudentId || addStudent.isPending}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
        >
          {addStudent.isPending ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
          Add
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mt-2">
        Only students already enrolled in {courseTitle || "this course"} can be added to a batch.
      </p>
    </div>
  );
}

function AnnouncementsPanel({ batchId }) {
  const { data: announcements = [], isLoading } = useBatchAnnouncements(batchId);
  const createAnnouncement = useCreateBatchAnnouncement();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    createAnnouncement.mutate(
      { batchId, title, message },
      {
        onSuccess: () => {
          setTitle("");
          setMessage("");
          setShowForm(false);
        },
      }
    );
  };

  return (
    <Section
      title="Batch Announcements"
      icon={Megaphone}
      action={
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-[10.5px] font-bold text-orange-400 hover:text-orange-300 transition"
        >
          {showForm ? "Cancel" : "+ New Announcement"}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3.5 rounded-xl border border-[#1A1F35] bg-[#141930] space-y-2.5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full bg-[#0D1021] border border-[#1A1F35] text-xs px-3 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none focus:border-orange-500/60"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message to this batch..."
            required
            rows={3}
            className="w-full bg-[#0D1021] border border-[#1A1F35] text-xs px-3 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none focus:border-orange-500/60 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createAnnouncement.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10.5px] font-black text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition"
            >
              {createAnnouncement.isPending ? <Loader2 size={12} className="animate-spin" /> : <Megaphone size={12} />}
              Send to Batch
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-500">Loading...</div>
      ) : announcements.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs font-bold text-slate-500">No announcements yet.</p>
          <p className="text-[10.5px] text-slate-600 mt-1">Send one to reach every student in this batch at once.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {announcements.map((a) => (
            <div key={a.id} className="p-3 rounded-xl border border-[#1A1F35] bg-[#141930]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-200">{a.title}</p>
                <p className="text-[9.5px] text-slate-500 shrink-0">
                  {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

export default function BatchDetailPage() {
  const { batchId } = useParams();
  const { data: batch, isLoading } = useBatchDetail(batchId);
  const removeStudent = useRemoveStudentFromBatch();
  const { data: dashboard, isLoading: loadingDashboard } = useBatchDetailDashboard(batchId);
  const { data: overview } = useBatchPerformanceOverview({ batchId });

  const [studentPendingRemoval, setStudentPendingRemoval] = useState(null);

  const handleConfirmRemove = () => {
    if (!studentPendingRemoval) return;
    removeStudent.mutate(
      { batchId, studentId: studentPendingRemoval.id },
      { onSuccess: () => setStudentPendingRemoval(null) }
    );
  };

  if (isLoading) return <Loader />;

  if (!batch) {
    return <div className="py-16 text-center text-slate-400">Batch not found.</div>;
  }

  const students = batch.students || [];
  const performanceBatch = overview?.batches?.find((b) => b.id === batchId);
  const scheduleGroups = dashboard ? groupSchedule(dashboard.upcomingSchedule) : [];

  const studentListColumns = [
    {
      key: "name",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-200">{row.name}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{row.email}</p>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (row) => (
        <div className="flex items-center gap-2 min-w-[100px]">
          <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500" style={{ width: `${row.progress}%` }} />
          </div>
          <span className="text-[10.5px] font-bold text-slate-300 w-8 text-right">{row.progress}%</span>
        </div>
      ),
    },
    {
      key: "attendanceRate",
      header: "Attendance",
      align: "center",
      render: (row) => (row.attendanceRate != null ? `${row.attendanceRate}%` : "N/A"),
    },
    {
      key: "quizAverage",
      header: "Quiz Avg",
      align: "center",
      render: (row) => (row.quizAverage != null ? `${row.quizAverage}%` : "N/A"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${STUDENT_STATUS_STYLES[row.status] || STUDENT_STATUS_STYLES["Not Started"]}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <button
          type="button"
          onClick={() => setStudentPendingRemoval({ id: row.id, name: row.name })}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 transition"
        >
          <X size={11} />
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/instructor/batches"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft size={13} />
          Back to Batches
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">{batch.name}</h1>
            <p className="text-xs text-slate-400 mt-1">{batch.course?.title}</p>
          </div>
          {performanceBatch && (
            <div className="sm:w-auto w-full">
              <BatchActionsMenu batch={performanceBatch} />
            </div>
          )}
        </div>
      </div>

      {/* Overview */}
      <Section title="Overview" icon={Users}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-wide">Course</p>
            <p className="text-xs font-bold text-slate-200 mt-1">{batch.course?.title}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-wide">Status</p>
            <p className="text-xs font-bold text-slate-200 mt-1">{batch.status || "ACTIVE"}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-wide">Start Date</p>
            <p className="text-xs font-bold text-slate-200 mt-1">
              {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-wide">Students</p>
            <p className="text-xs font-bold text-slate-200 mt-1">{students.length}</p>
          </div>
        </div>
      </Section>

      {/* Progress */}
      {performanceBatch && (
        <Section title="Progress" icon={BookOpenCheck}>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Course Completion</span>
            <span className="text-slate-300 text-xs">{performanceBatch.completion}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
              style={{ width: `${performanceBatch.completion}%` }}
            />
          </div>
        </Section>
      )}

      {/* Add Student */}
      <Section title="Add Student" icon={UserPlus}>
        <AddStudentPanel batchId={batchId} courseTitle={batch.course?.title} />
      </Section>

      {/* Student Summary */}
      {dashboard && (
        <Section title="Student Summary" icon={Users}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryTile icon={Users} label="Total" value={dashboard.studentSummary.total} color="text-slate-400" />
            <SummaryTile icon={UserCheck} label="Active" value={dashboard.studentSummary.active} color="text-emerald-400" />
            <SummaryTile icon={CheckCircle2} label="Completed" value={dashboard.studentSummary.completed} color="text-sky-400" />
            <SummaryTile icon={UserX} label="Need Help" value={dashboard.studentSummary.needHelp} color="text-rose-400" />
          </div>
        </Section>
      )}

      {/* Recent Activity */}
      <Section title="Recent Activity" icon={CalendarClock}>
        {loadingDashboard ? (
          <div className="py-6 text-center text-xs text-slate-500">Loading...</div>
        ) : !dashboard || dashboard.recentActivity.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs font-bold text-slate-500">No activity yet.</p>
            <p className="text-[10.5px] text-slate-600 mt-1">Lesson completions, submissions, and quiz scores will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard.recentActivity.map((item, i) => {
              const { icon: Icon, color } = ACTIVITY_ICON[item.type];
              return (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`h-6 w-6 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] leading-snug">{activityText(item)}</p>
                    <p className="text-[9.5px] text-slate-600 mt-0.5">
                      {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Upcoming Schedule */}
      <Section title="Upcoming Schedule" icon={CalendarClock}>
        {loadingDashboard ? (
          <div className="py-6 text-center text-xs text-slate-500">Loading...</div>
        ) : scheduleGroups.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs font-bold text-slate-500">Nothing scheduled.</p>
            <p className="text-[10.5px] text-slate-600 mt-1">Live sessions, exams, and due dates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduleGroups.map(([label, items]) => (
              <div key={label}>
                <p className="text-[9.5px] font-black uppercase tracking-wider text-orange-400/80 mb-2">{label}</p>
                <div className="space-y-2">
                  {items.map((item) => {
                    const config = SCHEDULE_ICON[item.type];
                    const Icon = config.icon;
                    return (
                      <div key={item.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#1A1F35] bg-[#141930]">
                        <Icon size={13} className={config.color} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-200 truncate">{item.title}</p>
                          <p className="text-[9.5px] text-slate-500">{config.label}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 shrink-0">
                          {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Batch Performance */}
      {performanceBatch && (
        <Section title="Batch Performance" icon={Award}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <TrendSparkline label="Completion Trend" data={performanceBatch.trend.completion} color="#ff7a00" />
            <TrendSparkline label="Quiz Trend" data={performanceBatch.trend.quiz} color="#38bdf8" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryTile icon={Award} label="Avg Quiz" value={performanceBatch.avgQuizScore != null ? `${performanceBatch.avgQuizScore}%` : "N/A"} color="text-orange-400" />
            <SummaryTile icon={Users} label="Attendance" value="N/A" color="text-slate-500" />
            <SummaryTile icon={BookOpenCheck} label="Completion" value={`${performanceBatch.completion}%`} color="text-emerald-400" />
            <SummaryTile icon={CheckCircle2} label="Engagement" value={performanceBatch.engagementStatus} color="text-sky-400" />
          </div>
          <div className="mt-3 text-right">
            <Link href={`/instructor/analytics?courseId=${batch.course?.id}`} className="text-[10.5px] font-bold text-orange-400 hover:text-orange-300 transition">
              View Full Analytics &rarr;
            </Link>
          </div>
        </Section>
      )}

      {/* Student List */}
      <Section title="Student List" icon={Users}>
        <DataTable
          columns={studentListColumns}
          rows={dashboard?.studentList || []}
          isLoading={loadingDashboard}
          skeletonRows={4}
          emptyLabel={
            <span>
              No students in this batch yet.
              <br />
              Click &quot;Add Student&quot; above to enroll learners.
            </span>
          }
        />
      </Section>

      {/* Batch Announcements */}
      <AnnouncementsPanel batchId={batchId} />

      {/* Files & Resources */}
      <Section title="Files &amp; Resources" icon={FileText}>
        <p className="text-[10.5px] text-slate-500 -mt-2 mb-3">
          Materials shared across {batch.course?.title || "this course"} — not exclusive to this batch.
        </p>
        {loadingDashboard ? (
          <div className="py-6 text-center text-xs text-slate-500">Loading...</div>
        ) : !dashboard || dashboard.courseMaterials.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs font-bold text-slate-500">No materials uploaded yet.</p>
            <p className="text-[10.5px] text-slate-600 mt-1">Upload documents to a lesson and they&apos;ll show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dashboard.courseMaterials.map((m) => {
              const Icon = MATERIAL_ICON[m.type] || Link2;
              return (
                <a
                  key={m.id}
                  href={m.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#1A1F35] bg-[#141930] hover:border-slate-700 transition"
                >
                  <Icon size={14} className="text-orange-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-200 truncate">{m.title}</p>
                    <p className="text-[9.5px] text-slate-500 truncate">
                      {m.moduleTitle} &middot; {m.lessonTitle}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </Section>

      <ConfirmDialog
        open={!!studentPendingRemoval}
        title="Remove Student"
        message={`Remove ${studentPendingRemoval?.name || "this student"} from ${batch.name}? They'll stay enrolled in the course, just no longer part of this batch.`}
        confirmText="Remove"
        onConfirm={handleConfirmRemove}
        onCancel={() => setStudentPendingRemoval(null)}
        loading={removeStudent.isPending}
      />
    </div>
  );
}
