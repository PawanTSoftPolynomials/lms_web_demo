"use client";

import {useEffect, useState} from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const INITIAL_FORM = {
    title: "",
    type: "VIDEO",
    videoUrl: "",
    fileUrl: "",
    externalUrl: "",
    htmlContent: "",
};

export default function ContentForm({
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
                ...INITIAL_FORM,
                ...initialValues,
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
        <Card className="mx-auto max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    {mode === "create"
                        ? "Create Content"
                        : "Edit Content"}
                </h1>

                <p className="mt-2 text-slate-400">
                    Add learning material to this
                    lesson.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <Input
                    label="Content Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Java Collections Video"
                    required
                />

                <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                        Content Type
                    </label>

                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="
              w-full
              rounded-lg
              border
              border-slate-700
              bg-slate-900
              px-4
              py-3
              text-white
              focus:border-orange-500
              outline-none
            "
                    >
                        <option value="VIDEO">
                            Video
                        </option>

                        <option value="FILE">
                            PDF / File
                        </option>

                        <option value="LINK">
                            External Link
                        </option>

                        <option value="HTML">
                            HTML Content
                        </option>
                    </select>
                </div>

                {formData.type === "VIDEO" && (
                    <Input
                        label="Video URL"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        required
                    />
                )}

                {formData.type === "FILE" && (
                    <Input
                        label="File URL"
                        name="fileUrl"
                        value={formData.fileUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        required
                    />
                )}

                {formData.type === "LINK" && (
                    <Input
                        label="External URL"
                        name="externalUrl"
                        value={formData.externalUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        required
                    />
                )}

                {formData.type === "HTML" && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-white">
                            HTML Content
                        </label>

                        <textarea
                            name="htmlContent"
                            rows={10}
                            value={formData.htmlContent}
                            onChange={handleChange}
                            className="
                w-full
                rounded-lg
                border
                border-slate-700
                bg-slate-900
                px-4
                py-3
                text-white
                outline-none
                focus:border-orange-500
              "
                        />
                    </div>
                )}

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
                                ? "Create Content"
                                : "Update Content"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}