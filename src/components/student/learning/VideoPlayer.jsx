"use client";

import {
    FileText,
    ExternalLink,
    PlayCircle,
} from "lucide-react";

const isYoutubeUrl = (url) =>
    Boolean(
        url?.match(
            /(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)/
        )
    );

const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";

    const regExp =
        /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (!match || !match[1]) {
        return url;
    }

    return `https://www.youtube.com/embed/${match[1]}`;
};

export default function VideoPlayer({
                                        content,
                                        onTimeUpdate,
                                    }) {
    if (!content) {
        return (
            <div className="flex h-[520px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-center">
                    <PlayCircle className="mx-auto mb-4 h-16 w-16 text-slate-600" />

                    <h3 className="text-xl font-semibold text-white">
                        Select a lesson
                    </h3>

                    <p className="mt-2 text-slate-400">
                        Choose a lesson from the sidebar to begin learning.
                    </p>
                </div>
            </div>
        );
    }

    const {
        type,
        title,
        videoUrl,
        fileUrl,
        htmlContent,
        externalUrl,
    } = content;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            {/* Header */}
            <div className="border-b border-slate-800 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                    {title}
                </h2>
            </div>

            {/* Content */}
            <div className="min-h-[520px]">
                {/* VIDEO */}
                {type === "VIDEO" && (
                    isYoutubeUrl(videoUrl) ? (
                        <iframe
                            src={getYoutubeEmbedUrl(videoUrl)}
                            className="h-[520px] w-full"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            controls
                            src={videoUrl}
                            onTimeUpdate={(event) =>
                                onTimeUpdate?.(
                                    Math.floor(
                                        event.currentTarget.currentTime
                                    )
                                )
                            }
                            className="h-[520px] w-full"
                        />
                    )
                )}

                {/* FILE */}
                {type === "FILE" && (
                    <div className="flex h-[520px] flex-col items-center justify-center gap-6">
                        <FileText className="h-20 w-20 text-orange-500" />

                        <h3 className="text-xl font-semibold text-white">
                            Download Resource
                        </h3>

                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700"
                        >
                            Open File
                        </a>
                    </div>
                )}

                {/* HTML */}
                {type === "HTML" && (
                    <div
                        className="prose prose-invert max-w-none p-8"
                        dangerouslySetInnerHTML={{
                            __html: htmlContent,
                        }}
                    />
                )}

                {/* EXTERNAL LINK */}
                {(type === "EXTERNAL" || type === "LINK") && (
                    <div className="flex h-[520px] flex-col items-center justify-center gap-6">
                        <ExternalLink className="h-20 w-20 text-orange-500" />

                        <h3 className="text-xl font-semibold text-white">
                            External Resource
                        </h3>

                        <a
                            href={externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700"
                        >
                            Visit Website
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}