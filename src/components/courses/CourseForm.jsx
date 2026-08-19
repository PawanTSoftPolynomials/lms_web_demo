"use client";

import {useEffect, useState} from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getDisplayUrl } from "@/lib/blob";

const INITIAL_FORM = {
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    thumbnailUrl: "",
    visibility: "PUBLIC",
    language: "English",
    tags: "",
    certificatesEnabled: false,
    discussionEnabled: true,
    dripContentEnabled: false,
    estimatedLearningHours: 0,
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
                                       submitError = "",
                                   }) {
    const [formData, setFormData] =
        useState(INITIAL_FORM);

    const [validationErrors, setValidationErrors] =
        useState({});

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
                visibility: initialValues.visibility ?? "PUBLIC",
                language: initialValues.language ?? "English",
                tags: Array.isArray(initialValues.tags) ? initialValues.tags.join(", ") : (initialValues.tags ?? ""),
                certificatesEnabled: initialValues.certificatesEnabled ?? false,
                discussionEnabled: initialValues.discussionEnabled ?? true,
                dripContentEnabled: initialValues.dripContentEnabled ?? false,
                estimatedLearningHours: initialValues.estimatedLearningHours ?? 0,
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const {name, value, type, checked} =
            e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const errors = {};
        if (formData.title.trim().length < 3) {
            errors.title = "Title must be at least 3 characters long.";
        }
        if (formData.description.trim().length < 20) {
            errors.description = "Description must be at least 20 characters long.";
        }
        if (!formData.category.trim()) {
            errors.category = "Category is required.";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({});
        
        const payload = {
            ...formData,
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            estimatedLearningHours: formData.estimatedLearningHours ? Number(formData.estimatedLearningHours) : 0,
        };
        
        onSubmit?.(payload);
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
                noValidate
            >
                {submitError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                        {submitError}
                    </div>
                )}

                <Input
                    label="Course Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Java SE"
                    error={validationErrors.title}
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
                    {validationErrors.description && (
                        <p className="mt-2 text-sm text-red-500">
                            {validationErrors.description}
                        </p>
                    )}
                </div>

                <Input
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Programming"
                    error={validationErrors.category}
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
                    label="Thumbnail URL (optional)"
                    name="thumbnailUrl"
                    value={
                        formData.thumbnailUrl
                    }
                    onChange={handleChange}
                    placeholder="https://..."
                />

                {formData.thumbnailUrl && (
                    <div className="mt-3">
                        <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Thumbnail Preview
                        </label>

                        <div className="aspect-video h-48 w-auto max-w-md bg-slate-950 rounded-xl overflow-hidden border border-slate-700/60 shadow-luxury-md">
                            <img
                                src={getDisplayUrl(formData.thumbnailUrl)}
                                alt="Thumbnail Preview"
                                className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Visibility</label>
                        <select
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleChange}
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
                        >
                            <option value="PUBLIC">Public</option>
                            <option value="PRIVATE">Private</option>
                            <option value="UNLISTED">Unlisted</option>
                        </select>
                    </div>

                    <Input
                        label="Language"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        placeholder="e.g. English, Spanish"
                    />

                    <Input
                        label="Tags (comma separated)"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g. React, Web, Frontend"
                    />

                    <Input
                        label="Estimated Learning Hours"
                        name="estimatedLearningHours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.estimatedLearningHours}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/30 p-5 mt-4">
                    <h3 className="text-sm font-bold text-slate-300">Course Features</h3>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="certificatesEnabled"
                            checked={formData.certificatesEnabled}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500/20"
                        />
                        <span className="text-sm text-slate-300">Enable Certificates</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="discussionEnabled"
                            checked={formData.discussionEnabled}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500/20"
                        />
                        <span className="text-sm text-slate-300">Enable Course Discussions</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="dripContentEnabled"
                            checked={formData.dripContentEnabled}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500/20"
                        />
                        <span className="text-sm text-slate-300">Enable Drip Content (Scheduled delivery)</span>
                    </label>
                </div>

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