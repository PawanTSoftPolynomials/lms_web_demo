"use client";

import { useState, useRef, useCallback } from "react";
import { FaCloudUploadAlt, FaTimes, FaCheckCircle, FaExclamationCircle, FaFileAlt, FaDownload } from "react-icons/fa";
import { useImportQuestions } from "@/hooks/queries/instructor/useImportQuestions";

const ACCEPTED_FORMATS = ".csv,.xlsx,.xls,.json,.txt,.docx,.pdf";
const FORMAT_LABELS = ["CSV", "Excel (.xlsx/.xls)", "JSON", "TXT", "DOCX", "PDF"];

const CSV_TEMPLATE = `question,optionA,optionB,optionC,optionD,correctAnswer,marks,difficulty,explanation
"What is JSX in React?","A templating engine","JavaScript XML syntax extension","Java Syntax Extension","A CSS framework","JavaScript XML syntax extension",1,EASY,"JSX allows writing HTML-like code in JavaScript"
"Which hook manages state in React?","useEffect","useMemo","useState","useCallback","useState",2,MEDIUM,"useState hook is used to manage component local state"`;

const JSON_TEMPLATE = JSON.stringify([
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: "Paris",
        marks: 1,
        difficulty: "EASY",
        explanation: "Paris is the capital and largest city of France.",
    },
    {
        question: "Which language runs in a web browser?",
        options: ["Java", "C#", "Python", "JavaScript"],
        correctAnswer: "JavaScript",
        marks: 1,
        difficulty: "EASY",
    },
], null, 2);

function downloadTemplate(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function ImportQuestionsModal({ quizId, onClose, onSuccess }) {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const importMutation = useImportQuestions();

    const handleFile = (file) => {
        if (!file) return;
        setSelectedFile(file);
        setResult(null);
        setError(null);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setDragOver(false), []);

    const handleImport = async () => {
        if (!selectedFile) return;
        setError(null);
        setResult(null);
        try {
            const data = await importMutation.mutateAsync({ quizId, file: selectedFile });
            setResult(data?.data || data);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Import failed.");
        }
    };

    const handleClose = () => {
        if (!importMutation.isPending) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">Import Questions</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Upload a file to import multiple questions at once.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={importMutation.isPending}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className="space-y-5 p-6">
                    {/* Supported Formats */}
                    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                        <p className="mb-3 text-sm font-medium text-slate-300">Supported File Formats</p>
                        <div className="flex flex-wrap gap-2">
                            {FORMAT_LABELS.map((fmt) => (
                                <span
                                    key={fmt}
                                    className="rounded-md bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300"
                                >
                                    {fmt}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition
                            ${dragOver
                                ? "border-orange-500 bg-orange-500/5"
                                : selectedFile
                                    ? "border-green-500/50 bg-green-500/5"
                                    : "border-slate-600 bg-slate-800/30 hover:border-orange-500/50 hover:bg-orange-500/5"
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_FORMATS}
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files[0])}
                        />

                        {selectedFile ? (
                            <div className="flex flex-col items-center gap-3">
                                <FaFileAlt size={36} className="text-green-400" />
                                <p className="font-semibold text-white">{selectedFile.name}</p>
                                <p className="text-sm text-slate-400">
                                    {(selectedFile.size / 1024).toFixed(1)} KB — click to change file
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <FaCloudUploadAlt size={40} className="text-slate-500" />
                                <p className="font-medium text-slate-300">
                                    Drop your file here, or click to browse
                                </p>
                                <p className="text-sm text-slate-500">Max file size: 20 MB</p>
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                            <FaExclamationCircle className="mt-0.5 shrink-0 text-red-400" size={16} />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-400" size={16} />
                                <h3 className="font-semibold text-white">Import Complete</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg bg-slate-900 p-3 text-center">
                                    <p className="text-2xl font-bold text-white">{result.total ?? result.inserted}</p>
                                    <p className="text-xs text-slate-400">Total Parsed</p>
                                </div>
                                <div className="rounded-lg bg-slate-900 p-3 text-center">
                                    <p className="text-2xl font-bold text-green-400">{result.inserted}</p>
                                    <p className="text-xs text-slate-400">Inserted</p>
                                </div>
                                <div className="rounded-lg bg-slate-900 p-3 text-center">
                                    <p className="text-2xl font-bold text-red-400">{result.failed ?? 0}</p>
                                    <p className="text-xs text-slate-400">Failed</p>
                                </div>
                            </div>

                            {result.errors?.length > 0 && (
                                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                                    <p className="text-xs font-medium text-slate-400">Failed Rows:</p>
                                    {result.errors.map((err, i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-xs text-red-300"
                                        >
                                            <span className="font-semibold">Row {err.row}:</span>{" "}
                                            {err.errors?.join(", ")}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Templates */}
                    <div>
                        <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Download Sample Templates
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => downloadTemplate(CSV_TEMPLATE, "questions_template.csv", "text/csv")}
                                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:border-orange-500/50 hover:text-orange-400"
                            >
                                <FaDownload size={12} />
                                CSV Template
                            </button>
                            <button
                                type="button"
                                onClick={() => downloadTemplate(JSON_TEMPLATE, "questions_template.json", "application/json")}
                                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:border-orange-500/50 hover:text-orange-400"
                            >
                                <FaDownload size={12} />
                                JSON Template
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-700 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={importMutation.isPending}
                        className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                    >
                        {result ? "Close" : "Cancel"}
                    </button>

                    {!result && (
                        <button
                            type="button"
                            onClick={handleImport}
                            disabled={!selectedFile || importMutation.isPending}
                            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FaCloudUploadAlt size={15} />
                            {importMutation.isPending ? "Importing..." : "Import Questions"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
