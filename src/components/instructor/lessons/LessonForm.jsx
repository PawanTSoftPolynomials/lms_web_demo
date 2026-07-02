"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const INITIAL_FORM = {
    title: "",
    description: "",
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
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } =
            e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
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