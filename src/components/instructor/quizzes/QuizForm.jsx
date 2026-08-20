"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";

const INITIAL_FORM = {
    courseId: "",
    moduleId: "",
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 50,
    startDate: "",
    dueDate: "",
    shuffleQuestions: false,
};

function formatDateForInput(isoStr) {
    if (!isoStr) return "";
    try {
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return "";
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return "";
    }
}

export default function QuizForm({
    mode = "create",
    initialValues = null,
    loading = false,
    onSubmit,
    lockedCourseId = null,
}) {
    const [formData, setFormData] = useState({ ...INITIAL_FORM, courseId: lockedCourseId || "" });
    const [submitAction, setSubmitAction] = useState("draft");

    // Course → Module: when a course is locked (e.g. "create quiz for this
    // course" entry point), the course select is replaced with a read-only
    // display. Otherwise every course the instructor owns is offered.
    const { data: instructorCourses = [] } = useInstructorCourses();
    const availableCourses = lockedCourseId ? null : instructorCourses;

    const { data: modules = [] } = useModules(formData.courseId);

    useEffect(() => {
        if (initialValues) {
            setFormData({
                ...INITIAL_FORM,
                ...initialValues,
                startDate: formatDateForInput(initialValues.startDate || initialValues.availableFrom),
                dueDate: formatDateForInput(initialValues.dueDate || initialValues.availableUntil),
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "timeLimit" || name === "passingScore" ? Number(value) : value,
            ...(name === "courseId" ? { moduleId: "" } : {}),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            moduleId: formData.moduleId || null,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        };

        onSubmit?.(payload, submitAction);
    };

    return (
        <Card className="mx-auto max-w-4xl bg-[#0D1021] border border-[#1A1F35] p-6 sm:p-8 rounded-2xl shadow-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">
                    {mode === "create" ? "Create Quiz" : "Edit Quiz"}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                    {mode === "create" ? "Create a new quiz for your course and schedule when students can attempt it." : "Update quiz details and schedule parameters."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {mode === "create" && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-300">Course</label>

                            {lockedCourseId ? (
                                <div className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-400">
                                    {instructorCourses.find((c) => c.id === lockedCourseId)?.title || "This course"}
                                </div>
                            ) : (
                                <select
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-orange-500"
                                >
                                    <option value="" disabled>Select a course...</option>
                                    {availableCourses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-slate-300">Module (Optional)</label>

                            <select
                                name="moduleId"
                                value={formData.moduleId}
                                onChange={handleChange}
                                disabled={!formData.courseId}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {formData.courseId ? "Whole course (no specific module)" : "Select a course first..."}
                                </option>
                                {modules.map((m) => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <Input
                    label="Quiz Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Java Advanced Streams & Concurrency Quiz"
                    required
                />

                <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                        Description
                    </label>

                    <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Brief description and guidelines for the quiz..."
                        className="w-full rounded-xl border border-[#1A1F35] bg-[#05070E] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
                    />
                </div>

                {/* Duration & Score */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Input
                        label="Time Limit (Minutes)"
                        name="timeLimit"
                        type="number"
                        min="1"
                        value={formData.timeLimit}
                        onChange={handleChange}
                    />

                    <Input
                        label="Passing Score (%)"
                        name="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.passingScore}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex items-center gap-3 bg-[#05070E] p-3.5 rounded-xl border border-[#1A1F35]">
                    <input
                        type="checkbox"
                        id="shuffleQuestions"
                        checked={formData.shuffleQuestions}
                        onChange={(e) => setFormData((prev) => ({ ...prev, shuffleQuestions: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <label htmlFor="shuffleQuestions" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                        Randomize question order for each student attempt
                    </label>
                </div>

                {/* Scheduling Parameters */}
                <div className="p-5 rounded-2xl bg-[#05070E] border border-[#1A1F35] space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-orange-400 font-mono">
                            Quiz Schedule & Availability
                        </h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Input
                            label="Start Date & Time (Schedule Quiz)"
                            name="startDate"
                            type="datetime-local"
                            value={formData.startDate}
                            onChange={handleChange}
                        />

                        <Input
                            label="Due Date & Time (Deadline)"
                            name="dueDate"
                            type="datetime-local"
                            value={formData.dueDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                    {mode === "create" ? (
                        <>
                            <button
                                type="submit"
                                onClick={() => setSubmitAction("draft")}
                                disabled={loading}
                                className="rounded-xl border border-slate-800 bg-[#05070E] text-slate-300 hover:bg-slate-800 text-xs font-extrabold px-5 py-3.5 transition cursor-pointer"
                            >
                                {loading && submitAction === "draft" ? "Saving..." : "Save as Draft"}
                            </button>
                            <button
                                type="submit"
                                onClick={() => setSubmitAction("publish")}
                                disabled={loading}
                                className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-extrabold px-6 py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95 cursor-pointer"
                            >
                                {loading && submitAction === "publish" ? "Creating..." : "Create Quiz"}
                            </button>
                        </>
                    ) : (
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-orange-500 hover:bg-orange-600 font-extrabold"
                        >
                            {loading ? "Updating..." : "Update Quiz"}
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
}