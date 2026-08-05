import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { defaultQueryOptions } from "@/lib/queryOptions";
import { getCertificates } from "@/services/certificate.service";
import {
  deriveCourseOverview,
  deriveCourseStatusPie,
  deriveRecentActivity,
} from "@/services/admin/dashboardHome.service";
import { useCourses } from "./useCourses";
import { useEnrollments } from "./useEnrollments";

export function useCourseOverview() {
  const courses = useCourses();
  const data = useMemo(() => deriveCourseOverview(courses.data), [courses.data]);
  return { data, isLoading: courses.isLoading };
}

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
