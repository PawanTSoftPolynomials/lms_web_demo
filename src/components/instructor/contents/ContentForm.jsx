"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import Cookies from "js-cookie";

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

// Types that require a file upload from device
const FILE_UPLOAD_TYPES = ["DOCUMENT", "PRESENTATION"];

// Allowed file extensions per type
const ACCEPTED_FILES = {
    DOCUMENT: ".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv",
    PRESENTATION: ".ppt,.pptx,.odp",
};

export default function ContentForm({
    mode = "create",
    initialValues = null,
    loading = false,
    onSubmit,
}) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [uploadState, setUploadState] = useState({
        uploading: false,
        error: null,
        fileName: null,
        fileSize: null,
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialValues) {
            setFormData({ ...INITIAL_FORM, ...initialValues });
            // If editing and there is an existing fileUrl, show the filename
            if (initialValues.fileUrl) {
                const parts = initialValues.fileUrl.split("/");
                setUploadState((prev) => ({
                    ...prev,
                    fileName: decodeURIComponent(parts[parts.length - 1]),
                }));
            }
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Reset file state when type changes
        if (name === "type") {
            setFormData((prev) => ({
                ...prev,
                type: value,
                fileUrl: "",
            }));
            setUploadState({ uploading: false, error: null, fileName: null, fileSize: null });
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadState({ uploading: true, error: null, fileName: file.name, fileSize: file.size });

        try {
            const token = Cookies.get("accessToken");
            const fd = new FormData();
            fd.append("file", file);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/contents/upload-file`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: fd,
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Upload failed");
            }

            setFormData((prev) => ({ ...prev, fileUrl: data.fileUrl }));
            setUploadState({
                uploading: false,
                error: null,
                fileName: data.originalName,
                fileSize: data.size,
            });
        } catch (err) {
            setUploadState({
                uploading: false,
                error: err.message || "Upload failed. Please try again.",
                fileName: null,
                fileSize: null,
            });
            setFormData((prev) => ({ ...prev, fileUrl: "" }));
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveFile = () => {
        setFormData((prev) => ({ ...prev, fileUrl: "" }));
        setUploadState({ uploading: false, error: null, fileName: null, fileSize: null });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate file uploaded for file-based types
        if (FILE_UPLOAD_TYPES.includes(formData.type) && !formData.fileUrl) {
            setUploadState((prev) => ({
                ...prev,
                error: "Please choose a file from your device before submitting.",
            }));
            return;
        }

        onSubmit?.(formData);
    };

    const formatBytes = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isFileType = FILE_UPLOAD_TYPES.includes(formData.type);

    return (
        <Card className="mx-auto max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    {mode === "create" ? "Create Content" : "Edit Content"}
                </h1>
                <p className="mt-2 text-slate-400">
                    Add learning material to this lesson.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <Input
                    label="Content Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Java Collections Video"
                    required
                />

                {/* Type Selector */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                        Content Type
                    </label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-orange-500 outline-none"
                    >
                        <option value="VIDEO">Video</option>
                        <option value="DOCUMENT">Document / PDF / File</option>
                        <option value="PRESENTATION">Presentation (PPT)</option>
                        <option value="LINK">External Link</option>
                        <option value="TEXT">Text / HTML Content</option>
                    </select>
                </div>

                {/* Video URL */}
                {formData.type === "VIDEO" && (
                    <Input
                        label="Video URL"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                        placeholder="https://youtube.com/watch?v=..."
                        required
                    />
                )}

                {/* File Picker (DOCUMENT / PRESENTATION) */}
                {isFileType && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-white">
                            {formData.type === "PRESENTATION"
                                ? "Presentation File (.ppt, .pptx)"
                                : "Document File (.pdf, .docx, .xls, .txt, …)"}
                        </label>

                        {/* Dropzone / File Picker */}
                        {!formData.fileUrl && !uploadState.uploading && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 px-6 py-10 text-center cursor-pointer hover:border-orange-500/60 hover:bg-slate-900 transition-all duration-200"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
                                    <Upload size={22} className="text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Click to choose a file from your device
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Accepted:{" "}
                                        {formData.type === "PRESENTATION"
                                            ? ".ppt, .pptx, .odp"
                                            : ".pdf, .doc, .docx, .xls, .xlsx, .txt, .csv"}
                                        {" "}· Max 50 MB
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_FILES[formData.type]}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Uploading State */}
                        {uploadState.uploading && (
                            <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-3.5">
                                <Loader2 size={18} className="text-orange-400 animate-spin shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {uploadState.fileName}
                                    </p>
                                    <p className="text-xs text-slate-400">Uploading…</p>
                                </div>
                            </div>
                        )}

                        {/* Uploaded Successfully */}
                        {formData.fileUrl && !uploadState.uploading && (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3.5">
                                <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {uploadState.fileName || "File uploaded"}
                                    </p>
                                    {uploadState.fileSize && (
                                        <p className="text-xs text-slate-400">
                                            {formatBytes(uploadState.fileSize)} · Uploaded successfully
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                                    title="Remove file"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Upload Error */}
                        {uploadState.error && (
                            <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                                <X size={13} className="shrink-0" />
                                {uploadState.error}
                            </p>
                        )}
                    </div>
                )}

                {/* External Link */}
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

                {/* Text / HTML Content */}
                {formData.type === "TEXT" && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-white">
                            Text / HTML Content
                        </label>
                        <textarea
                            name="htmlContent"
                            rows={10}
                            value={formData.htmlContent}
                            onChange={handleChange}
                            placeholder="Enter text or HTML content here..."
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                        />
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading || uploadState.uploading}>
                        {loading
                            ? mode === "create"
                                ? "Creating…"
                                : "Updating…"
                            : mode === "create"
                                ? "Create Content"
                                : "Update Content"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}