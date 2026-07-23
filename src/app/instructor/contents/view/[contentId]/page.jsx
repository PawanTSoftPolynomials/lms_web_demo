'use client';

import { useState, useRef, useEffect } from "react";
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
  Maximize2, 
  Download, 
  UploadCloud, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  Video, 
  Clock,
  CheckSquare,
  Sparkles
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

export default function ContentDetailsPage() {
  const params = useParams();
  const contentId = params.contentId;
  const router = useRouter();

  // Video player state
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "objectives", label: "Learning Objectives" },
    { id: "attachments", label: "Attachments" },
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

  // Navigation Indexing
  const currentIndex = contents.findIndex(c => c.id === contentId);
  const prevContent = currentIndex > 0 ? contents[currentIndex - 1] : null;
  const nextContent = currentIndex < contents.length - 1 ? contents[currentIndex + 1] : null;

  // Keyboard Shortcuts (Space for Play/Pause, M for Mute)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted]);

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

  const handleToggleComplete = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    if (nextState && nextContent) {
      // Auto-unlock notification hint
    }
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
          <h2 className="text-2xl font-semibold text-white">Content Not Found</h2>
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
    : "https://www.w3schools.com/html/mov_bbb.mp4";

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
              onClick={handleToggleComplete}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                isCompleted
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-[#05070E] border border-[#1A1F35] text-slate-300 hover:border-orange-500/40"
              }`}
            >
              <CheckCircle2 size={15} className={isCompleted ? "fill-slate-950 text-emerald-500" : "text-slate-400"} />
              <span>{isCompleted ? "Lesson Completed" : "Mark as Completed"}</span>
            </button>

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
          
          {/* Large Video Player Card */}
          <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-4 sm:p-6 shadow-2xl space-y-4">
            
            {/* Top Video Header */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-purple-400" />
                <span className="font-extrabold text-slate-200">{content.title}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{durationStr}</span>
            </div>

            {/* Video Player Box */}
            {isVideo ? (
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
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#1A1F35] bg-gradient-to-br from-[#080B11] via-[#0D1021] to-[#12162B] flex flex-col justify-between group shadow-2xl">
                  
                  {/* HTML5 Video Element */}
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={togglePlay}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  />

                  {/* Center Play Button Overlay */}
                  {!isPlaying && (
                    <div 
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-20 transition-all duration-300"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-slate-950 shadow-2xl scale-100 hover:scale-110 active:scale-95 transition duration-300">
                        <Play size={26} className="fill-slate-950 translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Video Controls Overlay */}
                  <div className="w-full space-y-2 mt-auto p-3.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Seeking progress bar */}
                    <div 
                      onClick={handleSeek}
                      className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
                    >
                      <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{ width: `${(currentTime / (videoDuration || 1)) * 100}%` }}
                      />
                    </div>

                    {/* Controls Toolbar */}
                    <div className="flex items-center justify-between text-slate-300 text-xs">
                      <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:text-white transition cursor-pointer">
                          {isPlaying ? <Pause size={14} className="fill-slate-300" /> : <Play size={14} className="fill-slate-300" />}
                        </button>
                        <button onClick={toggleMute} className="hover:text-white transition cursor-pointer flex items-center gap-1.5">
                          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                        <span className="font-mono text-[11px] text-slate-400">
                          {formatVideoTime(currentTime)} / {formatVideoTime(videoDuration || content.duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <button 
                          onClick={() => {
                            if (videoRef.current) {
                              if (videoRef.current.playbackRate === 1) videoRef.current.playbackRate = 1.5;
                              else if (videoRef.current.playbackRate === 1.5) videoRef.current.playbackRate = 2;
                              else videoRef.current.playbackRate = 1;
                            }
                          }}
                          className="text-[10px] hover:text-white transition bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
                        >
                          {videoRef.current?.playbackRate || 1}x
                        </button>
                        <button 
                          onClick={() => videoRef.current?.requestFullscreen()}
                          className="hover:text-white transition cursor-pointer"
                        >
                          <Maximize2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#1A1F35] bg-[#05070E] flex flex-col items-center justify-center p-6 text-center">
                <FileText size={36} className="text-orange-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1.5">{content.title}</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">Document resource preview.</p>
                <a
                  href={content.fileUrl || "#"}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs px-5 py-2.5 transition shadow-lg cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download File</span>
                </a>
              </div>
            )}

            {/* Video Navigation Bar Below Player */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1A1F35]">
              <button
                disabled={!prevContent}
                onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${prevContent.id}`)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1A1F35] text-xs font-bold text-slate-300 hover:text-white hover:border-orange-500/40 transition cursor-pointer ${
                  !prevContent ? "opacity-30 cursor-not-allowed hover:border-[#1A1F35]" : ""
                }`}
              >
                <ChevronLeft size={14} />
                <span>Previous Video</span>
              </button>

              <button
                disabled={!nextContent}
                onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${nextContent.id}`)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs transition shadow-lg cursor-pointer ${
                  !nextContent ? "opacity-40 cursor-not-allowed bg-orange-500/40" : ""
                }`}
              >
                <span>Next Video</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

          {/* Description & Objectives Tabs Card */}
          <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5 shadow-xl space-y-4">
            <div className="flex border-b border-[#1A1F35] gap-6">
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

            <div className="pt-2">
              {activeTab === "description" && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <p>
                    {content.description || "This lesson introduces the key architecture principles and implementation details. Instructors can use this session to demonstrate live code execution and handle queries."}
                  </p>
                  
                  <div className="space-y-2 pt-2 border-t border-[#1A1F35]">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Key Highlights</h4>
                    <ul className="space-y-2">
                      {[
                        "Core Request Lifecycle & Thread Allocation",
                        "Handling Inbound Student Data Pipelines",
                        "Best practices for production configuration"
                      ].map((h, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-200">
                          <CheckCircle2 size={14} className="text-orange-400 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "objectives" && (
                <div className="space-y-3 text-xs text-slate-300">
                  <p>By the end of this lesson session, students will be able to:</p>
                  <ul className="space-y-2">
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

        </div>

        {/* RIGHT COLUMN: STICKY SIDEBAR WITH 4 TABS (Notes, Queries, Feedback, Reviews) */}
        <div className="lg:col-span-1">
          <LessonStickySidebar
            lessonId={lessonId}
            courseId={courseId}
            videoCurrentTime={currentTime}
            onSeekVideo={handleSeekToSeconds}
          />
        </div>

      </div>

    </div>
  );
}