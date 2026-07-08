"use client";

import Link from "next/link";
import {
    PlayCircle,
    FileText,
    ExternalLink,
    Code2,
    Download,
} from "lucide-react";

export default function LessonResources({
                                            lesson,
                                        }) {
    if (!lesson) {
        return (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-600" />

                <h2 className="mt-4 text-xl font-semibold text-white">
                    No Resources
                </h2>

                <p className="mt-2 text-slate-400">
                    Select a lesson to view its learning resources.
                </p>
            </div>
        );
    }

    const contents = lesson.contents || [];

    if (!contents.length) {
        return (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-600" />

                <h2 className="mt-4 text-xl font-semibold text-white">
                    No Resources Available
                </h2>

                <p className="mt-2 text-slate-400">
                    This lesson doesn't contain any additional resources.
                </p>
            </div>
        );
    }

    const getIcon = (type) => {
        switch (type) {
            case "VIDEO":
                return (
                    <PlayCircle className="h-6 w-6 text-red-400" />
                );

            case "FILE":
                return (
                    <FileText className="h-6 w-6 text-blue-400" />
                );

            case "HTML":
                return (
                    <Code2 className="h-6 w-6 text-green-400" />
                );

            case "EXTERNAL":
                return (
                    <ExternalLink className="h-6 w-6 text-orange-400" />
                );

            default:
                return (
                    <FileText className="h-6 w-6 text-slate-400" />
                );
        }
    };

    const getLink = (content) => {
        switch (content.type) {
            case "VIDEO":
                return content.videoUrl;

            case "FILE":
                return content.fileUrl;

            case "EXTERNAL":
                return content.externalUrl;

            default:
                return null;
        }
    };

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-6 py-5">
                <h2 className="text-2xl font-bold text-white">
                    Lesson Resources
                </h2>

                <p className="mt-2 text-slate-400">
                    Supporting materials for this lesson.
                </p>
            </div>

            <div className="divide-y divide-slate-800">
                {contents.map((content) => {
                    const link = getLink(content);

                    return (
                        <div
                            key={content.id}
                            className="flex items-center justify-between gap-4 p-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-slate-800 p-3">
                                    {getIcon(content.type)}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-white">
                                        {content.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        {content.type}
                                    </p>
                                </div>
                            </div>

                            {content.type === "HTML" ? (
                                <span className="rounded-lg bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400">
                  Inline Content
                </span>
                            ) : (
                                link && (
                                    <Link
                                        href={link}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
                                    >
                                        {content.type === "FILE" ? (
                                            <>
                                                <Download className="h-4 w-4" />
                                                Download
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink className="h-4 w-4" />
                                                Open
                                            </>
                                        )}
                                    </Link>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}