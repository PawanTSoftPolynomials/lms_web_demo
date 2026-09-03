"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity as ActivityIcon, Star, Award, FileText, CheckCircle, XCircle } from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";

import useQuizzes from "@/hooks/queries/student/useQuizzes";
import useCertificates from "@/hooks/queries/student/useCertificates";
import { useMyAchievements } from "@/hooks/queries/student/useAchievements";
import { useNotes } from "@/hooks/queries/student/useNotes";
import { ACTIVITY_FILTERS } from "@/features/student/constants/activityConfig";
import { timeAgo } from "@/lib/dateUtils";

const TYPE_META = {
  quiz: { label: "Quizzes", icon: Star, color: "text-purple-400 bg-purple-500/10" },
  certificate: { label: "Certificates", icon: Award, color: "text-amber-400 bg-amber-500/10" },
  achievement: { label: "Achievements", icon: ActivityIcon, color: "text-primary bg-primary/10" },
  note: { label: "Notes", icon: FileText, color: "text-teal-400 bg-teal-500/10" },
};

export default function StudentActivityPage() {
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuizzes();
  const { data: certificates = [], isLoading: certificatesLoading } = useCertificates();
  const { data: achievementsData, isLoading: achievementsLoading } = useMyAchievements();
  const { data: notes = [], isLoading: notesLoading } = useNotes();

  const [filter, setFilter] = useState("All");

  const isLoading = quizzesLoading || certificatesLoading || achievementsLoading || notesLoading;

  const events = useMemo(() => {
    const isValidDate = (ts) => ts && Number.isFinite(new Date(ts).getTime());
    const list = [];

    for (const quiz of quizzes) {
      const submission = quiz.quizSubmissions?.[0];
      if (submission && isValidDate(submission.submittedAt)) {
        list.push({
          id: `quiz-${quiz.id}`,
          type: "quiz",
          timestamp: new Date(submission.submittedAt).getTime(),
          title: `Attempted "${quiz.title}"`,
          meta: `${submission.passed ? "Passed" : "Failed"} · ${submission.percentage}%`,
          statusIcon: submission.passed ? CheckCircle : XCircle,
          statusColor: submission.passed ? "text-emerald-500" : "text-rose-500",
          href: `/student/result/${quiz.id}`,
        });
      }
    }

    for (const cert of certificates) {
      if (isValidDate(cert.issuedAt)) {
        list.push({
          id: `cert-${cert.id}`,
          type: "certificate",
          timestamp: new Date(cert.issuedAt).getTime(),
          title: `Earned certificate for "${cert.course?.title || "your course"}"`,
          meta: cert.certificateNo || null,
          href: "/student/certificates",
        });
      }
    }

    const achievements = achievementsData?.achievements || [];
    for (const a of achievements) {
      if (a.earned && isValidDate(a.earnedAt)) {
        list.push({
          id: `ach-${a.id}`,
          type: "achievement",
          timestamp: new Date(a.earnedAt).getTime(),
          title: `Unlocked "${a.name}"`,
          meta: `+${a.xpReward ?? 0} XP`,
          href: "/student/achievements",
        });
      }
    }

    for (const note of notes) {
      if (isValidDate(note.updatedAt)) {
        list.push({
          id: `note-${note.id}`,
          type: "note",
          timestamp: new Date(note.updatedAt).getTime(),
          title: `Saved note "${note.title}"`,
          meta: note.category || null,
          href: "/student/notes",
        });
      }
    }

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [quizzes, certificates, achievementsData, notes]);

  const filteredEvents = useMemo(() => {
    if (filter === "All") return events;
    return events.filter((e) => TYPE_META[e.type].label === filter);
  }, [events, filter]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader title="Activity" subtitle="A timeline of what you've actually done — quizzes, certificates, achievements, and notes." />

      <div className="flex flex-wrap gap-2">
        {ACTIVITY_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
              filter === f
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-transparent/80 bg-background/50 text-muted-foreground hover:border-transparent hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <Card tone="flat" className="p-6 py-20 text-center text-muted-foreground">
          <ActivityIcon size={40} className="mx-auto mb-3 text-slate-600 opacity-40" />
          <p className="text-sm font-semibold text-foreground">No activity yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Attempt a quiz, earn a certificate, unlock an achievement, or save a note — it'll show up here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const meta = TYPE_META[event.type];
            const Icon = meta.icon;
            const StatusIcon = event.statusIcon;
            return (
              <Link key={event.id} href={event.href}>
                <Card className="flex items-start gap-4 p-4 transition hover:border-primary/30">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(event.timestamp)}</span>
                    </div>
                    {event.meta && (
                      <p
                        className={`mt-1 flex items-center gap-1.5 text-xs ${
                          StatusIcon ? event.statusColor : "text-muted-foreground"
                        }`}
                      >
                        {StatusIcon && <StatusIcon size={13} />}
                        {event.meta}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
