"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Play, 
  Pause,
  Volume2, 
  VolumeX,
  Settings, 
  Maximize2, 
  Download, 
  UploadCloud, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Video, 
  MoreVertical,
  Clock
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

export default function ContentDetailsPage() {
  const params = useParams();
  const contentId = params.contentId;
  const router = useRouter();

  // Video player logic
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "objectives", label: "Learning Objectives" },
    { id: "attachments", label: "Attachments (2)" },
  ];

  const [activeTab, setActiveTab] = useState("description");

  // Queries
  const { data: content, isLoading, isError } = useContent(contentId);
  const { data: lesson } = useLesson(content?.lessonId, { enabled: !!content?.lessonId });
  const { data: moduleData } = useModule(lesson?.moduleId, { enabled: !!lesson?.moduleId });
  
  const lessonId = params.lessonId || content?.lessonId;
  const moduleId = params.moduleId || lesson?.moduleId;
  const courseId = params.courseId || moduleData?.courseId;

  const { data: course } = useInstructorCourse(courseId, { enabled: !!courseId });
  const { data: contents = [] } = useContents(lessonId, { enabled: !!lessonId });
  const deleteContentMutation = useDeleteContent();

  // Find previous and next content in list
  const currentIndex = contents.findIndex(c => c.id === contentId);
  const prevContent = currentIndex > 0 ? contents[currentIndex - 1] : null;
  const nextContent = currentIndex < contents.length - 1 ? contents[currentIndex + 1] : null;

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${content?.title}"?`);
    if (!confirmed) return;

    try {
      await deleteContentMutation.mutateAsync({
        contentId,
        lessonId: content.lessonId,
      });

      router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(err => console.log("Play interrupted:", err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setVideoDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !videoDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * videoDuration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatVideoTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (isError || !content) {
    return (
      <Card>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold">Content Not Found</h2>
          <p className="mt-2 text-slate-400">Unable to load this content.</p>
        </div>
      </Card>
    );
  }

  const isVideo = content.type === "VIDEO" || content.type === "Video";
  const durationStr = content.duration ? `${Math.floor(content.duration / 60)}:${(content.duration % 60).toString().padStart(2, '0')}` : "24:30";

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
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : null;
  };

  const isYouTube = content.videoUrl && (content.videoUrl.includes("youtube.com") || content.videoUrl.includes("youtu.be"));
  const ytEmbedUrl = isYouTube ? getYouTubeEmbedUrl(content.videoUrl) : null;

  const videoSrc = content.videoUrl
    ? content.videoUrl.startsWith("http")
      ? content.videoUrl
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${content.videoUrl}`
    : "https://www.w3schools.com/html/mov_bbb.mp4"; // standard Big Buck Bunny video as fallback for mock content

  return (
    <div className="space-y-6 pb-12 animate-fade-in duration-300">
      
      {/* 1. Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-orange-500 transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">Content Preview</h1>
              <p className="text-xs text-slate-400 mt-1.5">Review content details and preview before publishing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:border-orange-500 transition"
            >
              Back to Lesson
            </button>
            <button 
              onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/edit/${content.id}`)}
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-orange-700 transition"
            >
              <Pencil size={13} />
              Edit Content
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

      {/* 2. Main content Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: Video & Tabs (2/3 size) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Video Preview Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Video size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-white leading-tight">{content.title}</h2>
                  <span className="rounded-xl bg-blue-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-400 border border-blue-500/20">
                    {content.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {content.description || "This video explains the basics and how they work in the application context."}
                </p>
              </div>
            </div>

            {/* Video Player or Document Preview Box */}
            {isVideo ? (
              isYouTube ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 flex flex-col justify-between group shadow-lg">
                  <iframe
                    src={ytEmbedUrl}
                    title={content.title || "YouTube video player"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-2xl"
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex flex-col justify-between group">
                  
                  {/* HTML5 video element */}
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={togglePlay}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  />

                  {/* Center Play Button Graphic (only when paused) */}
                  {!isPlaying && (
                    <div 
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/20 cursor-pointer z-20 transition-all duration-300 animate-in fade-in"
                    >
                      <div className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-slate-950 shadow-lg scale-100 hover:scale-110 active:scale-95 transition duration-300">
                        <Play size={26} className="fill-slate-950 translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Overlay Text label */}
                  {!isPlaying && (
                    <div className="absolute top-4 right-4 bg-slate-950/80 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider text-white border border-slate-800 z-20">
                      {content.title || "Introduction to Servlets"}
                    </div>
                  )}

                  {/* Bottom controls */}
                  <div className="w-full space-y-3 mt-auto p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Progress bar */}
                    <div 
                      onClick={handleSeek}
                      className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
                    >
                      <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{ width: `${(currentTime / (videoDuration || 1)) * 100}%` }}
                      />
                    </div>

                    {/* Buttons controls */}
                    <div className="flex items-center justify-between text-slate-300 text-xs">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={togglePlay}
                          className="hover:text-white transition"
                        >
                          {isPlaying ? <Pause size={14} className="fill-slate-300" /> : <Play size={14} className="fill-slate-300" />}
                        </button>
                        <button 
                          onClick={toggleMute}
                          className="hover:text-white transition flex items-center gap-1.5"
                        >
                          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                        <span className="font-medium text-slate-400">
                          {formatVideoTime(currentTime)} / {formatVideoTime(videoDuration || content.duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 font-semibold">
                        <button 
                          onClick={() => {
                            if (videoRef.current) {
                              if (videoRef.current.playbackRate === 1) videoRef.current.playbackRate = 1.5;
                              else if (videoRef.current.playbackRate === 1.5) videoRef.current.playbackRate = 2;
                              else videoRef.current.playbackRate = 1;
                            }
                          }}
                          className="text-[10px] tracking-widest hover:text-white transition bg-slate-800/80 px-1.5 py-0.5 rounded"
                        >
                          {videoRef.current?.playbackRate || 1}x
                        </button>
                        <button 
                          onClick={() => videoRef.current?.requestFullscreen()}
                          className="hover:text-white transition"
                        >
                          <Maximize2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-4 animate-pulse">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">{content.title}</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
                  This document resource is ready. Instructors can download the attachment below or modify the file details.
                </p>
                <a
                  href={content.fileUrl || "#"}
                  download
                  onClick={(e) => {
                    if (!content.fileUrl) {
                      e.preventDefault();
                      alert("No attached file URL found for this content template.");
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs px-5 py-3 transition shadow-lg shadow-orange-500/10 active:scale-95 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Document</span>
                </a>
              </div>
            )}
          </div>

          {/* Description & Objectives Tabs Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3.5 text-sm font-bold tracking-wide uppercase transition cursor-pointer relative ${
                    activeTab === tab.id ? "text-orange-500" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="pt-6">
              {activeTab === "description" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left part: text & topics */}
                  <div className="md:col-span-2 space-y-6">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {content.description || "This video introduces the key concepts of the technology. You will learn what it is, how it works, and how it handles client requests and generates dynamic responses."}
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

                  {/* Right part: Resources list */}
                  <div className="rounded-xl border border-slate-800/80 bg-slate-955 p-4 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Resources</h4>
                    <div className="space-y-3">
                      {[
                        { title: "Servlets Cheat Sheet", info: "PDF • 245 KB", iconColor: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                        { title: "Servlet Lifecycle Diagram", info: "PNG • 128 KB", iconColor: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
                      ].map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-850 bg-slate-900/60 hover:border-orange-500/30 transition">
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
                    By the end of this content session, instructors and students should be able to:
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Explain configuration directives and settings options.",
                      "Demonstrate dynamic lifecycle hook integrations.",
                      "Evaluate performance tuning strategies."
                    ].map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                        <span className="h-5 w-5 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0 border border-orange-500/20">
                          {idx + 1}
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="text-center py-10 space-y-3">
                  <UploadCloud className="mx-auto text-slate-600" size={32} />
                  <p className="text-slate-400 text-sm">No additional attachments linked to this content preview.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Pagination Button Row */}
          <div className="flex justify-between items-center pt-2">
            <button
              disabled={!prevContent}
              onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${prevContent.id}`)}
              className={`flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:border-orange-500 transition ${
                !prevContent && "opacity-40 cursor-not-allowed hover:border-slate-700 text-slate-500"
              }`}
            >
              <ChevronLeft size={14} />
              Previous Content
            </button>

            <button
              disabled={!nextContent}
              onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${nextContent.id}`)}
              className={`flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-orange-700 transition ${
                !nextContent && "opacity-40 cursor-not-allowed bg-orange-600/40 hover:bg-orange-600/40 text-slate-400"
              }`}
            >
              Next Content
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Column: Metadata & Actions Sidebar (1/3 size) */}
        <div className="space-y-6">
          
          {/* Card 1: Content Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3 mb-4">Content Information</h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Content Type</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Video size={13} className="text-purple-400" />
                  {content.type}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Duration</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock size={13} className="text-orange-400" />
                  {durationStr}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Module</span>
                <span className="font-semibold text-orange-400 hover:underline cursor-pointer truncate max-w-[150px] text-right"
                      onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}`)}>
                  {moduleData?.title || "Module details"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Lesson</span>
                <span className="font-semibold text-orange-400 hover:underline cursor-pointer truncate max-w-[150px] text-right"
                      onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)}>
                  {lesson?.title || "Lesson details"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Status</span>
                <span className={`rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                  content.isPublished
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {content.isPublished ? "Published" : "Draft"}
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
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Created By</span>
                <span className="font-semibold text-slate-200">Prasad Kulkarni</span>
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
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 hover:border-orange-500/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition"
            >
              <UploadCloud size={13} />
              Replace Video
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
            
            {/* Previous */}
            <div 
              onClick={() => prevContent && router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${prevContent.id}`)}
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

            {/* Next */}
            <div 
              onClick={() => nextContent && router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${nextContent.id}`)}
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