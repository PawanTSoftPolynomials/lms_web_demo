"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getLessonTranscript } from "@/services/transcript.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

// Fetches a lesson's transcript from the backend (GET
// /lessons/:lessonId/transcript). The backend already knows whether the
// lesson has video content and whether a transcript could be retrieved, so
// this hook only has to translate its response/error shape into a simple
// { segments, status } view for the UI.
export default function useTranscript(lessonId) {
  const enabled = Boolean(lessonId);

  const query = useQuery({
    queryKey: [QUERY_KEYS.TRANSCRIPT, lessonId],
    queryFn: () => getLessonTranscript(lessonId),
    enabled,
    ...defaultQueryOptions,
  });

  return useMemo(() => {
    if (!enabled) {
      return { segments: [], status: "unavailable" };
    }

    if (query.isLoading) {
      return { segments: [], status: "loading" };
    }

    if (query.isError) {
      // 404 means "no video / no transcript for this lesson"; 400 means the
      // lesson's video isn't a YouTube link (e.g. a directly uploaded file) or
      // its content type otherwise doesn't support transcripts. Both are
      // normal, expected empty states — not a genuine failure (network error,
      // 5xx, etc) — so both render the same "unavailable" UI instead of an
      // error banner.
      const statusCode = query.error?.response?.status;
      return {
        segments: [],
        status: statusCode === 404 || statusCode === 400 ? "unavailable" : "error",
      };
    }

    const segments = query.data?.segments || [];

    return {
      segments,
      status: segments.length ? "ready" : "unavailable",
    };
  }, [enabled, query.data, query.isLoading, query.isError, query.error]);
}
