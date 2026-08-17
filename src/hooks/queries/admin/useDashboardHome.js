import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { defaultQueryOptions } from "@/lib/queryOptions";
import { getCertificates } from "@/services/certificate.service";
import { getCalendarEvents } from "@/services/calendar.service";
import {
  deriveCourseStatusPie,
  deriveRecentActivity,
  deriveUpcomingEvents,
} from "@/services/admin/dashboardHome.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useEnrollments } from "./useEnrollments";

export function useCourseStatusPie(publishedCourses, draftCourses) {
  return useMemo(
    () => deriveCourseStatusPie(publishedCourses, draftCourses),
    [publishedCourses, draftCourses]
  );
}

const useRawCertificates = () =>
  useQuery({
    queryKey: ["admin-home", "raw", "certificates"],
    queryFn: getCertificates,
    ...defaultQueryOptions,
  });

export function useRecentActivity() {
  const enrollments = useEnrollments();
  const certificates = useRawCertificates();
  const isLoading = enrollments.isLoading || certificates.isLoading;
  const data = useMemo(
    () => deriveRecentActivity(enrollments.data, certificates.data),
    [enrollments.data, certificates.data]
  );
  return { data, isLoading };
}

export function useUpcomingEvents() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_CALENDAR_EVENTS],
    queryFn: getCalendarEvents,
    ...defaultQueryOptions,
  });
  const data = useMemo(() => deriveUpcomingEvents(query.data), [query.data]);
  return { data, isLoading: query.isLoading };
}
