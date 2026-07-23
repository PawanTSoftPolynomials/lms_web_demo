'use client';

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  Video,
  Link as LinkIcon,
  FileCode,
  Presentation,
  Clock,
  BookOpen,
  Layers,
  CalendarDays,
  ExternalLink,
} from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import ActionMenu from "@/components/menus/ActionMenu";

import { useContent } from "@/hooks/queries/instructor/useContent";
import { useDeleteContent } from "@/hooks/queries/instructor/useDeleteContent";
import { useLesson } from "@/hooks/queries/instructor/useLesson";
import { useModule } from "@/hooks/queries/instructor/useModule";
import { useContents } from "@/hooks/queries/instructor/useContents";
import { useInstructorCourse } from "@/hooks/queries/instructor/useInstructorCourse";
import LessonStickySidebar from "@/components/instructor/lessons/LessonStickySidebar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = null;
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
  } else if (url.includes("youtube.com")) {
    if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split(/[&#]/)[0];
    } else if (url.includes("/embed/")) {
      videoId = url.split("/embed/")[1]?.split(/[?#]/)[0];
    }
  }
  return videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`
    : null;
};

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const TYPE_META = {
  VIDEO:        { icon: Video,        color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",  label: "Video" },
  DOCUMENT:     { icon: FileText,     color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",      label: "Document" },
  PRESENTATION: { icon: Presentation, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20",  label: "Presentation" },
  LINK:         { icon: LinkIcon,     color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20",label: "External Link" },
  TEXT:         { icon: FileCode,     color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20",      label: "Text / HTML" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentDetailsPage() {
  const params   = useParams();
  const contentId = params.contentId;
  const router   = useRouter();

  // Video state
  const videoRef = useRef(null);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [videoDuration,setVideoDuration]= useState(0);
  const [isMuted,      setIsMuted]      = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "objectives",  label: "Learning Objectives" },
    { id: "attachments", label: "Attachments" },
  ];
  const [activeTab, setActiveTab] = useState("description");

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: content, isLoading, isError } = useContent(contentId);
  const { data: lesson }      = useLesson(content?.lessonId, { enabled: !!content?.lessonId });
  const { data: moduleData }  = useModule(lesson?.moduleId,  { enabled: !!lesson?.moduleId  });

  const lessonId = params.lessonId || content?.lessonId;
  const moduleId = params.moduleId || lesson?.moduleId;
  const courseId = params.courseId || moduleData?.courseId;

  const { data: course }       = useInstructorCourse(courseId, { enabled: !!courseId });
  const { data: contents = [] }= useContents(lessonId, { enabled: !!lessonId });
  const deleteContentMutation  = useDeleteContent();

  const currentIndex = contents.findIndex((c) => c.id === contentId);
  const prevContent  = currentIndex > 0 ? contents[currentIndex - 1] : null;
  const nextContent  = currentIndex < contents.length - 1 ? contents[currentIndex + 1] : null;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${content?.title}"?`)) return;
    try {
      await deleteContentMutation.mutateAsync({ contentId, lessonId: content.lessonId });
      router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else { videoRef.current.play().catch(console.log); setIsPlaying(true); }
  };

  const handleSeekToSeconds = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !videoDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoDuration;
    setCurrentTime(pct * videoDuration);
  };

  const cyclePlayback = () => {
    if (!videoRef.current) return;
    const next = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    videoRef.current.playbackRate = next;
    setPlaybackRate(next);
  };

  const navTo = (c) => {
    if (!c) return;
    router.push(
      `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${c.id}`
    );
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoading) return <div className="flex justify-center py-20"><Loader /></div>;

  if (isError || !content)
    return (
      <Card>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold text-white">Content Not Found</h2>
          <p className="mt-2 text-slate-400">Unable to load this content.</p>
        </div>
      </Card>
    );

  // ── Derived ─────────────────────────────────────────────────────────────────
  const type      = (content.type || "VIDEO").toUpperCase();
  const typeMeta  = TYPE_META[type] || TYPE_META.VIDEO;
  const TypeIcon  = typeMeta.icon;

  const isVideo        = type === "VIDEO";
  const isDocument     = type === "DOCUMENT";
  const isPresentation = type === "PRESENTATION";
  const isLink         = type === "LINK";
  const isText         = type === "TEXT";

  const isYouTube  = isVideo && content.videoUrl &&
    (content.videoUrl.includes("youtube.com") || content.videoUrl.includes("youtu.be"));
  const ytEmbedUrl = isYouTube ? getYouTubeEmbedUrl(content.videoUrl) : null;
  const videoSrc   = content.videoUrl?.startsWith("http")
    ? content.videoUrl
    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${content.videoUrl || ""}`;

  const isLocalFile = content.fileUrl?.includes("localhost") ||
                      content.fileUrl?.includes("127.0.0.1");

  const officeViewerUrl = content.fileUrl && !isLocalFile
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(content.fileUrl)}`
    : null;

  const googleViewerUrl = content.fileUrl && !isLocalFile
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(content.fileUrl)}&embedded=true`
    : null;

  const presentationViewerUrl = officeViewerUrl;
  const documentViewerUrl     = officeViewerUrl || googleViewerUrl;

  const durationStr = content.duration
    ? formatTime(content.duration)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12 animate-fade-in duration-300">
      
      {/* 1. Header Navigation Bar */}
      <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#05070E] border border-[#1A1F35] text-slate-300 hover:text-white hover:border-orange-500 transition cursor-pointer"
              title="Back to Lesson Details"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{content.title}</h1>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                  Lesson {currentIndex >= 0 ? currentIndex + 1 : 1} of {contents.length || 1}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {course?.title || "Course"} &bull; {moduleData?.title || "Module"} &bull; {lesson?.title || "Lesson"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button 
              onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/edit/${content.id}`)}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-black text-slate-950 transition shadow-lg shadow-orange-500/10 cursor-pointer"
            >
              <Pencil size={13} />
              <span>Edit</span>
            </button>
            <ActionMenu
              items={[
                {
                  label: "Delete Content",
                  onClick: handleDelete,
                }
              ]}
            />
          </div>
        </div>
      </div>

      {/* 2. Main Responsive Grid: Video Player + Sticky Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Large Video Player, Progress, Description (2/3 size) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Video / Media Preview Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${typeMeta.bg} ${typeMeta.color}`}>
                <TypeIcon size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-white leading-tight">{content.title}</h2>
                  <span className={`rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${typeMeta.bg} ${typeMeta.color}`}>
                    {typeMeta.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {content.description || "This content introduces the key concepts and demonstrates application usage."}
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{durationStr}</span>
            </div>

            {/* Video Player or Document/Presentation Preview Box */}
            {isVideo && (
              isYouTube ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#1A1F35] bg-black flex flex-col justify-between shadow-2xl">
                  <iframe
                    src={ytEmbedUrl}
                    title={content.title || "YouTube video player"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-xl"
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex flex-col justify-between group">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                    onLoadedMetadata={() => setVideoDuration(videoRef.current?.duration || 0)}
                    onClick={togglePlay}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  />

                  {!isPlaying && (
                    <div 
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-20 transition-all duration-300"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-slate-950 shadow-lg scale-100 hover:scale-110 active:scale-95 transition duration-300">
                        <Play size={26} className="fill-slate-950 translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {!isPlaying && (
                    <div className="absolute top-4 right-4 bg-slate-950/80 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider text-white border border-slate-800 z-20">
                      {content.title}
                    </div>
                  )}

                  <div className="w-full space-y-3 mt-auto p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div 
                      onClick={handleSeek}
                      className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
                    >
                      <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{ width: `${(currentTime / (videoDuration || 1)) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-slate-300 text-xs">
                      <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:text-white transition">
                          {isPlaying ? <Pause size={14} className="fill-slate-300" /> : <Play size={14} className="fill-slate-300" />}
                        </button>
                        <button onClick={toggleMute} className="hover:text-white transition flex items-center gap-1.5">
                          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                        <span className="font-medium text-slate-400">
                          {formatTime(currentTime)} / {formatTime(videoDuration || content.duration || 0)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 font-semibold">
                        <button onClick={cyclePlayback} className="text-[10px] tracking-widest hover:text-white transition bg-slate-800/80 px-1.5 py-0.5 rounded">
                          {playbackRate}x
                        </button>
                        <button onClick={() => videoRef.current?.requestFullscreen()} className="hover:text-white transition">
                          <Maximize2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Presentation / Document Preview */}
            {(isPresentation || isDocument) && (
              content.fileUrl ? (
                (isPresentation ? presentationViewerUrl : documentViewerUrl) ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 shadow-lg">
                    <iframe
                      src={isPresentation ? presentationViewerUrl : documentViewerUrl}
                      title={content.title}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-4 animate-pulse">
                      <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{content.title}</h3>
                    <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
                      {isPresentation ? "Presentation file attached and ready for download." : "Document resource ready."}
                    </p>
                    <a
                      href={content.fileUrl}
                      download
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs px-5 py-3 transition shadow-lg shadow-orange-500/10 active:scale-95 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download {isPresentation ? "Presentation" : "Document"}</span>
                    </a>
                  </div>
                )
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                  <FileText size={32} className="text-slate-600 mb-2" />
                  <p className="text-slate-400 text-xs">No file attached to this content.</p>
                </div>
              )
            )}

            {/* External Link */}
            {isLink && (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-6 text-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <LinkIcon size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{content.title}</h3>
                  <p className="text-xs text-slate-400 max-w-md break-all">{content.externalUrl || "No URL provided"}</p>
                </div>
                {content.externalUrl && (
                  <a
                    href={content.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-5 py-3 transition active:scale-95"
                  >
                    <ExternalLink size={14} />
                    Open External Link
                  </a>
                )}
              </div>
            )}

            {/* Text / HTML */}
            {isText && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 min-h-[240px]">
                {content.htmlContent ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content.htmlContent }}
                  />
                ) : (
                  <p className="text-slate-400 text-sm text-center py-12">No text content provided.</p>
                )}
              </div>
            )}

          </div>

          {/* Description & Objectives Tabs Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
            <div className="flex border-b border-slate-800 gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-xs font-black tracking-wide uppercase transition cursor-pointer relative ${
                    activeTab === tab.id ? "text-orange-400" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-6">
              {activeTab === "description" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {content.description || "This video introduces key concepts. You will learn what it is, how it works, and how to apply it in real-world scenarios."}
                    </p>
                    
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Key Topics Covered</h4>
                      <ul className="space-y-3">
                        {[
                          "Core Lifecycle & Initialization",
                          "Handling Client Side Inbound Request",
                          "Managing Dynamic Content Responses",
                          "Best practices for local configuration"
                        ].map((topic, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-200">
                            <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Resources</h4>
                    <div className="space-y-3">
                      {[
                        { title: "Cheat Sheet", info: "PDF • 245 KB", iconColor: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                        { title: "Lifecycle Diagram", info: "PNG • 128 KB", iconColor: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
                      ].map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-orange-500/30 transition">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${res.bg} ${res.iconColor}`}>
                              <FileText size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-200 truncate">{res.title}</p>
                              <p className="text-[9px] text-slate-500 mt-0.5">{res.info}</p>
                            </div>
                          </div>
                          <button className="text-slate-400 hover:text-white p-1 transition">
                            <Download size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "objectives" && (
                <div className="space-y-4 max-w-2xl">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    By the end of this content session, students should be able to:
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Implement configuration directives and request parameters.",
                      "Demonstrate lifecycle hook integrations in real code.",
                      "Evaluate performance tuning strategies."
                    ].map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-200">
                        <span className="h-4 w-4 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center text-[9px] font-bold mt-0.5 shrink-0 border border-orange-500/20 font-mono">
                          {i + 1}
                        </span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No extra attachment files attached to this lesson content.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation Row */}
          <div className="flex justify-between items-center pt-2">
            <button
              disabled={!prevContent}
              onClick={() => navTo(prevContent)}
              className={`flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:border-orange-500 transition ${
                !prevContent && "opacity-40 cursor-not-allowed hover:border-slate-700 text-slate-500"
              }`}
            >
              <ChevronLeft size={14} />
              Previous Content
            </button>

            <button
              disabled={!nextContent}
              onClick={() => navTo(nextContent)}
              className={`flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-orange-700 transition ${
                !nextContent && "opacity-40 cursor-not-allowed bg-orange-600/40 hover:bg-orange-600/40 text-slate-400"
              }`}
            >
              Next Content
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Column: Metadata & Sidebar (1/3 size) */}
        <div className="space-y-6">
          
          {/* Card 1: Content Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3 mb-4">Content Information</h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Content Type</span>
                <span className={`rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${typeMeta.bg} ${typeMeta.color}`}>
                  {typeMeta.label}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Duration</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock size={13} className="text-orange-400" />
                  {durationStr || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Module</span>
                <span 
                  className="font-semibold text-orange-400 hover:underline cursor-pointer truncate max-w-[150px] text-right"
                  onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}`)}
                >
                  {moduleData?.title || "Module details"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Lesson</span>
                <span 
                  className="font-semibold text-orange-400 hover:underline cursor-pointer truncate max-w-[150px] text-right"
                  onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)}
                >
                  {lesson?.title || "Lesson details"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Status</span>
                <span className="rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Published
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Created On</span>
                <span className="font-semibold text-slate-200">
                  {content.createdAt ? new Date(content.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jul 1, 2026"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Last Updated</span>
                <span className="font-semibold text-slate-200">
                  {content.updatedAt ? new Date(content.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jul 3, 2026"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Instructor Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3 mb-1">Instructor Actions</h3>
            
            <button
              onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/edit/${content.id}`)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 hover:border-orange-500/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition"
            >
              <Pencil size={13} />
              Edit Content
            </button>

            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 hover:border-red-500/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition"
            >
              <Trash2 size={13} />
              Delete Content
            </button>
          </div>

          {/* Card 3: Navigate Content */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3 mb-1">Navigate Content</h3>
            
            <div 
              onClick={() => prevContent && navTo(prevContent)}
              className={`flex items-start gap-3 p-2.5 rounded-lg border border-slate-800 hover:border-orange-500/30 transition bg-slate-900/40 ${
                prevContent ? "cursor-pointer" : "opacity-30 cursor-not-allowed hover:border-slate-800"
              }`}
            >
              <ChevronLeft size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Previous Content</p>
                <p className="text-xs font-bold text-slate-300 mt-1 truncate">{prevContent ? prevContent.title : "No previous content"}</p>
              </div>
            </div>

            <div 
              onClick={() => nextContent && navTo(nextContent)}
              className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border border-slate-800 hover:border-orange-500/30 transition bg-slate-900/40 ${
                nextContent ? "cursor-pointer" : "opacity-30 cursor-not-allowed hover:border-slate-800"
              }`}
            >
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Next Content</p>
                <p className="text-xs font-bold text-slate-300 mt-1 truncate">{nextContent ? nextContent.title : "No next content"}</p>
              </div>
              <ChevronRight size={16} className="text-slate-500 shrink-0 mt-0.5" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}