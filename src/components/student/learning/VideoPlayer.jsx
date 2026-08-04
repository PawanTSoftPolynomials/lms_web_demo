"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react";
import {
    FileText,
    ExternalLink,
    PlayCircle,
    BookOpen,
    Presentation,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import DOMPurify from "isomorphic-dompurify";

import { getYouTubeVideoId, isYouTubeUrl as isYoutubeUrl } from "@/lib/youtube";

const isGoogleSlidesUrl = (url) => Boolean(url?.includes("docs.google.com/presentation"));
const getGoogleSlidesEmbedUrl = (url) => {
    if (!url) return "";
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
    const sections = html.split(/<hr\s*\/?>|<!--\s*slide\s*-->/i);
    return sections.map(s => s.trim()).filter(Boolean);
};

const VideoPlayer = forwardRef(function VideoPlayer(
    { content, onTimeUpdate, onEnded, onDurationChange, initialTime = 0, courseId, lessonId: resolvedLessonId },
    ref
) {
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const localVideoRef = useRef(null);
    const [slideIndex, setSlideIndex] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    
    // Video Analytics state
    const pingIntervalRef = useRef(null);
    const lastPingTimeRef = useRef(0);
    const accumulatedSecondsRef = useRef(0);

    const type = content?.type;
    const videoUrl = content?.videoUrl;
    const fileUrl = content?.fileUrl;
    const htmlContent = content?.htmlContent;
    const externalUrl = content?.externalUrl;

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
            containerRef.current.innerHTML = "<div id='yt-player-el' class='w-full h-full'></div>";
            player = new window.YT.Player("yt-player-el", {
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

    const stopPingTimer = useCallback(() => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        setSlideIndex(0);
        setHasStarted(false);
        accumulatedSecondsRef.current = 0;
        lastPingTimeRef.current = 0;

        return () => stopPingTimer();
    }, [content, stopPingTimer]);

    const startPingTimer = useCallback(() => {
        if (!resolvedLessonId) return;
        
        stopPingTimer();
        pingIntervalRef.current = setInterval(async () => {
            if (accumulatedSecondsRef.current >= 10) {
                const watchTimeToSend = accumulatedSecondsRef.current;
                accumulatedSecondsRef.current = 0; // Reset eagerly
                
                try {
                    const token = Cookies.get("accessToken");
                    await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/analytics/video-ping`,
                        {
                            lessonId: resolvedLessonId,
                            courseId,
                            watchTime: watchTimeToSend
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                } catch (error) {
                    console.error("Failed to ping video analytics:", error);
                }
            }
        }, 10000); // Ping every 10 seconds
    }, [resolvedLessonId, courseId, stopPingTimer]);

    const handleProgress = (state) => {
        const { playedSeconds } = state;
        onTimeUpdate?.(Math.floor(playedSeconds));
        
        // Track accumulated seconds for analytics
        const delta = playedSeconds - lastPingTimeRef.current;
        if (delta > 0 && delta < 5) { // Avoid huge jumps from seeking
            accumulatedSecondsRef.current += delta;
        }
        lastPingTimeRef.current = playedSeconds;
    };

    const handlePlay = () => {
        setHasStarted(true);
        startPingTimer();
    };

    const handlePause = () => {
        stopPingTimer();
    };

    const handleReady = () => {
        if (playerRef.current && initialTime > 0 && !hasStarted) {
            playerRef.current.seekTo(initialTime, "seconds");
        }
    };

    const handleEnded = async () => {
        stopPingTimer();
        onEnded?.();
        
        if (resolvedLessonId) {
            try {
                const token = Cookies.get("accessToken");
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/analytics/video-ping`,
                    { lessonId: resolvedLessonId, courseId, completed: true },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error("Failed to record completion:", error);
            }
        }
    };

    if (!content) {
        return (
            <div className="flex aspect-video min-h-[220px] max-h-[520px] w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
                <div>
                    <PlayCircle className="mx-auto mb-3 h-12 w-12 text-slate-600 animate-pulse" />
                    <h3 className="text-base sm:text-xl font-semibold text-white">Select a lesson</h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">Choose a lesson from the sidebar to begin learning.</p>
                </div>
            </div>
        );
    }

    const slides = type === "HTML" ? parseSlides(htmlContent) : [];
    const isSlideShow = type === "HTML" && slides.length > 1;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 flex flex-col w-full">
            {/* Header — skipped for VIDEO: the lesson title already shows above the
                player, and the video's own thumbnail/embed carries its title too,
                so this bar was just a third repeat of the same text. Still shown
                for other content types (slide counter, file/doc title). */}
            {type !== "VIDEO" && (
            <div className="border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between bg-slate-950 min-h-[52px]">
                <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2 truncate pr-2">
                    {isSlideShow && <Presentation className="h-4 w-4 text-orange-500 shrink-0" />}
                    {type === "HTML" && !isSlideShow && <BookOpen className="h-4 w-4 text-orange-500 shrink-0" />}
                    {type === "FILE" && <FileText className="h-4 w-4 text-orange-500 shrink-0" />}
                    <span className="truncate">{content.title}</span>
                </h2>
                {isSlideShow && (
                    <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full shrink-0">
                        Slide {slideIndex + 1} / {slides.length}
                    </span>
                )}
            </div>
            )}

            {/* Content Area with fluid aspect ratio */}
            <div className="relative w-full flex-1 flex flex-col bg-slate-900">
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
                            src={videoUrl}
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

                {/* FILE (PDFs / PPTs / Docs / Resources) */}
                {type === "FILE" && (
                    isPdf(fileUrl) ? (
                        <iframe
                            src={fileUrl}
                            className="h-[320px] sm:h-[420px] md:h-[520px] w-full border-none bg-slate-800"
                            title={content.title}
                        />
                    ) : isOfficeDoc(fileUrl) ? (
                        <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                            className="h-[320px] sm:h-[420px] md:h-[520px] w-full border-none bg-slate-800"
                            title={content.title}
                        />
                    ) : (
                        <div className="flex h-[320px] sm:h-[420px] md:h-[520px] flex-col items-center justify-center gap-4 p-6 text-center">
                            <FileText className="h-16 w-16 text-orange-500 animate-bounce" />
                            <h3 className="text-lg font-semibold text-white">Download Resource</h3>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl bg-orange-600 px-5 py-2.5 min-h-[44px] flex items-center justify-center font-bold text-xs uppercase tracking-wider text-white transition hover:bg-orange-700 shadow-lg"
                            >
                                Open File
                            </a>
                        </div>
                    )
                )}

                {/* HTML */}
                {type === "HTML" && (
                    isSlideShow ? (
                        <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 min-h-[320px]">
                            <div 
                                className="prose prose-invert max-w-none text-white text-base sm:text-lg leading-relaxed flex-1 flex flex-col justify-center select-text"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(slides[slideIndex] || "") }}
                            />
                            
                            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
                                    disabled={slideIndex === 0}
                                    className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-slate-700 transition"
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
                                                i === slideIndex ? "bg-orange-500 w-6" : "bg-slate-700 w-2.5"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                                    disabled={slideIndex === slides.length - 1}
                                    className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-slate-700 transition"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="prose prose-invert max-w-none p-4 sm:p-8 text-slate-200 text-xs sm:text-sm leading-relaxed font-sans select-text"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent || "") }}
                        />
                    )
                )}

                {/* EXTERNAL LINK */}
                {(type === "EXTERNAL" || type === "LINK") && (
                    isGoogleSlidesUrl(externalUrl) ? (
                        <iframe
                            src={getGoogleSlidesEmbedUrl(externalUrl)}
                            className="h-[320px] sm:h-[420px] md:h-[520px] w-full border-none"
                            allowFullScreen
                            title={content.title}
                        />
                    ) : (
                        <div className="flex h-[320px] sm:h-[420px] md:h-[520px] flex-col items-center justify-center gap-4 p-6 text-center">
                            <ExternalLink className="h-16 w-16 text-orange-500 animate-pulse" />
                            <h3 className="text-lg font-semibold text-white">External Resource</h3>
                            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                                This content is hosted externally. Click below to open it in a new tab.
                            </p>
                            <a
                                href={externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl bg-orange-600 px-5 py-2.5 min-h-[44px] flex items-center justify-center font-bold text-xs uppercase tracking-wider text-white transition hover:bg-orange-700 shadow-lg"
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