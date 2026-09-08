"use client";

import VideoPlayer from "@/components/student/learning/VideoPlayer";

// Wraps one displayed lesson-content block. A displayed block can represent
// several underlying Content rows merged together (see contentDocument.js).
export default function LessonContentBlock({ item, videoPlayerRef, ...videoPlayerProps }) {
  // VIDEO fills the full player frame height (VideoPlayer's own h-full only
  // has something to resolve against if this wrapper is h-full too) — every
  // other type stays auto-height so short content doesn't leave the same
  // leftover empty space below it that this was written to avoid for video.
  const isVideo = item?.type === "VIDEO";
  return (
    <div data-topic-anchor={item?.topicId || undefined} className={isVideo ? "h-full" : undefined}>
      <VideoPlayer ref={videoPlayerRef} content={item} {...videoPlayerProps} />
    </div>
  );
}
