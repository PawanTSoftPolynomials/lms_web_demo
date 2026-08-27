"use client";

import { useEffect, useRef } from "react";
import VideoPlayer from "@/components/student/learning/VideoPlayer";

// Wraps one displayed lesson-content block. VIDEO content reports "visited"
// through its own onEnded callback (passed in via videoPlayerProps); every
// other content type has no natural completion event, so it's considered
// visited once it's been scrolled into view for a couple of seconds. A
// displayed block can represent several underlying Content rows merged
// together (see contentDocument.js), so onVisited always receives the full
// contentIds list, not a single id.
export default function LessonContentBlock({ item, onVisited, videoPlayerRef, ...videoPlayerProps }) {
  const blockRef = useRef(null);

  useEffect(() => {
    if (!item || item.type === "VIDEO") return undefined;
    const contentIds = item.contentIds || [];
    if (contentIds.length === 0 || typeof IntersectionObserver === "undefined") return undefined;

    const el = blockRef.current;
    if (!el) return undefined;

    let dwellTimer = null;
    let fired = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dwellTimer = setTimeout(() => {
            if (!fired) {
              fired = true;
              onVisited(contentIds);
            }
          }, 2000);
        } else if (dwellTimer) {
          clearTimeout(dwellTimer);
          dwellTimer = null;
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (dwellTimer) clearTimeout(dwellTimer);
    };
  }, [item, onVisited]);

  return (
    <div ref={blockRef} data-topic-anchor={item?.topicId || undefined}>
      <VideoPlayer ref={videoPlayerRef} content={item} {...videoPlayerProps} />
    </div>
  );
}
