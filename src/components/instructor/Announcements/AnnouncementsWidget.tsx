"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, X } from "lucide-react";

import api from "@/lib/axios";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { useToast } from "@/components/ui/ToastProvider";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import type { Announcement, InstructorCourseSummary } from "@/types/instructor-dashboard";

interface AnnouncementsWidgetProps {
  announcements?: Announcement[];
  courses?: InstructorCourseSummary[];
  isLoading?: boolean;
}

export function AnnouncementsWidget({ announcements, courses, isLoading }: AnnouncementsWidgetProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();
  const { showToast } = useToast() ?? { showToast: () => {} };

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/courses/${courseId}/announcements`, { title, message: body });
      return data;
    },
    onSuccess: () => {
      showToast("Announcement posted", "success");
      setIsCreating(false);
      setTitle("");
      setBody("");
      setCourseId("");
      queryClient.invalidateQueries({ queryKey: ["instructor-home", "announcements"] });
    },
    onError: () => {
      showToast("Couldn't post the announcement. Please try again.", "error");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcements</CardTitle>
        <CardAction>
          <Button
            size="sm"
            variant={isCreating ? "secondary" : "default"}
            className="text-[11px] gap-1"
            onClick={() => setIsCreating((v) => !v)}
          >
            {isCreating ? (
              <>
                <X className="size-3.5" /> Cancel
              </>
            ) : (
              <>
                <Plus className="size-3.5" /> New
              </>
            )}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {isCreating && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!courseId || !title.trim()) return;
              mutation.mutate();
            }}
            className="rounded-xl border border-card-border bg-surface-muted/40 p-3.5 space-y-2.5"
          >
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
            >
              <option value="" disabled>
                Select a course
              </option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement..."
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
            />
            <Button type="submit" size="sm" className="w-full text-[11px]" disabled={mutation.isPending}>
              {mutation.isPending ? "Posting..." : "Post Announcement"}
            </Button>
          </form>
        )}

        {isLoading ? (
          Array.from({ length: 2 }).map((_, idx) => <Skeleton key={idx} className="h-16 rounded-xl" />)
        ) : !announcements || announcements.length === 0 ? (
          <EmptyWidgetState icon={Megaphone} message="No announcements posted yet." />
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="rounded-xl border border-card-border p-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-foreground">{a.title}</p>
                <span className="text-[10px] font-semibold text-muted-foreground shrink-0">{a.postedAt}</span>
              </div>
              {a.body && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{a.body}</p>}
              {a.courseName && (
                <span className="inline-block mt-1.5 text-[10.5px] font-bold text-primary">{a.courseName}</span>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
