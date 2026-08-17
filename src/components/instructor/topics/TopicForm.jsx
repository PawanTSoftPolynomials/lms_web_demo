"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import RichTextEditor from "@/components/ui/RichTextEditor";

const INITIAL_FORM = {
    title: "",
    description: "",
    isPublished: false,
};

export default function TopicForm({
                                       mode = "create",
                                       initialValues = null,
                                       loading = false,
                                       contentsCount = 0,
                                       onSubmit,
                                   }) {
    const [formData, setFormData] =
        useState(INITIAL_FORM);

    const canPublish = contentsCount > 0;

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
                        ? "Create Topic"
                        : "Edit Topic"}
                </h1>

                <p className="mt-2 text-slate-400">
                    {mode === "create"
                        ? "Add a new topic to this lesson."
                        : "Update topic details."}
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <Input
                    label="Topic Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Variables and Data Types"
                    required
                />

                <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                        Description
                    </label>

                    <RichTextEditor
                        value={formData.description}
                        onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                        placeholder="Enter topic description..."
                    />
                </div>

                <div className="flex flex-col gap-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isPublished"
                            name="isPublished"
                            checked={formData.isPublished}
                            onChange={handleChange}
                            disabled={!canPublish}
                            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <label
                            htmlFor="isPublished"
                            className={`text-sm font-semibold cursor-pointer ${canPublish ? "text-slate-200" : "text-slate-500 cursor-not-allowed"}`}
                        >
                            Publish Topic (Make this topic visible to students instantly)
                        </label>
                    </div>
                    {!canPublish && (
                        <p className="text-xs text-amber-400/90 pl-7">
                            Add at least one content item before you can publish this topic.
                        </p>
                    )}
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
                                ? "Create Topic"
                                : "Update Topic"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
