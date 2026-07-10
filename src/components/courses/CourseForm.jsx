"use client";

import {useEffect, useState} from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const INITIAL_FORM = {
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    thumbnailUrl: "",
};

const LEVELS = [
    "Beginner",
    "Intermediate",
    "Advanced",
];

export default function CourseForm({
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
                category:
                    initialValues.category ??
                    "",
                level:
                    initialValues.level ??
                    "Beginner",
                thumbnailUrl:
                    initialValues.thumbnailUrl ??
                    "",
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const {name, value} =
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
        <Card className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    {mode === "create"
                        ? "Create Course"
                        : "Edit Course"}
                </h1>

                <p className="text-slate-400 mt-2">
                    {mode === "create"
                        ? "Create a new course for your student."
                        : "Update your course information."}
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <Input
                    label="Course Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Java SE"
                    required
                />

                <div>
                    <label className="block mb-2 text-sm font-medium">
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={6}
                        required
                        className="
              w-full
              rounded-lg
              bg-slate-900
              border
              border-slate-700
              px-4
              py-3
              outline-none
              focus:border-orange-500
              resize-none
            "
                        placeholder="Enter course description..."
                    />
                </div>

                <Input
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Programming"
                    required
                />

                <div>
                    <label className="block mb-2 text-sm font-medium">
                        Level
                    </label>

                    <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className="
              w-full
              rounded-lg
              bg-slate-900
              border
              border-slate-700
              px-4
              py-3
              outline-none
              focus:border-orange-500
            "
                    >
                        {LEVELS.map((level) => (
                            <option
                                key={level}
                                value={level}
                            >
                                {level}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Thumbnail URL"
                    name="thumbnailUrl"
                    value={
                        formData.thumbnailUrl
                    }
                    onChange={handleChange}
                    placeholder="https://..."
                    required
                />

                {formData.thumbnailUrl && (
                    <div className="mt-3">
                        <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Thumbnail Preview
                        </label>

                        <div className="aspect-video h-48 w-auto max-w-md bg-slate-950 rounded-xl overflow-hidden border border-slate-700/60 shadow-luxury-md">
                            <img
                                src={formData.thumbnailUrl}
                                alt="Thumbnail Preview"
                                className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? mode === "create"
                                ? "Creating..."
                                : "Updating..."
                            : mode === "create"
                                ? "Create Course"
                                : "Update Course"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}