"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Play, 
  Volume2, 
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

            {/* Video Player Box */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex flex-col justify-between p-4 group">
              {/* Center Play Button Graphic */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-white border border-slate-200 shrink-0 flex items-center justify-center p-1.5 shadow-md opacity-90 group-hover:scale-105 transition duration-300">
                  <img
                    src="https://miro.medium.com/v2/resize:fit:800/1*98hG5s4K5yZJ0FhD2b5Ptw.png"
                    alt="Java Logo"
                    className="h-full w-full object-contain filter grayscale-[30%]"
                  />
                </div>
                <div className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg opacity-90 group-hover:scale-110 transition duration-300">
                  <Play size={24} className="fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Mock Overlay Text label */}
              <div className="self-end bg-slate-950/80 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider text-white border border-slate-800">
                Introduction to Servlets
              </div>

              {/* Bottom controls */}
              <div className="w-full space-y-3 mt-auto z-10">
                {/* Progress bar */}
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer relative">
                  <div className="h-full w-1/4 bg-orange-600 rounded-full" />
                </div>

                {/* Buttons controls */}
                <div className="flex items-center justify-between text-slate-300 text-xs">
                  <div className="flex items-center gap-4">
                    <button className="hover:text-white transition"><Play size={14} className="fill-slate-300" /></button>
                    <button className="hover:text-white transition flex items-center gap-1.5">
                      <Volume2 size={14} />
                      <span className="text-[10px] text-slate-500">10s</span>
                    </button>
                    <span>02:15 / {durationStr}</span>
                  </div>

                  <div className="flex items-center gap-4 font-semibold">
                    <span className="text-[10px] tracking-widest">1x</span>
                    <span className="rounded-md border border-slate-700 px-1 py-0.5 text-[8px] font-black uppercase text-slate-400">CC</span>
                    <button className="hover:text-white transition"><Settings size={14} /></button>
                    <button className="hover:text-white transition"><Maximize2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
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