"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const INITIAL_FORM = {
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 50,
    startDate: "",
    dueDate: "",
};

function formatDateForInput(isoStr) {
    if (!isoStr) return "";
    try {
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return "";
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
        return "";
    }
}

export default function QuizForm({
    mode = "create",
    initialValues = null,
    loading = false,
    onSubmit,
}) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitAction, setSubmitAction] = useState("draft");

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
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
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
                                onClick={() => setSubmitAction("questions")}
                                disabled={loading}
                                className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-extrabold px-6 py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95 cursor-pointer"
                            >
                                {loading && submitAction === "questions" ? "Creating..." : "Add Questions"}
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