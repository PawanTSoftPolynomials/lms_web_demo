"use client";

import { useState, useRef} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  MoreVertical,
  Pencil,
  Copy,
  Archive,
  Trash2,
  Rocket,
  Undo2,
  Eye,
  Settings,
  Layers,
  BookOpen,
  Video,
  ClipboardCheck,
  Users,
  BarChart3,
  MonitorPlay,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Star,
} from "lucide-react";
import { getDisplayUrl } from "@/lib/blob";

import { useModules } from "@/hooks/queries/instructor/useModules";
import { useDeleteCourse } from "@/hooks/queries/instructor/useDeleteCourse";
import { useUpdateCourseStatus } from "@/hooks/queries/instructor/useUpdateCourseStatus";
import { useDuplicateCourse } from "@/hooks/queries/instructor/useDuplicateCourse";
import Loader from "@/components/common/Loader";

// Simple overlay to select a module
function SelectModuleOverlay({ courseId, onClose, onSelect }) {
  const { data: modules = [], isLoading } = useModules(courseId);
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 rounded-[28px] flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-white tracking-tight">Select a Module</h4>
        <button
          onClick={onClose}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
        >
          &times;
        </button>
      </div>
      {isLoading ? (
        <Loader />
      ) : modules.length === 0 ? (
        <p className="text-xs text-slate-500">No modules found. Create a module first.</p>
      ) : (
        <div className="overflow-y-auto space-y-2 flex-1">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-orange-500/30 hover:bg-white/[0.05] text-xs text-slate-300 hover:text-white transition-all duration-200"
            >
              <div className="font-bold truncate">{m.title}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const VISIBILITY_LABEL = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  UNLISTED: "Unlisted",
};

const Dot = () => <span className="w-0.5 h-0.5 rounded-full bg-slate-700 shrink-0" />;

export default function InstructorCourseCard({ course }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const deleteCourseMutation = useDeleteCourse();
  const updateCourseStatusMutation = useUpdateCourseStatus();
  const duplicateCourseMutation = useDuplicateCourse();

  const [activeOverlay, setActiveOverlay] = useState(null); // 'MODULE_SELECT' | null

  const handleAddLessonClick = (e) => {
    e.preventDefault();
    setActiveOverlay("MODULE_SELECT");
  };

  const handleModuleSelect = (module) => {
    router.push(`/instructor/lessons/create/${module.id}`);
    setActiveOverlay(null);
  };

  if (!course) return null;

  const isPublished =
    course.status === "PUBLISHED" || course.status === "Published";
  const isArchived = course.status === "ARCHIVED";
  const stats = course.stats || {};
  const count = course._count || {};
  const store = course.store || {};

  const handleTogglePublish = async () => {
    const nextStatus = isPublished ? "DRAFT" : "PUBLISHED";
    await updateCourseStatusMutation.mutateAsync({
      courseId: course.id,
      status: nextStatus,
    });
    setShowDropdown(false);
  };

  const handleArchive = async () => {
    await updateCourseStatusMutation.mutateAsync({
      courseId: course.id,
      status: "ARCHIVED",
    });
    setShowDropdown(false);
  };

  const handleDuplicate = async () => {
    await duplicateCourseMutation.mutateAsync(course.id);
    setShowDropdown(false);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
      )
    ) {
      await deleteCourseMutation.mutateAsync(course.id);
    }
    setShowDropdown(false);
  };

  const statusDotClass = isArchived
    ? "bg-slate-500"
    : isPublished
      ? "bg-emerald-400"
      : "bg-amber-400";

  const statusBadgeClass = isArchived
    ? "bg-white/[0.05] text-slate-400 border border-white/[0.06]"
    : isPublished
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      : "bg-amber-500/10 text-amber-400 border border-amber-500/20";

  const ToolbarButton = ({ icon: Icon, title, description, href, onClick }) => {
    const Component = href && !onClick ? Link : "button";
    return (
      <Component
        href={href}
        onClick={onClick}
        className="group/action relative flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.045] hover:border-orange-500/25 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(255,122,0,0.25)] active:translate-y-0 transition-all duration-200 ease-out text-left w-full"
      >
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.04] text-slate-400 group-hover/action:text-orange-400 group-hover/action:bg-orange-500/10 transition-colors duration-200">
          <Icon size={19} />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-[13px] font-bold text-slate-100 group-hover/action:text-white transition-colors duration-200">
            {title}
          </h4>
          <p className="text-[11px] font-medium text-slate-500 leading-snug">
            {description}
          </p>
        </div>
      </Component>
    );
  };

  const SummaryStat = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col items-center justify-center gap-1.5 py-4 px-2">
      <Icon size={14} className="text-slate-500" />
      <span className="text-[15px] font-bold text-white leading-none tabular-nums">
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );

  const IconAction = ({ icon: Icon, onClick, href, title }) => {
    const Component = href ? Link : "button";
    return (
      <Component
        href={href}
        onClick={onClick}
        title={title}
        className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.07] transition-all duration-200"
      >
        <Icon size={16} />
      </Component>
    );
  };

  return (
    <div className="relative [perspective:2000px] w-full group">
      <div
        className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* ==========================================
            FRONT SIDE: ACTION CENTER
        ========================================== */}
        <div className="relative bg-gradient-to-b from-[#12141c] to-[#0a0b11] border border-white/[0.07] rounded-[28px] p-7 [backface-visibility:hidden] flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_24px_60px_-24px_rgba(0,0,0,0.7)] hover:border-white/[0.12] transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Link
                href={`/instructor/courses/${course.id}`}
                className="relative h-16 w-24 shrink-0 rounded-xl overflow-hidden ring-1 ring-white/[0.08] shadow-md shadow-black/30 block group-hover:ring-white/[0.16] transition-all duration-200"
              >
                {course.thumbnailUrl ? (
                  <img
                    src={getDisplayUrl(course.thumbnailUrl)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-white/[0.03] flex items-center justify-center">
                    <MonitorPlay size={20} className="text-slate-600" />
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex flex-col gap-1.5">
                <h3
                  className="text-[19px] font-bold text-white tracking-tight leading-snug truncate"
                  title={course.title}
                >
                  {course.title}
                </h3>

                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="text-slate-400">
                    {course.category || "Programming"}
                  </span>
                  <Dot />
                  <span>{course.language || "English"}</span>
                  <Dot />
                  <span>{course.level || "Beginner"}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBadgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
                    {course.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[9px] font-bold text-slate-400 border border-white/[0.06]">
                    {VISIBILITY_LABEL[course.visibility] || "Public"}
                  </span>
                  {course.certificatesEnabled && (
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-[9px] font-bold text-indigo-400 border border-indigo-500/20">
                      Certificates
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <IconAction
                icon={Pencil}
                href={`/instructor/courses/edit/${course.id}`}
                title="Edit Settings"
              />
              <IconAction
                icon={BarChart3}
                onClick={() => setIsFlipped(true)}
                title="Course Insights"
              />

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.07] transition-all duration-200"
                >
                  <MoreVertical size={16} />
                </button>
                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/[0.08] bg-[#15171f] p-1.5 shadow-2xl shadow-black/50 z-20">
                      <button
                        onClick={handleTogglePublish}
                        className="w-full flex items-center gap-2.5 text-[13px] font-semibold px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors duration-150"
                      >
                        {isPublished ? (
                          <Undo2 size={14} />
                        ) : (
                          <Rocket size={14} />
                        )}{" "}
                        {isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={handleDuplicate}
                        className="w-full flex items-center gap-2.5 text-[13px] font-semibold px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors duration-150"
                      >
                        <Copy size={14} /> Duplicate
                      </button>
                      <button
                        onClick={handleArchive}
                        className="w-full flex items-center gap-2.5 text-[13px] font-semibold px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors duration-150"
                      >
                        <Archive size={14} /> Archive
                      </button>
                      <div className="my-1 border-t border-white/[0.06]" />
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2.5 text-[13px] font-semibold px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors duration-150"
                      >
                        <Trash2 size={14} /> Delete Course
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-7" />

          <div className="flex-1 flex flex-col justify-between">
            {/* Action Toolbar */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 px-0.5">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <ToolbarButton icon={Layers} title="Add Module" description="Create a new section" href={`/instructor/modules/create/${course.id}`} />
                <ToolbarButton icon={BookOpen} title="Add Lesson" description="Add lesson to module" onClick={handleAddLessonClick} />
                <ToolbarButton icon={Eye} title="View Course" description="Open course page" href={`/instructor/courses/${course.id}`} />
                <ToolbarButton icon={BarChart3} title="Stats" description="View course insights" onClick={(e) => { e.preventDefault(); setIsFlipped(true); }} />
              </div>
            </div>

            {/* Live Summary Strip */}
            <div className="mt-8 mb-1">
              <div className="grid grid-cols-5 rounded-2xl border border-white/[0.06] bg-white/[0.015] divide-x divide-white/[0.06] overflow-hidden">
                <SummaryStat icon={Layers} label="Modules" value={count.modules ?? 0} />
                <SummaryStat icon={BookOpen} label="Lessons" value={stats.lessonsCount ?? 0} />
                <SummaryStat icon={Video} label="Videos" value={stats.videosCount ?? 0} />
                <SummaryStat icon={ClipboardCheck} label="Quizzes" value={count.quizzes ?? 0} />
                <SummaryStat icon={Users} label="Students" value={count.enrollments ?? 0} />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-7 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center gap-1 -ml-3">
                <button
                  onClick={handleDuplicate}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-white hover:bg-white/[0.05] px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <Copy size={13.5} /> Duplicate
                </button>
                <Link
                  href={`/instructor/courses/${course.id}/analytics`}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-white hover:bg-white/[0.05] px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <Activity size={13.5} /> Analytics
                </Link>
                <Link
                  href={`/instructor/courses/edit/${course.id}`}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-white hover:bg-white/[0.05] px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <Settings size={13.5} /> Settings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            BACK SIDE: COURSE INSIGHTS
        ========================================== */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#12141c] to-[#0a0b11] border border-white/[0.07] rounded-[28px] p-7 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_24px_60px_-24px_rgba(0,0,0,0.7)] hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-[15px] font-bold text-white tracking-tight flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                <BarChart3 size={15} />
              </div>
              Course Insights
            </h3>
            <button
              onClick={() => setIsFlipped(false)}
              className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-[12px] font-bold text-slate-300 hover:text-white transition-all duration-200 flex items-center gap-1.5"
            >
              <RotateCcw size={13} /> Back
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-6 pb-2">
            {/* Course Health */}
            <section>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">
                Course Health
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {stats.contentHealth === "Needs Work" ? (
                      <AlertCircle size={11} className="text-amber-400" />
                    ) : (
                      <CheckCircle2 size={11} className="text-emerald-400" />
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      Content
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-white">
                    {stats.contentHealth || "Needs Work"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {stats.engagementHealth === "Needs Work" ? (
                      <AlertCircle size={11} className="text-amber-400" />
                    ) : (
                      <CheckCircle2 size={11} className="text-emerald-400" />
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      Engagement
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-white">
                    {stats.engagementHealth || "Needs Work"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-white">
                    {course.status === "PUBLISHED" ? "Live" : "Draft"}
                  </span>
                </div>
              </div>
            </section>

            {/* Analytics Progress Bars */}
            <section>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">
                Performance
              </h4>
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Completion Rate</span>
                    <span className="text-white font-bold">
                      {stats.completionRate ?? 0}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${stats.completionRate ?? 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Active Students</span>
                    <span className="text-white font-bold">
                      {stats.activeStudents ?? 0}{" "}
                      <span className="text-slate-500 font-medium">
                        / {count.enrollments ?? 0}
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all duration-500"
                      style={{
                        width: count.enrollments
                          ? `${((stats.activeStudents ?? 0) / count.enrollments) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-xs font-semibold text-slate-400">
                    Average Rating
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                    {stats.avgRating ?? "0.0"}
                    <Star size={13} className="fill-amber-400" />
                  </div>
                </div>
              </div>
            </section>

            {/* Pending Work */}
            <section>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">
                Pending Work
              </h4>
              <div className="space-y-2">
                <Link
                  href={`/instructor/courses/${course.id}/assignments`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Assignment Reviews
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-bold text-slate-300">
                    {stats.pendingSubmissionsCount ?? 0}
                  </span>
                </Link>
                <Link
                  href={`/instructor/courses/${course.id}/discussions`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Unanswered Questions
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-bold text-slate-300">
                    {stats.pendingDoubtsCount ?? 0}
                  </span>
                </Link>
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">
                Recent Activity
              </h4>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] relative">
                <div className="absolute left-[27px] top-7 bottom-7 w-px bg-white/[0.08]" />
                <ul className="space-y-4">
                  {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, i) => (
                      <li key={i} className="flex gap-3 relative z-10">
                        <div
                          className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center mt-0.5 ${
                            activity.type === "ENROLLMENT"
                              ? "bg-blue-500/20 border-blue-500/30"
                              : activity.type === "MODULE"
                                ? "bg-purple-500/20 border-purple-500/30"
                                : "bg-emerald-500/20 border-emerald-500/30"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              activity.type === "ENROLLMENT"
                                ? "bg-blue-400"
                                : activity.type === "MODULE"
                                  ? "bg-purple-400"
                                  : "bg-emerald-400"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {activity.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {activity.subtitle} on{" "}
                            {format(new Date(activity.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-500 italic pl-8">
                      No recent activity found.
                    </li>
                  )}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {activeOverlay === "MODULE_SELECT" && (
        <SelectModuleOverlay
          courseId={course.id}
          onClose={() => setActiveOverlay(null)}
          onSelect={handleModuleSelect}
        />
      )}
    </div>
  );
}
