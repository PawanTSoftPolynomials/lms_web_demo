"use client";

import { useEffect, useRef } from "react";
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
    const containerRef = useRef(null);
    const playerRef = useRef(null);

    const type = content?.type;
    const videoUrl = content?.videoUrl;
    const isYoutube = type === "VIDEO" && isYoutubeUrl(videoUrl);

    useEffect(() => {
        if (!isYoutube || !videoUrl) return;

        const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
        const match = videoUrl.match(regExp);
        const videoId = match && match[1];
        if (!videoId) return;

        let player;
        let intervalId;

        const onPlayerStateChange = (event) => {
            // YT.PlayerState.PLAYING is 1
            if (event.data === window.YT.PlayerState.PLAYING) {
                intervalId = setInterval(() => {
                    if (player && typeof player.getCurrentTime === "function") {
                        onTimeUpdate?.(Math.floor(player.getCurrentTime()));
                    }
                }, 500);
            } else {
                clearInterval(intervalId);
            }
        };

        const initializePlayer = () => {
            if (!containerRef.current) return;
            containerRef.current.innerHTML = "<div id='yt-player-el'></div>";
            player = new window.YT.Player("yt-player-el", {
                height: "520",
                width: "100%",
                videoId: videoId,
                events: {
                    onStateChange: onPlayerStateChange,
                },
            });
            playerRef.current = player;
        };

        if (window.YT && window.YT.Player) {
            initializePlayer();
        } else {
            if (!document.getElementById("youtube-iframe-api")) {
                const tag = document.createElement("script");
                tag.id = "youtube-iframe-api";
                tag.src = "https://www.youtube.com/iframe_api";
                document.body.appendChild(tag);
            }

            const checkTimer = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkTimer);
                    initializePlayer();
                }
            }, 100);

            return () => {
                clearInterval(checkTimer);
                clearInterval(intervalId);
                if (playerRef.current && typeof playerRef.current.destroy === "function") {
                    playerRef.current.destroy();
                }
            };
        }

        return () => {
            clearInterval(intervalId);
            if (playerRef.current && typeof playerRef.current.destroy === "function") {
                playerRef.current.destroy();
            }
        };
    }, [videoUrl, isYoutube, onTimeUpdate]);

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
        title,
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
                    isYoutube ? (
                        <div ref={containerRef} className="h-[520px] w-full bg-black" />
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