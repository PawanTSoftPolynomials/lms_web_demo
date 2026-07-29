"use client";

import DOMPurify from "isomorphic-dompurify";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import Cookies from "js-cookie";
import {
    FileText,
    ExternalLink,
    PlayCircle,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Presentation,
} from "lucide-react";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

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

export default function VideoPlayer({
                                        content,
                                        onTimeUpdate,
                                        onEnded,
                                        initialTime = 0,
                                        lessonId = null,
                                        courseId = null,
                                    }) {
    const playerRef = useRef(null);
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
    
    // Resolve lessonId from props or content object
    const resolvedLessonId = lessonId || content?.lessonId;

    // Reset slides when content changes
    useEffect(() => {
        setSlideIndex(0);
        setHasStarted(false);
        accumulatedSecondsRef.current = 0;
        lastPingTimeRef.current = 0;
        
        return () => stopPingTimer();
    }, [content]);

    const stopPingTimer = useCallback(() => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
    }, []);

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
            <div className="flex h-[520px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-center">
                    <PlayCircle className="mx-auto mb-4 h-16 w-16 text-slate-600 animate-pulse" />
                    <h3 className="text-xl font-semibold text-white">Select a lesson</h3>
                    <p className="mt-2 text-slate-400">Choose a lesson from the sidebar to begin learning.</p>
                </div>
            </div>
        );
    }

    const slides = type === "HTML" ? parseSlides(htmlContent) : [];
    const isSlideShow = type === "HTML" && slides.length > 1;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 flex flex-col">
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

            <div className="relative min-h-[520px] flex-1 flex flex-col bg-slate-900">
                {/* VIDEO using react-player */}
                {type === "VIDEO" && videoUrl && (
                    <div className="h-[520px] w-full bg-black">
                        <ReactPlayer
                            ref={playerRef}
                            url={videoUrl}
                            width="100%"
                            height="100%"
                            controls
                            onProgress={handleProgress}
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onReady={handleReady}
                            onEnded={handleEnded}
                            config={{
                                youtube: {
                                    playerVars: { modestbranding: 1, rel: 0 }
                                }
                            }}
                        />
                    </div>
                )}

                {/* FILE (PDFs / PPTs / Docs / Resources) */}
                {type === "FILE" && (
                    isPdf(fileUrl) ? (
                        <iframe src={fileUrl} className="h-[520px] w-full border-none bg-slate-800" title={content.title} />
                    ) : isOfficeDoc(fileUrl) ? (
                        <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`} className="h-[520px] w-full border-none bg-slate-800" title={content.title} />
                    ) : (
                        <div className="flex h-[520px] flex-col items-center justify-center gap-6">
                            <FileText className="h-20 w-20 text-orange-500 animate-bounce" />
                            <h3 className="text-xl font-semibold text-white">Download Resource</h3>
                            <a href={fileUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700 shadow-lg shadow-orange-600/20">Open File</a>
                        </div>
                    )
                )}

                {/* HTML */}
                {type === "HTML" && (
                    isSlideShow ? (
                        <div className="flex-1 flex flex-col justify-between p-8 min-h-[460px]">
                            <div className="prose prose-invert max-w-none text-white text-lg leading-relaxed flex-1 flex flex-col justify-center select-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(slides[slideIndex] || "") }} />
                            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                                <button onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))} disabled={slideIndex === 0} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition"><ChevronLeft className="h-4 w-4" /> Previous</button>
                                <div className="flex gap-2">
                                    {slides.map((_, i) => (<button key={i} onClick={() => setSlideIndex(i)} className={`h-2.5 w-2.5 rounded-full transition-all ${i === slideIndex ? "bg-orange-500 w-6" : "bg-slate-700"}`} />))}
                                </div>
                                <button onClick={() => setSlideIndex(prev => Math.min(slides.length - 1, prev + 1))} disabled={slideIndex === slides.length - 1} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition">Next <ChevronRight className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none p-8 text-slate-200 leading-relaxed font-sans select-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent || "") }} />
                    )
                )}

                {/* EXTERNAL LINK */}
                {(type === "EXTERNAL" || type === "LINK") && (
                    isGoogleSlidesUrl(externalUrl) ? (
                        <iframe src={getGoogleSlidesEmbedUrl(externalUrl)} className="h-[520px] w-full border-none" allowFullScreen title={content.title} />
                    ) : (
                        <div className="flex h-[520px] flex-col items-center justify-center gap-6">
                            <ExternalLink className="h-20 w-20 text-orange-500 animate-pulse" />
                            <h3 className="text-xl font-semibold text-white">External Resource</h3>
                            <a href={externalUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700 shadow-lg shadow-orange-600/20">Visit Website</a>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}