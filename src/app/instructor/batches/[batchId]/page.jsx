"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
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
  BookOpen,
  Plus,
  Calendar,
  TrendingUp,
  Flame,
  AlertTriangle,
  Pencil,
  Eye,
} from "lucide-react";

import {
  useBatchDetail,
  useEnrollableStudentsForBatch,
  useAddStudentToBatch,
  useRemoveStudentFromBatch,
  useBatchDetailDashboard,
  useBatchQuizzes,
  useBatchAnnouncements,
  useCreateBatchAnnouncement,
  useAddCourseToBatch,
  useRemoveCourseFromBatch,
} from "@/hooks/queries/instructor/useBatches";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Loader from "@/components/common/Loader";
import DataTable from "@/components/ui/DataTable";
import BatchActionsMenu from "@/components/instructor/batches/BatchActionsMenu";
import KpiTile from "@/components/instructor/batches/KpiTile";
import { useBatchPerformanceOverview } from "@/hooks/queries/instructor/useBatchPerformanceOverview";

// Dynamically imported so recharts is bundled once via this shared
// dynamic() boundary instead of duplicated into this route's own chunk.
const TrendSparkline = dynamic(() => import("@/components/instructor/batches/TrendSparkline"), {
  ssr: false,
  loading: () => <div className="h-16 animate-pulse bg-muted/50 rounded-xl" />,
});

const STUDENT_STATUS_STYLES = {
  "Top Performer": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "On Track": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Struggling: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Not Started": "bg-muted text-muted-foreground border-transparent",
};

const BATCH_STATUS_STYLES = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  COMPLETED: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  ARCHIVED: "bg-muted text-muted-foreground border-transparent",
};

const ACTIVITY_ICON = {
  LESSON_COMPLETED: { icon: CheckCircle2, color: "text-emerald-400" },
  ASSIGNMENT_SUBMITTED: { icon: Upload, color: "text-sky-400" },
  QUIZ_SCORED: { icon: Award, color: "text-primary" },
};

const SCHEDULE_ICON = {
  SESSION: { icon: Video, color: "text-sky-400", label: "Live Session" },
  EXAM: { icon: ClipboardList, color: "text-rose-400", label: "Exam" },
  ASSIGNMENT_DUE: { icon: ClipboardList, color: "text-amber-400", label: "Assignment Due" },
  QUIZ_DUE: { icon: HelpCircle, color: "text-primary", label: "Quiz Due" },
};

const MATERIAL_ICON = {
  VIDEO: FileVideo,
  PDF: FileText,
  DOCUMENT: FileText,
  PRESENTATION: FileText,
  FILE: FileText,
};

function StatusBadge({ status }) {
  const value = status || "ACTIVE";
  return (
    <span
      className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
        BATCH_STATUS_STYLES[value] || BATCH_STATUS_STYLES.ACTIVE
      }`}
    >
      {value}
    </span>
  );
}

function Section({ title, icon: Icon, iconBg = "bg-primary/10", iconColor = "text-primary", action, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
              <Icon size={13} />
            </div>
          )}
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
    <div className="rounded-xl border border-border bg-[#141930] p-3.5 text-center">
      <Icon size={16} className={`mx-auto mb-1.5 ${color}`} />
      <p className="text-lg font-black text-foreground leading-none">{value}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-1.5">{label}</p>
    </div>
  );
}

function activityText(item) {
  if (item.type === "LESSON_COMPLETED") {
    return (
      <>
        <span className="font-bold text-foreground">{item.studentName}</span> completed{" "}
        <span className="text-foreground">{item.title}</span>
        {item.subtitle ? <span className="text-muted-foreground"> in {item.subtitle}</span> : null}
      </>
    );
  }
  if (item.type === "ASSIGNMENT_SUBMITTED") {
    return (
      <>
        <span className="font-bold text-foreground">{item.studentName}</span> submitted{" "}
        <span className="text-foreground">{item.title}</span>
      </>
    );
  }
  return (
    <>
      <span className="font-bold text-foreground">{item.studentName}</span> scored{" "}
      <span className="text-primary font-bold">{item.percentage}%</span> on{" "}
      <span className="text-foreground">{item.title}</span>
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

function AddStudentPanel({ batchId, courseNames }) {
  const { data: enrollableStudents = [], isLoading: loadingEnrollable } = useEnrollableStudentsForBatch(batchId);
  const addStudent = useAddStudentToBatch();
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const handleAdd = () => {
    if (!selectedStudentId) return;
    addStudent.mutate({ batchId, studentId: selectedStudentId }, { onSuccess: () => setSelectedStudentId("") });
  };

  return (
    <Section title="Add Student" icon={UserPlus} iconBg="bg-emerald-500/10" iconColor="text-emerald-400">
      <div className="flex flex-col gap-2">
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          disabled={loadingEnrollable || enrollableStudents.length === 0}
          className="w-full bg-[#141930] border border-border text-xs px-3 py-2.5 rounded-xl outline-none text-foreground focus:border-primary/60 transition disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[#141930] [&>option]:text-foreground"
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
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-foreground bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
        >
          {addStudent.isPending ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
          Add to Batch
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2.5">
        Only students already enrolled in {courseNames || "this batch's courses"} can be added.
      </p>
    </Section>
  );
}

function BatchQuizzesPanel({ batchId }) {
  const { data: quizzes = [], isLoading } = useBatchQuizzes(batchId);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  const quizColumns = [
    {
      key: "title",
      header: "Quiz",
      render: (row) => <p className="font-bold text-foreground">{row.title}</p>,
    },
    {
      key: "attempted",
      header: "Attempted",
      render: (row) => (
        <div className="flex items-center gap-2 min-w-[100px]">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
              style={{ width: `${row.totalStudents > 0 ? (row.attemptedCount / row.totalStudents) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10.5px] font-bold text-foreground shrink-0">
            {row.attemptedCount}/{row.totalStudents}
          </span>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      align: "center",
      render: (row) => (row.dueDate ? new Date(row.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/instructor/quizzes/${row.id}`}
            title="View Quiz — see, add, remove & edit questions"
            className="p-2 rounded-lg border border-transparent bg-background/60 hover:bg-muted text-emerald-400 hover:text-emerald-300 transition"
          >
            <Eye size={13} />
          </Link>
          <Link
            href={`/instructor/quizzes/edit/${row.id}`}
            title="Edit Quiz Details"
            className="p-2 rounded-lg border border-transparent bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <Pencil size={13} />
          </Link>
          <Link
            href={`/instructor/questions/create/${row.id}`}
            title="Add Question"
            className="p-2 rounded-lg border border-transparent bg-background/60 hover:bg-muted text-primary hover:text-orange-300 transition"
          >
            <Plus size={13} />
          </Link>
          <Link
            href={`/instructor/quizzes/${row.id}/import-questions`}
            title="Import Questions from Repository"
            className="p-2 rounded-lg border border-transparent bg-background/60 hover:bg-muted text-sky-400 hover:text-sky-300 transition"
          >
            <Upload size={13} />
          </Link>
        </div>
      ),
    },
  ];

  const studentAttemptColumns = [
    {
      key: "name",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{row.email}</p>
        </div>
      ),
    },
    {
      key: "attempted",
      header: "Status",
      render: (row) => (
        <span
          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            row.attempted
              ? row.passed
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : "bg-muted text-muted-foreground border-transparent"
          }`}
        >
          {row.attempted ? (row.passed ? "Passed" : "Failed") : "Not Attempted"}
        </span>
      ),
    },
    {
      key: "percentage",
      header: "Score",
      align: "center",
      render: (row) => (row.attempted ? `${row.percentage}%` : "—"),
    },
    {
      key: "submittedAt",
      header: "Submitted",
      align: "center",
      render: (row) => (row.submittedAt ? formatDistanceToNow(new Date(row.submittedAt), { addSuffix: true }) : "—"),
    },
  ];

  return (
    <Section title="Batch Quizzes" icon={HelpCircle} iconBg="bg-primary/10" iconColor="text-primary">
      <p className="text-[10.5px] text-muted-foreground -mt-2 mb-3">
        Quizzes assigned to this batch. Click one to see which students attempted it.
      </p>
      <DataTable
        columns={quizColumns}
        rows={quizzes}
        isLoading={isLoading}
        skeletonRows={3}
        onRowClick={(row) => setSelectedQuizId(row.id === selectedQuizId ? null : row.id)}
        emptyLabel={
          <span>
            No quizzes assigned to this batch yet.
            <br />
            Create one from the Quizzes page and pick this batch.
          </span>
        }
      />

      {selectedQuiz && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-2.5">
            {selectedQuiz.title} — Student Attempts
          </p>
          <DataTable columns={studentAttemptColumns} rows={selectedQuiz.students} rowKey="studentId" emptyLabel="No students in this batch." />
        </div>
      )}
    </Section>
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
      iconBg="bg-rose-500/10"
      iconColor="text-rose-400"
      action={
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-[10.5px] font-bold text-primary hover:text-orange-300 transition"
        >
          {showForm ? "Cancel" : "+ New Announcement"}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3.5 rounded-xl border border-border bg-[#141930] space-y-2.5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full bg-card border border-border text-xs px-3 py-2.5 rounded-xl text-foreground placeholder-slate-500 outline-none focus:border-primary/60"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message to this batch..."
            required
            rows={3}
            className="w-full bg-card border border-border text-xs px-3 py-2.5 rounded-xl text-foreground placeholder-slate-500 outline-none focus:border-primary/60 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createAnnouncement.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10.5px] font-black text-foreground bg-primary hover:bg-orange-600 disabled:opacity-50 transition"
            >
              {createAnnouncement.isPending ? <Loader2 size={12} className="animate-spin" /> : <Megaphone size={12} />}
              Send to Batch
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-6 text-center text-xs text-muted-foreground">Loading...</div>
      ) : announcements.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs font-bold text-muted-foreground">No announcements yet.</p>
          <p className="text-[10.5px] text-slate-600 mt-1">Send one to reach every student in this batch at once.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {announcements.map((a) => (
            <div key={a.id} className="p-3 rounded-xl border border-border bg-[#141930]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-foreground">{a.title}</p>
                <p className="text-[9.5px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function ManageCoursesPanel({ batchId, batchCourses }) {
  const { data: allCourses = [] } = useInstructorCourses();
  const addCourse = useAddCourseToBatch();
  const removeCourse = useRemoveCourseFromBatch();
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const linkedIds = new Set(batchCourses.map((c) => c.id));
  const availableCourses = allCourses.filter((c) => !linkedIds.has(c.id));

  const handleAdd = () => {
    if (!selectedCourseId) return;
    addCourse.mutate({ batchId, courseId: selectedCourseId }, { onSuccess: () => setSelectedCourseId("") });
  };

  return (
    <Section title="Courses" icon={BookOpen} iconBg="bg-blue-500/10" iconColor="text-blue-400">
      <div className="flex flex-wrap gap-2 mb-3.5">
        {batchCourses.map((course) => (
          <span
            key={course.id}
            className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full border border-border bg-[#141930] text-[11px] font-bold text-foreground max-w-full"
          >
            <span className="truncate">{course.title}</span>
            <button
              type="button"
              onClick={() => removeCourse.mutate({ batchId, courseId: course.id })}
              disabled={removeCourse.isPending || batchCourses.length <= 1}
              title={batchCourses.length <= 1 ? "A batch needs at least one course" : "Remove from batch"}
              className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>

      {availableCourses.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="flex-1 bg-[#141930] border border-border text-xs px-3 py-2.5 rounded-xl outline-none text-foreground focus:border-primary/60 transition [&>option]:bg-[#141930] [&>option]:text-foreground"
          >
            <option value="">Add another course...</option>
            {availableCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedCourseId || addCourse.isPending}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-foreground bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
          >
            {addCourse.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Add
          </button>
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

  const courseNames = useMemo(
    () => (batch?.courses || []).map((c) => c.title).join(", "),
    [batch]
  );

  if (isLoading) return <Loader />;

  if (!batch) {
    return <div className="py-16 text-center text-muted-foreground">Batch not found.</div>;
  }

  const students = batch.students || [];
  const courses = batch.courses || [];
  const performanceBatch = overview?.batches?.find((b) => b.id === batchId);
  const primaryCourseId = courses[0]?.id;
  const scheduleGroups = dashboard ? groupSchedule(dashboard.upcomingSchedule) : [];

  const studentListColumns = [
    {
      key: "name",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{row.email}</p>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (row) => (
        <div className="flex items-center gap-2 min-w-[100px]">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500" style={{ width: `${row.progress}%` }} />
          </div>
          <span className="text-[10.5px] font-bold text-foreground w-8 text-right">{row.progress}%</span>
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
      <Link
        href="/instructor/batches"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft size={13} />
        Back to Batches
      </Link>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0D1021] via-[#0D1021] to-[#171224] p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
              <h1 className="text-2xl font-black text-foreground tracking-tight">{batch.name}</h1>
              <StatusBadge status={batch.status} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
              {courses.length > 0 ? (
                courses.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
                  >
                    <BookOpen size={10} className="text-primary" />
                    {c.title}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground">No courses linked</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-muted-foreground" />
                Started {batch.startDate ? new Date(batch.startDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={12} className="text-muted-foreground" />
                {students.length} Student{students.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {performanceBatch && (
            <div className="lg:w-auto w-full shrink-0">
              <BatchActionsMenu batch={performanceBatch} hideViewDetails />
            </div>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full">
        <KpiTile
          label="Students"
          value={students.length}
          icon={Users}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
          bottomText={dashboard ? `${dashboard.studentSummary.active} active` : "Enrolled in batch"}
        />
        <KpiTile
          label="Completion"
          value={`${performanceBatch?.completion ?? 0}%`}
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          bottomText="Overall progress"
        />
        <KpiTile
          label="Avg Quiz"
          value={performanceBatch?.avgQuizScore != null ? `${performanceBatch.avgQuizScore}%` : "N/A"}
          icon={Award}
          iconBg="bg-sky-500/10"
          iconColor="text-sky-400"
          bottomText="Across batch"
        />
        <KpiTile
          label="Engagement"
          value={performanceBatch?.engagementStatus ?? "No Data"}
          icon={Flame}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-400"
          bottomText="Batch health"
        />
        <KpiTile
          label="Need Help"
          value={dashboard?.studentSummary.needHelp ?? 0}
          icon={AlertTriangle}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-400"
          bottomText="Low progress"
        />
      </div>

      {/* Two-column dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Recent Activity" icon={CalendarClock} iconBg="bg-amber-500/10" iconColor="text-amber-400">
            {loadingDashboard ? (
              <div className="py-6 text-center text-xs text-muted-foreground">Loading...</div>
            ) : !dashboard || dashboard.recentActivity.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs font-bold text-muted-foreground">No activity yet.</p>
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

          <Section title="Upcoming Schedule" icon={CalendarClock} iconBg="bg-sky-500/10" iconColor="text-sky-400">
            {loadingDashboard ? (
              <div className="py-6 text-center text-xs text-muted-foreground">Loading...</div>
            ) : scheduleGroups.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs font-bold text-muted-foreground">Nothing scheduled.</p>
                <p className="text-[10.5px] text-slate-600 mt-1">Live sessions, exams, and due dates will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduleGroups.map(([label, items]) => (
                  <div key={label}>
                    <p className="text-[9.5px] font-black uppercase tracking-wider text-primary/80 mb-2">{label}</p>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const config = SCHEDULE_ICON[item.type];
                        const Icon = config.icon;
                        return (
                          <div key={item.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-[#141930]">
                            <Icon size={13} className={config.color} />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-foreground truncate">{item.title}</p>
                              <p className="text-[9.5px] text-muted-foreground">{config.label}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground shrink-0">
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

          <Section title="Student List" icon={Users} iconBg="bg-purple-500/10" iconColor="text-purple-400">
            <DataTable
              columns={studentListColumns}
              rows={dashboard?.studentList || []}
              isLoading={loadingDashboard}
              skeletonRows={4}
              emptyLabel={
                <span>
                  No students in this batch yet.
                  <br />
                  Use the Add Student panel to enroll learners.
                </span>
              }
            />
          </Section>

          <BatchQuizzesPanel batchId={batchId} />

          <AnnouncementsPanel batchId={batchId} />

          <Section title="Files & Resources" icon={FileText} iconBg="bg-slate-500/10" iconColor="text-muted-foreground">
            <p className="text-[10.5px] text-muted-foreground -mt-2 mb-3">
              Materials shared across {courseNames || "this batch's courses"} — not exclusive to this batch.
            </p>
            {loadingDashboard ? (
              <div className="py-6 text-center text-xs text-muted-foreground">Loading...</div>
            ) : !dashboard || dashboard.courseMaterials.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs font-bold text-muted-foreground">No materials uploaded yet.</p>
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
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-[#141930] hover:border-transparent transition"
                    >
                      <Icon size={14} className="text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-foreground truncate">{m.title}</p>
                        <p className="text-[9.5px] text-muted-foreground truncate">
                          {m.moduleTitle} &middot; {m.lessonTitle}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ManageCoursesPanel batchId={batchId} batchCourses={courses} />

          <AddStudentPanel batchId={batchId} courseNames={courseNames} />

          {performanceBatch && (
            <Section title="Batch Performance" icon={Award} iconBg="bg-pink-500/10" iconColor="text-pink-400">
              <div className="space-y-3">
                <TrendSparkline label="Completion Trend" data={performanceBatch.trend.completion} color="#ff7a00" />
                <TrendSparkline label="Quiz Trend" data={performanceBatch.trend.quiz} color="#38bdf8" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <SummaryTile icon={Users} label="Attendance" value="N/A" color="text-muted-foreground" />
                <SummaryTile icon={CheckCircle2} label="Engagement" value={performanceBatch.engagementStatus} color="text-sky-400" />
              </div>
              <div className="mt-3 text-right">
                <Link
                  href={primaryCourseId ? `/instructor/analytics?courseId=${primaryCourseId}` : "/instructor/analytics"}
                  className="text-[10.5px] font-bold text-primary hover:text-orange-300 transition"
                >
                  View Full Analytics &rarr;
                </Link>
              </div>
            </Section>
          )}

          {dashboard && (
            <Section title="Student Summary" icon={BookOpenCheck} iconBg="bg-emerald-500/10" iconColor="text-emerald-400">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SummaryTile icon={Users} label="Total" value={dashboard.studentSummary.total} color="text-muted-foreground" />
                <SummaryTile icon={UserCheck} label="Active" value={dashboard.studentSummary.active} color="text-emerald-400" />
                <SummaryTile icon={CheckCircle2} label="Completed" value={dashboard.studentSummary.completed} color="text-sky-400" />
                <SummaryTile icon={UserX} label="Need Help" value={dashboard.studentSummary.needHelp} color="text-rose-400" />
              </div>
            </Section>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!studentPendingRemoval}
        title="Remove Student"
        message={`Remove ${studentPendingRemoval?.name || "this student"} from ${batch.name}? They'll stay enrolled in their courses, just no longer part of this batch.`}
        confirmText="Remove"
        onConfirm={handleConfirmRemove}
        onCancel={() => setStudentPendingRemoval(null)}
        loading={removeStudent.isPending}
      />
    </div>
  );
}
