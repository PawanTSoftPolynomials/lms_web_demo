"use client";

import { useState } from "react";
import { Eye, Edit2, FileText } from "lucide-react";

const renderMarkdown = (text) => {
    if (!text) return "";
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Headings
    html = html.replace(/^### (.*?)$/gm, "<h3 class='text-lg font-bold text-white mt-3 mb-1'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 class='text-xl font-bold text-white mt-4 mb-2'>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1 class='text-2xl font-bold text-white mt-4 mb-2'>$1</h1>");
    // Lists
    html = html.replace(/^\-\s+(.*?)$/gm, "<li class='list-disc list-inside ml-4 text-slate-300'>$1</li>");
    // Code
    html = html.replace(/`(.*?)`/g, "<code class='bg-slate-800 px-1.5 py-0.5 rounded text-orange-400 font-mono text-sm'>$1</code>");
    // Newlines
    html = html.split("\n").join("<br/>");
    return html;
};

export default function SelfAssessmentInput({
                                                 value = "",
                                                 onChange,
                                             }) {
    const [activeTab, setActiveTab] = useState("write"); // write | preview

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <p className="text-sm text-slate-400">
                    Write your detailed self-assessment answer in markdown format:
                </p>

                {/* Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab("write")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                            activeTab === "write"
                                ? "bg-orange-500 text-white"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <Edit2 className="h-3 w-3" /> Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                            activeTab === "preview"
                                ? "bg-orange-500 text-white"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <Eye className="h-3 w-3" /> Preview
                    </button>
                </div>
            </div>

            {/* Input Area */}
            {activeTab === "write" ? (
                <div className="space-y-2">
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Type your explanation here. You can use markdown like **bold**, `code`, # Headings, or - Lists..."
                        rows={10}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-5 text-slate-100 placeholder-slate-600 focus:border-orange-500 focus:outline-none transition font-sans text-base leading-relaxed"
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileText className="h-4 w-4" />
                        <span>Supports basic markdown formatting. Double check formatting in the Preview tab.</span>
                    </div>
                </div>
            ) : (
                <div className="w-full min-h-[250px] rounded-xl border border-slate-800 bg-slate-950 p-6 overflow-auto">
                    {value ? (
                        <div
                            className="prose prose-invert max-w-none text-slate-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                        />
                    ) : (
                        <p className="text-slate-600 italic text-center mt-16">Nothing to preview. Go back to write your answer.</p>
                    )}
                </div>
            )}
        </div>
    );
}
