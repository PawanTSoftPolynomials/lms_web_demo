"use client";

import { useEffect, useRef, useState } from "react";
import {
    FileText,
    ExternalLink,
    PlayCircle,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    BookOpen,
    Presentation,
} from "lucide-react";

const isYoutubeUrl = (url) =>
    Boolean(
        url?.match(
            /(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)/
        )
    );

const isGoogleSlidesUrl = (url) =>
    Boolean(url?.includes("docs.google.com/presentation"));

const getGoogleSlidesEmbedUrl = (url) => {
    if (!url) return "";
    // Replace edit/pub paths with embed path
    return url.replace(/\/edit(\?.*)?$/, "/embed").replace(/\/pub(\?.*)?$/, "/embed");
};

const isOfficeDoc = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith(".ppt") || lower.endsWith(".pptx") || lower.endsWith(".doc") || lower.endsWith(".docx");
};

const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith(".pdf");
};

const parseSlides = (html) => {
    if (!html) return [];
    // Split by <hr>, <hr/>, <hr />, or <!-- slide --> comments
    const sections = html.split(/<hr\s*\/?>|<!--\s*slide\s*-->/i);
    return sections.map(s => s.trim()).filter(Boolean);
};

export default function VideoPlayer({
                                        content,
                                        onTimeUpdate,
                                        initialTime = 0,
                                    }) {
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const localVideoRef = useRef(null);

    const [slideIndex, setSlideIndex] = useState(0);

    const type = content?.type;
    const videoUrl = content?.videoUrl;
    const fileUrl = content?.fileUrl;
    const htmlContent = content?.htmlContent;
    const externalUrl = content?.externalUrl;

    const isYoutube = type === "VIDEO" && isYoutubeUrl(videoUrl);

    const initialTimeRef = useRef(initialTime);

    // Sync initialTimeRef on content change
    useEffect(() => {
        initialTimeRef.current = initialTime;
    }, [videoUrl]);

    // YouTube API Integration
    useEffect(() => {
        if (!isYoutube || !videoUrl) return;

        const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
        const match = videoUrl.match(regExp);
        const videoId = match && match[1];
        if (!videoId) return;

        let player;
        let intervalId;

        const onPlayerStateChange = (event) => {
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
                playerVars: {
                    start: initialTimeRef.current || 0,
                },
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

    // Handle Local Video Initial Resume Time
    useEffect(() => {
        if (localVideoRef.current && initialTimeRef.current > 0) {
            localVideoRef.current.currentTime = initialTimeRef.current;
        }
    }, [videoUrl]);

    // Reset slides when content changes
    useEffect(() => {
        setSlideIndex(0);
    }, [content]);

    if (!content) {
        return (
            <div className="flex h-[520px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-center">
                    <PlayCircle className="mx-auto mb-4 h-16 w-16 text-slate-600 animate-pulse" />
                    <h3 className="text-xl font-semibold text-white">Select a lesson</h3>
                    <p className="mt-2 text-slate-400">Choose a lesson from the sidebar to begin learning.</p>
                </div>
            </div>
        );
    }

    // Determine slides or reader layout for HTML and files
    const slides = type === "HTML" ? parseSlides(htmlContent) : [];
    const isSlideShow = type === "HTML" && slides.length > 1;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-950">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    {type === "VIDEO" && <PlayCircle className="h-5 w-5 text-orange-500" />}
                    {isSlideShow && <Presentation className="h-5 w-5 text-orange-500" />}
                    {type === "HTML" && !isSlideShow && <BookOpen className="h-5 w-5 text-orange-500" />}
                    {type === "FILE" && <FileText className="h-5 w-5 text-orange-500" />}
                    {content.title}
                </h2>
                {isSlideShow && (
                    <span className="text-sm font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                        Slide {slideIndex + 1} of {slides.length}
                    </span>
                )}
            </div>

            {/* Content Area */}
            <div className="relative min-h-[520px] flex-1 flex flex-col bg-slate-900">
                {/* VIDEO */}
                {type === "VIDEO" && (
                    isYoutube ? (
                        <div ref={containerRef} className="h-[520px] w-full bg-black" />
                    ) : (
                        <video
                            ref={localVideoRef}
                            controls
                            src={videoUrl}
                            onTimeUpdate={(event) =>
                                onTimeUpdate?.(Math.floor(event.currentTarget.currentTime))
                            }
                            className="h-[520px] w-full bg-black"
                        />
                    )
                )}

                {/* FILE (PDFs / PPTs / Docs / Resources) */}
                {type === "FILE" && (
                    isPdf(fileUrl) ? (
                        <iframe
                            src={fileUrl}
                            className="h-[520px] w-full border-none bg-slate-800"
                            title={content.title}
                        />
                    ) : isOfficeDoc(fileUrl) ? (
                        <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                            className="h-[520px] w-full border-none bg-slate-800"
                            title={content.title}
                        />
                    ) : (
                        <div className="flex h-[520px] flex-col items-center justify-center gap-6">
                            <FileText className="h-20 w-20 text-orange-500 animate-bounce" />
                            <h3 className="text-xl font-semibold text-white">Download Resource</h3>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700 shadow-lg shadow-orange-600/20"
                            >
                                Open File
                            </a>
                        </div>
                    )
                )}

                {/* HTML (Interactive Slide Show OR Document view) */}
                {type === "HTML" && (
                    isSlideShow ? (
                        <div className="flex-1 flex flex-col justify-between p-8 min-h-[460px]">
                            {/* Slide Content */}
                            <div 
                                className="prose prose-invert max-w-none text-white text-lg leading-relaxed flex-1 flex flex-col justify-center select-text"
                                dangerouslySetInnerHTML={{ __html: slides[slideIndex] }}
                            />
                            
                            {/* Navigation Bar */}
                            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                                <button
                                    onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
                                    disabled={slideIndex === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </button>
                                
                                {/* Slide indicators dots */}
                                <div className="flex gap-2">
                                    {slides.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSlideIndex(i)}
                                            className={`h-2.5 w-2.5 rounded-full transition-all ${
                                                i === slideIndex ? "bg-orange-500 w-6" : "bg-slate-700"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => setSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                                    disabled={slideIndex === slides.length - 1}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="prose prose-invert max-w-none p-8 text-slate-200 leading-relaxed font-sans select-text"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )
                )}

                {/* EXTERNAL LINK / GOOGLE SLIDES */}
                {(type === "EXTERNAL" || type === "LINK") && (
                    isGoogleSlidesUrl(externalUrl) ? (
                        <iframe
                            src={getGoogleSlidesEmbedUrl(externalUrl)}
                            className="h-[520px] w-full border-none"
                            allowFullScreen
                            title={content.title}
                        />
                    ) : (
                        <div className="flex h-[520px] flex-col items-center justify-center gap-6">
                            <ExternalLink className="h-20 w-20 text-orange-500 animate-pulse" />
                            <h3 className="text-xl font-semibold text-white">External Resource</h3>
                            <p className="text-slate-400 text-center max-w-md px-4">
                                This content is hosted externally. Click below to open it in a new tab.
                            </p>
                            <a
                                href={externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700 shadow-lg shadow-orange-600/20"
                            >
                                Visit Website
                            </a>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}