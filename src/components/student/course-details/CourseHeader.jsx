"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Clock, BookOpen } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import useEnrollCourse from "@/hooks/queries/student/useEnrollCourse";
import { getDisplayUrl } from "@/lib/blob";

import useRazorpayCheckout from "@/hooks/useRazorpayCheckout";

// Reusable fallback for course thumbnails: next/image requires a non-empty
// `src`, and courses aren't guaranteed to have a thumbnailUrl set.
function CourseThumbnail({ thumbnailUrl, title, className = "" }) {
    if (!thumbnailUrl) {
        return (
            <div className={`flex h-full w-full items-center justify-center bg-slate-900 ${className}`}>
                <BookOpen className="h-8 w-8 text-slate-700" />
            </div>
        );
    }

    return (
        <Image
            src={getDisplayUrl(thumbnailUrl)}
            alt={title}
            fill
            unoptimized
            className={`object-cover ${className}`}
        />
    );
}

function formatDuration(hours) {
    if (!hours || hours <= 0) return "Self-paced";

    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

export default function CourseHeader({
                                         course,
                                     }) {
    const router = useRouter();
    const { data: myEnrollments = [] } = useMyCourses();
    const enrollMutation = useEnrollCourse();
    const { startCheckout, isProcessing, getButtonLabel, errorMsg } = useRazorpayCheckout();
    const [descExpanded, setDescExpanded] = useState(false);

    if (!course) return null;

    const isEnrolled = Array.isArray(myEnrollments) && myEnrollments.some(
        (e) => e.courseId === course.id || e.course?.id === course.id
    );

    const handleEnroll = async () => {
        const store = course.store;
        const effectivePrice = store
            ? (store.discountPrice !== null && store.discountPrice !== undefined && store.discountPrice > 0
                ? store.discountPrice
                : (store.price || 0))
            : 0;

        if (effectivePrice <= 0) {
            try {
                await enrollMutation.mutateAsync(course.id);
                router.push(`/student/learn/${course.id}`);
            } catch (err) {
                console.error("Free enrollment failed:", err);
            }
        } else {
            await startCheckout({
                courseId: course.id,
                courseTitle: course.title,
                returnPath: `/student/courses/${course.id}`,
                onSuccess: () => {
                    router.push(`/student/learn/${course.id}`);
                },
            });
        }
    };

    const avgRating = course.stats?.avgRating || 0;
    const reviewCount = course._count?.reviews || 0;
    const canExpandDescription = (course.description?.length || 0) > 140;

    const badges = (
        <div className="flex flex-wrap items-center gap-3">
            {course.category && (
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                    {course.category}
                </span>
            )}

            {course.level && (
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                    {course.level}
                </span>
            )}
        </div>
    );

    const titleBlock = (
        <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {course.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {avgRating > 0 ? (
                    <span className="inline-flex items-center gap-1 text-slate-300">
                        <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                        {avgRating.toFixed(1)}
                        <span className="text-slate-500">({reviewCount} reviews)</span>
                    </span>
                ) : (
                    <span className="text-slate-500">New course</span>
                )}

                <span className="inline-flex items-center gap-1 text-slate-300">
                    <Clock className="h-4 w-4 text-orange-500" />
                    {formatDuration(course.estimatedLearningHours)}
                </span>
            </div>

            <p className={`mt-3 text-sm leading-6 text-slate-400 ${descExpanded ? "" : "line-clamp-2"}`}>
                {course.description}
            </p>

            {canExpandDescription && (
                <button
                    type="button"
                    onClick={() => setDescExpanded((prev) => !prev)}
                    className="mt-1 cursor-pointer text-xs font-medium text-orange-400 hover:text-orange-300"
                >
                    {descExpanded ? "Show Less" : "Read More"}
                </button>
            )}
        </div>
    );

    const enrollButton = (
        <div className="space-y-2">
            {isEnrolled ? (
                <Button
                    onClick={() => router.push(`/student/learn/${course.id}`)}
                    className="w-full sm:w-auto px-6 py-3 font-semibold text-base text-white bg-orange-500 hover:bg-orange-600"
                >
                    Continue Learning
                </Button>
            ) : (
                <Button
                    onClick={handleEnroll}
                    loading={isProcessing}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-6 py-3 font-semibold text-base text-white bg-orange-500 hover:bg-orange-600"
                >
                    {getButtonLabel("Enroll Now")}
                </Button>
            )}
            {errorMsg && (
                <p className="text-red-400 text-xs font-semibold mt-1 animate-in fade-in duration-150">
                    {errorMsg}
                </p>
            )}
        </div>
    );

    return (
        <Card padding="p-0" className="overflow-hidden">
            {/* Compact hero (< lg): small thumbnail beside the badges instead of a
                full-width banner, so the enroll button and curriculum stay near
                the top of the first viewport on mobile/tablet. */}
            <div className="space-y-4 p-6 lg:hidden">
                <div className="flex items-start gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-800">
                        <CourseThumbnail thumbnailUrl={course.thumbnailUrl} title={course.title} />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">{badges}</div>
                </div>

                {titleBlock}

                <div>{enrollButton}</div>
            </div>

            {/* Desktop (lg+): unchanged side-by-side hero. */}
            <div className="hidden gap-6 lg:grid lg:grid-cols-3">
                <div className="relative h-full">
                    <CourseThumbnail thumbnailUrl={course.thumbnailUrl} title={course.title} />
                </div>

                <div className="space-y-4 p-6 lg:col-span-2">
                    {badges}
                    {titleBlock}
                    <div>{enrollButton}</div>
                </div>
            </div>
        </Card>
    );
}
