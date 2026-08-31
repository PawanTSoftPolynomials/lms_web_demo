"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import Input from "@/components/ui/Input";
import { useUpdateCourse } from "@/hooks/queries/instructor/useUpdateCourse";
import { useToast } from "@/components/ui/ToastProvider";

export default function CourseMetaPanel({ course, courseId }) {
  const [form, setForm] = useState({
    title: course.title || "",
    description: course.description || "",
    category: course.category || "",
    level: course.level || "",
    language: course.language || "English",
    thumbnailUrl: course.thumbnailUrl || "",
    estimatedLearningHours: course.estimatedLearningHours ?? "",
    tags: (course.tags || []).join(", "),
  });

  const updateCourse = useUpdateCourse();
  const toast = useToast();

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    try {
      await updateCourse.mutateAsync({
        courseId,
        courseData: {
          title: form.title,
          description: form.description,
          category: form.category,
          level: form.level,
          language: form.language,
          thumbnailUrl: form.thumbnailUrl,
          estimatedLearningHours: form.estimatedLearningHours === "" ? null : Number(form.estimatedLearningHours),
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      });
      toast?.showToast("Course settings saved", "success");
    } catch (error) {
      toast?.showToast(error?.response?.data?.message || "Failed to save course settings", "error");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-background/50 backdrop-blur-md p-6 space-y-4 max-w-2xl">
      <h2 className="text-xl font-black text-foreground">Course Settings</h2>

      <Input label="Title" value={form.title} onChange={set("title")} />

      <div className="space-y-2">
        <label className="text-sm text-foreground">Description</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={4}
          className="w-full rounded-lg border border-transparent bg-muted px-4 py-3 text-sm outline-none focus:border-primary resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Category" value={form.category} onChange={set("category")} />
        <Input label="Level" value={form.level} onChange={set("level")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Language" value={form.language} onChange={set("language")} />
        <Input
          label="Estimated Hours"
          type="number"
          min={0}
          value={form.estimatedLearningHours}
          onChange={set("estimatedLearningHours")}
        />
      </div>

      <Input label="Thumbnail URL" value={form.thumbnailUrl} onChange={set("thumbnailUrl")} />
      <Input label="Tags (comma separated)" value={form.tags} onChange={set("tags")} />

      <div className="flex justify-end pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateCourse.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-foreground bg-primary hover:bg-orange-600 rounded-xl shadow-sm transition disabled:opacity-50"
        >
          <Save size={14} /> {updateCourse.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
