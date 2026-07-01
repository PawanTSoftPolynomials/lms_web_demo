"use client";

import Image from "next/image";
import {
    BookOpen,
    Layers,
    GraduationCap,
    User,
    Calendar,
    FileText,
} from "lucide-react";

import Card from "@/components/ui/Card";

function InfoItem({
                      icon,
                      label,
                      value,
                  }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mt-1 text-orange-500">
                {icon}
            </div>

            <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                    {label}
                </p>

                <p className="mt-1 wrap-break-word text-white">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}

export default function CourseDetails({
                                          course,
                                      }) {
    if (!course) return null;

    const statusClasses = {
        PUBLISHED:
            "bg-green-500/20 text-green-400",
        DRAFT:
            "bg-yellow-500/20 text-yellow-400",
        ARCHIVED:
            "bg-red-500/20 text-red-400",
    };

    return (
        <Card className="space-y-8">
            {/* Thumbnail */}
            <div className="relative h-72 overflow-hidden rounded-xl border border-white/10">
                <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    unoptimized
                />
            </div>

            {/* Header */}
            <div className="space-y-4 border-b border-white/10 pb-8">
                <div className="flex flex-wrap items-center gap-3">
          <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusClasses[
                      course.status
                      ] ||
                  "bg-gray-700 text-white"
              }`}
          >
            {course.status}
          </span>

                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
            {course.level}
          </span>
                </div>

                <h1 className="text-3xl font-bold text-white">
                    {course.title}
                </h1>

                <p className="leading-7 text-gray-300">
                    {course.description}
                </p>
            </div>

            {/* Details */}
            <div className="grid gap-5 md:grid-cols-2">
                <InfoItem
                    icon={<BookOpen size={18}/>}
                    label="Category"
                    value={course.category}
                />

                <InfoItem
                    icon={
                        <GraduationCap size={18}/>
                    }
                    label="Level"
                    value={course.level}
                />

                <InfoItem
                    icon={<User size={18}/>}
                    label="Created By"
                    value={course.creator?.name}
                />

                <InfoItem
                    icon={<FileText size={18}/>}
                    label="Creator Email"
                    value={
                        course.creator?.email
                    }
                />

                <InfoItem
                    icon={<Layers size={18}/>}
                    label="Status"
                    value={course.status}
                />

                <InfoItem
                    icon={<Calendar size={18}/>}
                    label="Created On"
                    value={new Date(
                        course.createdAt
                    ).toLocaleDateString()}
                />
            </div>
        </Card>
    );
}