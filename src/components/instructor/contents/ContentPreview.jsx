"use client";

import {
    FaVideo,
    FaFilePdf,
    FaExternalLinkAlt,
    FaCode,
} from "react-icons/fa";

function getYoutubeEmbedUrl(url) {
    if (!url) return "";

    const regExp =
        /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;

    const match = url.match(regExp);

    if (!match || !match[1]) {
        return url;
    }

    return `https://www.youtube.com/embed/${match[1]}`;
}

export default function ContentPreview({
                                           content,
                                       }) {
    if (!content) return null;

    switch (content.type) {
        case "VIDEO":
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <FaVideo className="text-xl text-red-400" />

                        <h2 className="text-2xl font-semibold">
                            Video Content
                        </h2>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-800">
                        <iframe
                            src={getYoutubeEmbedUrl(
                                content.videoUrl
                            )}
                            title={content.title}
                            className="aspect-video w-full"
                            allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture
              "
                            allowFullScreen
                        />
                    </div>
                </div>
            );

        case "FILE":
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <FaFilePdf className="text-xl text-blue-400" />

                        <h2 className="text-2xl font-semibold">
                            Document
                        </h2>
                    </div>

                    <iframe
                        src={content.fileUrl}
                        title={content.title}
                        className="
              h-[700px]
              w-full
              rounded-2xl
              border
              border-slate-800
            "
                    />
                </div>
            );

        case "LINK":
            return (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                    <div className="mb-5 flex items-center gap-3">
                        <FaExternalLinkAlt className="text-xl text-green-400" />

                        <h2 className="text-2xl font-semibold">
                            External Resource
                        </h2>
                    </div>

                    <p className="mb-6 text-slate-400">
                        Click below to open this resource.
                    </p>

                    <a
                        href={content.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-orange-600
              px-6
              py-3
              font-medium
              transition
              hover:bg-orange-700
            "
                    >
                        Open Resource

                        <FaExternalLinkAlt />
                    </a>
                </div>
            );

        case "HTML":
            return (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <FaCode className="text-xl text-purple-400" />

                        <h2 className="text-2xl font-semibold">
                            HTML Content
                        </h2>
                    </div>

                    <div
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                            __html:
                                content.htmlContent || "",
                        }}
                    />
                </div>
            );

        default:
            return (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                    <h2 className="text-2xl font-semibold">
                        Unsupported Content Type
                    </h2>

                    <p className="mt-3 text-slate-400">
                        This content cannot be previewed.
                    </p>
                </div>
            );
    }
}