"use client";

import VideoPlayer from "@/components/student/learning/VideoPlayer";

// Wraps one displayed lesson-content block. A displayed block can represent
// several underlying Content rows merged together (see contentDocument.js).
export default function LessonContentBlock({ item, videoPlayerRef, ...videoPlayerProps }) {
  // Every block type fills the full player frame height (VideoPlayer's own
  // h-full only has something to resolve against if this wrapper is h-full
  // too) — a short block that only sized itself to its own content left the
  // player frame's raw background exposed below it instead of the block's
  // own card/border extending down to meet the frame edge.
  return (
    <div className="h-full">
      <VideoPlayer ref={videoPlayerRef} content={item} {...videoPlayerProps} />
    </div>
  );
}
