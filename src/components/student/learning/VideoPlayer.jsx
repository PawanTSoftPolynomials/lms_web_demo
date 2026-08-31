"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    FileText,
    ExternalLink,
    PlayCircle,
    BookOpen,
    Presentation,
    ChevronLeft,
    ChevronRight,
    Music,
} from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

import { getYouTubeVideoId, isYouTubeUrl as isYoutubeUrl } from "@/lib/youtube";
import { getDisplayUrl } from "@/lib/blob";
import MarkdownRenderer from "@/components/ui/MarkdownEditor/MarkdownRenderer";
import { unescapeFromContentApi, highlightCode } from "@/lib/markdown";
import PdfViewer from "@/components/student/learn/PdfViewer";
import PptViewer from "@/components/shared/PptViewer";
import ExternalDocumentViewer from "@/components/shared/ExternalDocumentViewer";

const isGoogleSlidesUrl = (url) => Boolean(url?.includes("docs.google.com/presentation"));
const getGoogleSlidesEmbedUrl = (url) => {
    if (!url) return "";
    return url.replace(/\/edit(\?.*)?$/, "/embed").replace(/\/pub(\?.*)?$/, "/embed");
};
const parseSlides = (html) => {
    if (!html) return [];
    const sections = html.split(/<hr\s*\/?>|<!--\s*slide\s*-->/i);
    return sections.map(s => s.trim()).filter(Boolean);
};

const VideoPlayer = forwardRef(function VideoPlayer(
    { content, onTimeUpdate, onEnded, onDurationChange, initialTime = 0 },
    ref
) {
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const localVideoRef = useRef(null);
    const [slideIndex, setSlideIndex] = useState(0);

    const type = content?.type;
    const videoUrl = content?.videoUrl;
    const fileUrl = content?.fileUrl;
    const htmlContent = content?.htmlContent;
    const externalUrl = content?.externalUrl;

    // Private Vercel Blob URLs 403 unless routed through /api/blob-proxy.
    const displayVideoUrl = getDisplayUrl(videoUrl);
    const displayFileUrl = getDisplayUrl(fileUrl);

    const isYoutube = type === "VIDEO" && isYoutubeUrl(videoUrl);

    const initialTimeRef = useRef(initialTime);

    const onTimeUpdateRef = useRef(onTimeUpdate);
    const onEndedRef = useRef(onEnded);
    const onDurationChangeRef = useRef(onDurationChange);
    useEffect(() => {
        onTimeUpdateRef.current = onTimeUpdate;
    }, [onTimeUpdate]);
    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);
    useEffect(() => {
        onDurationChangeRef.current = onDurationChange;
    }, [onDurationChange]);

    useEffect(() => {
        initialTimeRef.current = initialTime;
    }, [videoUrl, initialTime]);

    useImperativeHandle(
        ref,
        () => ({
            seekTo(seconds) {
                if (isYoutube) {
                    playerRef.current?.seekTo?.(seconds, true);
                    playerRef.current?.playVideo?.();
                } else if (localVideoRef.current) {
                    localVideoRef.current.currentTime = seconds;
                    localVideoRef.current.play?.().catch(() => {});
                }
            },
        }),
        [isYoutube]
    );

    // YouTube API Integration with responsive width & height
    useEffect(() => {
        if (!isYoutube || !videoUrl) return;

        const videoId = getYouTubeVideoId(videoUrl);
        if (!videoId) return;

        let player;
        let intervalId;

        const onPlayerStateChange = (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
                if (player && typeof player.getDuration === "function") {
                    onDurationChangeRef.current?.(player.getDuration());
                }
                intervalId = setInterval(() => {
                    if (player && typeof player.getCurrentTime === "function") {
                        onTimeUpdateRef.current?.(Math.floor(player.getCurrentTime()));
                    }
                }, 500);
            } else if (event.data === window.YT.PlayerState.ENDED) {
                clearInterval(intervalId);
                onEndedRef.current?.();
            } else {
                clearInterval(intervalId);
            }
        };

        const initializePlayer = () => {
            if (!containerRef.current) return;
            // A shared/hardcoded id here would collide across every VideoPlayer
            // instance mounted at once (a lesson typically renders one per
            // topic's video) — YT.Player would then only ever find the first
            // one in the document. Passing the element itself sidesteps that.
            containerRef.current.innerHTML = "";
            const target = document.createElement("div");
            target.className = "w-full h-full";
            containerRef.current.appendChild(target);
            player = new window.YT.Player(target, {
                height: "100%",
                width: "100%",
                videoId: videoId,
                playerVars: {
                    start: initialTimeRef.current || 0,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    enablejsapi: 1,
                    ...(typeof window !== "undefined"
                        ? { origin: window.location.origin }
                        : {}),
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
    }, [videoUrl, isYoutube]);

    useEffect(() => {
        const videoEl = localVideoRef.current;
        if (!videoEl || isYoutube) return;

        const applyInitialTime = () => {
            if (initialTimeRef.current > 0) {
                videoEl.currentTime = initialTimeRef.current;
            }
        };

        if (videoEl.readyState >= 1) {
            applyInitialTime();
        } else {
            videoEl.addEventListener("loadedmetadata", applyInitialTime);
            return () => videoEl.removeEventListener("loadedmetadata", applyInitialTime);
        }
    }, [videoUrl, isYoutube]);

    useEffect(() => {
        setSlideIndex(0);
    }, [content]);

    if (!content) {
        return (
            <div className="flex aspect-video min-h-[220px] max-h-[520px] w-full items-center justify-center rounded-2xl border border-border bg-background p-6 text-center">
                <div>
                    <PlayCircle className="mx-auto mb-3 h-12 w-12 text-slate-600 animate-pulse" />
                    <h3 className="text-base sm:text-xl font-semibold text-foreground">Select a lesson</h3>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Choose a lesson from the sidebar to begin learning.</p>
                </div>
            </div>
        );
    }

    const isHtmlLike = type === "HTML" || type === "PRESENTATION";
    const isFileLike = type === "FILE" || type === "DOCUMENT";
    const slides = isHtmlLike ? parseSlides(htmlContent) : [];
    const isSlideShow = isHtmlLike && slides.length > 1;

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-background flex flex-col w-full">
            {/* Header — skipped for VIDEO: the lesson title already shows above the
                player, and the video's own thumbnail/embed carries its title too,
                so this bar was just a third repeat of the same text. Also skipped
                when there's genuinely no title to show and it's not a slideshow
                (e.g. a merged document block from an import with no block title) —
                an icon-only bar with nothing next to it isn't useful, and we don't
                invent a fake title just to fill it. */}
            {type !== "VIDEO" && (content.title || isSlideShow) && (
            <div className="border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between bg-background min-h-[52px]">
                <h2 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2 truncate pr-2">
                    {isSlideShow && <Presentation className="h-4 w-4 text-primary shrink-0" />}
                    {type === "HTML" && !isSlideShow && <BookOpen className="h-4 w-4 text-primary shrink-0" />}
                    {type === "FILE" && <FileText className="h-4 w-4 text-primary shrink-0" />}
                    {content.title && <span className="truncate">{content.title}</span>}
                </h2>
                {isSlideShow && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full shrink-0">
                        Slide {slideIndex + 1} / {slides.length}
                    </span>
                )}
            </div>
            )}

            {/* Content Area with fluid aspect ratio */}
            <div className="relative w-full flex-1 flex flex-col bg-background">
                {/* VIDEO */}
                {type === "VIDEO" && (
                    isYoutube ? (
                        <div
                            ref={containerRef}
                            className="relative aspect-video w-full max-h-[520px] bg-black overflow-hidden [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full"
                        />
                    ) : (
                        <video
                            ref={localVideoRef}
                            controls
                            src={displayVideoUrl}
                            onEnded={onEnded}
                            onLoadedMetadata={(event) =>
                                onDurationChange?.(event.currentTarget.duration)
                            }
                            onTimeUpdate={(event) =>
                                onTimeUpdate?.(Math.floor(event.currentTarget.currentTime))
                            }
                            className="aspect-video w-full max-h-[520px] bg-black object-contain"
                        />
                    )
                )}

                {/* FILE / DOCUMENT (PDFs / PPTs / Docs / Resources) */}
                {isFileLike && (
                    <div className="w-full">
                        {displayFileUrl && displayFileUrl.toLowerCase().includes(".pdf") ? (
                            <PdfViewer fileUrl={displayFileUrl} title={content?.title} />
                        ) : displayFileUrl && (displayFileUrl.toLowerCase().includes(".ppt") || displayFileUrl.toLowerCase().includes(".pptx")) && (displayFileUrl.includes("blob.vercel-storage.com") || displayFileUrl.includes("/content-uploads/")) ? (
                            <PptViewer fileUrl={displayFileUrl} title={content?.title} />
                        ) : (
                            <ExternalDocumentViewer fileUrl={displayFileUrl} title={content?.title} />
                        )}
                    </div>
                )}

                {/* IMAGE */}
                {type === "IMAGE" && (
                    <div className="flex flex-col items-center gap-3 p-4 sm:p-8">
                        <img
                            src={fileUrl}
                            alt={content.title || "Lesson image"}
                            className="max-w-full max-h-[520px] rounded-xl shadow-sm mx-auto"
                        />
                        {htmlContent && (
                            <div
                                className="prose prose-invert prose-sm max-w-none text-center select-text"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
                            />
                        )}
                    </div>
                )}

                {/* AUDIO */}
                {type === "AUDIO" && (
                    <div className="flex h-[220px] flex-col items-center justify-center gap-4 p-6">
                        <Music className="h-16 w-16 text-primary" />
                        <audio controls src={fileUrl} className="w-full max-w-md" />
                    </div>
                )}

                {/* CODE */}
                {type === "CODE" && (
                    <pre className="m-4 sm:m-8 rounded-xl border border-border overflow-hidden text-xs sm:text-sm select-text">
                        <code
                            className={`hljs${content?.data?.language ? ` language-${content.data.language}` : ""}`}
                            dangerouslySetInnerHTML={{ __html: highlightCode(htmlContent || "", content?.data?.language) }}
                        />
                    </pre>
                )}

                {/* INTERACTIVE_LAB (genuine embedded widgets/tools, not video) */}
                {type === "INTERACTIVE_LAB" && (
                    externalUrl ? (
                        <iframe
                            src={externalUrl}
                            className="h-[320px] sm:h-[420px] md:h-[520px] w-full border-none bg-white"
                            title={content.title}
                        />
                    ) : (
                        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">No embed URL set</div>
                    )
                )}

                {/* EMBED (quiz block preview — the graded quiz itself lives under Quizzes) */}
                {type === "EMBED" && (
                    <div className="p-4 sm:p-8 space-y-3">
                        <div
                            className="prose prose-invert prose-sm max-w-none select-text"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent || "") }}
                        />
                        <p className="text-xs text-muted-foreground">This is a quiz question preview — take the graded quiz from the Quizzes section.</p>
                    </div>
                )}

                {/* HTML / PRESENTATION */}
                {isHtmlLike && (
                    isSlideShow ? (
                        <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 min-h-[320px]">
                            <div 
                                className="prose prose-invert max-w-none text-foreground text-base sm:text-lg leading-relaxed flex-1 flex flex-col justify-center select-text"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(slides[slideIndex] || "") }}
                            />
                            
                            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
                                    disabled={slideIndex === 0}
                                    className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] bg-muted text-foreground rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-muted transition"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </button>
                                
                                <div className="flex gap-1.5 overflow-x-auto py-1">
                                    {slides.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setSlideIndex(i)}
                                            className={`h-2.5 min-w-[10px] rounded-full transition-all ${
                                                i === slideIndex ? "bg-primary w-6" : "bg-slate-700 w-2.5"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                                    disabled={slideIndex === slides.length - 1}
                                    className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] bg-muted text-foreground rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-muted transition"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-8 select-text">
                            <MarkdownRenderer
                                source={unescapeFromContentApi(htmlContent || "")}
                                emptyText="No content yet."
                                className="max-w-4xl mx-auto"
                            />
                        </div>
                    )
                )}

                {/* EXTERNAL LINK */}
                {(type === "EXTERNAL_LINK" || type === "LINK") && (
                    isGoogleSlidesUrl(externalUrl) ? (
                        <iframe
                            src={getGoogleSlidesEmbedUrl(externalUrl)}
                            className="h-[320px] sm:h-[420px] md:h-[520px] w-full border-none"
                            allowFullScreen
                            title={content.title}
                        />
                    ) : (
                        <div className="flex h-[320px] sm:h-[420px] md:h-[520px] flex-col items-center justify-center gap-4 p-6 text-center">
                            <ExternalLink className="h-16 w-16 text-primary animate-pulse" />
                            <h3 className="text-lg font-semibold text-foreground">External Resource</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                                This content is hosted externally. Click below to open it in a new tab.
                            </p>
                            <a
                                href={externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl bg-orange-600 px-5 py-2.5 min-h-[44px] flex items-center justify-center font-bold text-xs uppercase tracking-wider text-foreground transition hover:bg-orange-700 shadow-lg"
                            >
                                Visit Website
                            </a>
                        </div>
                    )
                )}
            </div>
        </div>
    );
});

export default VideoPlayer;