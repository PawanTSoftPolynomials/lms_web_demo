"use client";

import { useRef } from "react";
import VideoPlayer from "@/components/student/learning/VideoPlayer";

// Wraps one displayed lesson-content block. A displayed block can represent
// several underlying Content rows merged together (see contentDocument.js).
export default function LessonContentBlock({ item, videoPlayerRef, ...videoPlayerProps }) {
  const blockRef = useRef(null);

  return (
    <div ref={blockRef} data-topic-anchor={item?.topicId || undefined}>
      <VideoPlayer ref={videoPlayerRef} content={item} {...videoPlayerProps} />
    </div>
  );
}
