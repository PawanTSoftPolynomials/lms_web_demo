"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const INITIAL_FORM = {
    title: "",
    description: "",
    isPublished: false,
};

export default function LessonForm({
                                       mode = "create",
                                       initialValues = null,
                                       loading = false,
                                       onSubmit,
                                   }) {
    const [formData, setFormData] =
        useState(INITIAL_FORM);

    useEffect(() => {
        if (initialValues) {
            setFormData({
                title:
                    initialValues.title ?? "",
                description:
                    initialValues.description ??
                    "",
                isPublished:
                    initialValues.isPublished ??
                    false,
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value, type, checked } =
            e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit?.(formData);
    };

    return (
        <Card className="mx-auto max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    {mode === "create"
                        ? "Create Lesson"
                        : "Edit Lesson"}
                </h1>

                <p className="mt-2 text-slate-400">
                    {mode === "create"
                        ? "Add a new lesson to this module."
                        : "Update lesson details."}
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <Input
                    label="Lesson Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Introduction to Java"
                    required
                />

                <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={6}
                        required
                        placeholder="Enter lesson description..."
                        className="
              w-full
              resize-none
              rounded-lg
              border
              border-slate-700
              bg-slate-900
              px-4
              py-3
              text-white
              outline-none
              transition
              focus:border-orange-500
            "
                    />
                </div>

                <div className="flex items-center gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                    <input
                        type="checkbox"
                        id="isPublished"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <label htmlFor="isPublished" className="text-sm font-semibold text-slate-200 cursor-pointer">
                        Publish Lesson (Make this lesson visible to students instantly)
                    </label>
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? mode === "create"
                                ? "Creating..."
                                : "Updating..."
                            : mode === "create"
                                ? "Create Lesson"
                                : "Update Lesson"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}