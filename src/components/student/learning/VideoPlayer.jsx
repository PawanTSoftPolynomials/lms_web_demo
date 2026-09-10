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
    Paperclip,
} from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

import { getYouTubeVideoId, isYouTubeUrl as isYoutubeUrl } from "@/lib/youtube";
import { getDisplayUrl } from "@/lib/blob";
import MarkdownRenderer from "@/components/ui/MarkdownEditor/MarkdownRenderer";
import { unescapeFromContentApi, highlightCode } from "@/lib/markdown";
import PdfViewer from "@/components/student/learn/PdfViewer";
import PptViewer from "@/components/shared/PptViewer";
import DocxViewer from "@/components/shared/DocxViewer";
import ExternalDocumentViewer from "@/components/shared/ExternalDocumentViewer";

const isGoogleSlidesUrl = (url) => Boolean(url?.includes("docs.google.com/presentation"));
const getGoogleSlidesEmbedUrl = (url) => {
    if (!url) return "";
    return url.replace(/\/edit(\?.*)?$/, "/embed").replace(/\/pub(\?.*)?$/, "/embed");
};
/**
 * A human-readable name for an attached file. Prefers the original upload name
 * recorded on the Content row and falls back to the last path segment of the
 * stored URL, so the row never renders a blank label.
 */
const getAttachmentName = (content) => {
    const recorded = content?.data?.originalName || content?.data?.fileName;
    if (recorded) return recorded;
    const raw = content?.fileUrl;
    if (!raw) return "Attachment";
    try {
        const last = raw.split("?")[0].split("#")[0].split("/").pop();
        if (!last) return "Attachment";
        // Uploads are stored as "<epoch>-<original name>"; show the part a
        // student would recognise rather than the storage key.
        return decodeURIComponent(last).replace(/^\d{10,}-/, "");
    } catch {
        return "Attachment";
    }
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

    const effectiveVideoUrl = videoUrl || fileUrl || externalUrl;

    // Private Vercel Blob URLs 403 unless routed through /api/blob-proxy.
    const displayVideoUrl = getDisplayUrl(effectiveVideoUrl);
    const displayFileUrl = getDisplayUrl(fileUrl);

    const isYoutube = type === "VIDEO" && isYoutubeUrl(effectiveVideoUrl);

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
    }, [effectiveVideoUrl, initialTime]);

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
        if (!isYoutube || !effectiveVideoUrl) return;

        const videoId = getYouTubeVideoId(effectiveVideoUrl);
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
    }, [effectiveVideoUrl, isYoutube]);

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
    }, [effectiveVideoUrl, isYoutube]);

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

    const isFileLike = type === "FILE" || type === "DOCUMENT" || type === "PDF";
    const isTextLike = type === "TEXT" || type === "HTML";
    const isPresentationLike = type === "PRESENTATION" || type === "SLIDE";
    const isHtmlLike = isTextLike || isPresentationLike;
    const slides = isPresentationLike ? parseSlides(htmlContent) : [];
    const isSlideShow = isPresentationLike && slides.length > 1;

    // Only VIDEO needs to fill (and be clipped to) the player frame exactly —
    // it's a fixed-aspect embed with nothing more to reveal. Every other
    // type (a long document, a tall embedded image, multi-slide HTML, etc.)
    // must be free to grow past the frame's height instead of being cropped
    // by it, so the scrollable frame around this component (see the Content
    // Player Frame in the learn page) can actually scroll to the rest of it.
    const fillsFrame = type === "VIDEO";

    return (
        <div className={`overflow-hidden rounded-2xl border border-border bg-background flex flex-col w-full ${fillsFrame ? "h-full" : "min-h-full max-xl:rounded-none max-xl:border-0 max-xl:bg-transparent"}`}>
            {/* Header — skipped for VIDEO: the lesson title already shows above the
                player, and the video's own thumbnail/embed carries its title too,
                so this bar was just a third repeat of the same text. Also skipped
                when there's genuinely no title to show and it's not a slideshow
                (e.g. a merged document block from an import with no block title) —
                an icon-only bar with nothing next to it isn't useful, and we don't
                invent a fake title just to fill it. */}
            {type !== "VIDEO" && (content.title || isSlideShow) && (
            <div className="border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between bg-background min-h-[52px] max-xl:px-0 max-xl:bg-transparent">
                <h2 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2 truncate pr-2">
                    {isSlideShow && <Presentation className="h-4 w-4 text-primary shrink-0" />}
                    {isTextLike && !isSlideShow && <BookOpen className="h-4 w-4 text-primary shrink-0" />}
                    {isFileLike && <FileText className="h-4 w-4 text-primary shrink-0" />}
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
            <div className="relative w-full flex-1 flex flex-col bg-background max-xl:bg-transparent">
                {/* VIDEO */}
                {type === "VIDEO" && (
                    isYoutube ? (
                        <div
                            ref={containerRef}
                            className="relative w-full h-full bg-black overflow-hidden [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full"
                        />
                    ) : displayVideoUrl ? (
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
                            className="w-full h-full bg-black object-contain"
                        />
                    ) : (
                        <div className="flex h-80 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-[#0B101D] p-6 text-center">
                            <PlayCircle className="h-10 w-10 text-amber-500 animate-pulse" />
                            <h4 className="text-sm font-bold text-foreground">No Video Source Provided</h4>
                            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                                No video URL or video file was configured for this video item.
                            </p>
                        </div>
                    )
                )}

                {/* FILE / DOCUMENT / PDF (PDFs / PPTs / Docs / Resources) */}
                {isFileLike && (
                    <div className="w-full">
                        {displayFileUrl && (displayFileUrl.toLowerCase().includes(".pdf") || displayFileUrl.toLowerCase().includes("/pdf")) ? (
                            <PdfViewer fileUrl={displayFileUrl} title={content?.title} />
                        ) : displayFileUrl && (displayFileUrl.toLowerCase().includes(".ppt") || displayFileUrl.toLowerCase().includes(".pptx")) ? (
                            <PptViewer fileUrl={displayFileUrl} title={content?.title} />
                        ) : displayFileUrl && (displayFileUrl.toLowerCase().includes(".doc") || displayFileUrl.toLowerCase().includes(".docx")) ? (
                            <DocxViewer fileUrl={displayFileUrl} title={content?.title} />
                        ) : displayFileUrl ? (
                            <ExternalDocumentViewer fileUrl={displayFileUrl} title={content?.title} />
                        ) : htmlContent ? (
                            <div className="p-4 sm:p-8 select-text max-xl:px-0">
                                <MarkdownRenderer
                                    source={unescapeFromContentApi(htmlContent || "")}
                                    emptyText="No document content provided."
                                    className="max-w-4xl mx-auto"
                                />
                            </div>
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

                {/* CODE / CODING_EXERCISE */}
                {(type === "CODE" || type === "CODING_EXERCISE") && (
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

                {/* HTML / TEXT / PRESENTATION / SLIDE */}
                {isHtmlLike && !isFileLike && (
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
                        <div className="p-4 sm:p-8 select-text max-xl:px-0">
                            <MarkdownRenderer
                                source={unescapeFromContentApi(htmlContent || "")}
                                emptyText="No content yet."
                                className="max-w-4xl mx-auto"
                            />
                        </div>
                    )
                )}

                {/* ASSIGNMENT (descriptive assignment brief, not a quiz).
                    Two clearly separated sections: the instructor's written
                    instructions, then the instructor's reference file. The
                    title already sits in the header bar above, so it is not
                    repeated here. Completion for this block runs through the
                    workspace's existing backend-authoritative completion
                    strip, exactly as for every other Content type. */}
                {type === "ASSIGNMENT" && (
                    <div className="p-4 sm:p-6 md:p-8 max-w-3xl w-full mx-auto space-y-6">
                        <section className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Assignment Instructions
                            </p>
                            {htmlContent ? (
                                <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed text-foreground/90 select-text">
                                    {unescapeFromContentApi(htmlContent)}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    No instructions were provided for this assignment.
                                </p>
                            )}
                        </section>

                        <section className="space-y-2 border-t border-border pt-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Reference Material
                            </p>
                            {fileUrl ? (
                                <>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                                        <span className="flex items-center gap-2 min-w-0">
                                            <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate text-xs font-semibold text-foreground">
                                                {getAttachmentName(content)}
                                            </span>
                                        </span>
                                        <a
                                            href={displayFileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="shrink-0 self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-2.5 min-h-[44px] text-xs font-bold text-primary hover:bg-background transition"
                                        >
                                            <Paperclip className="h-4 w-4" />
                                            View Attachment
                                        </a>
                                    </div>
                                    <p className="text-[11px] font-semibold text-muted-foreground">
                                        Provided by your instructor. This is not your submission.
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    No reference material provided.
                                </p>
                            )}
                        </section>
                    </div>
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