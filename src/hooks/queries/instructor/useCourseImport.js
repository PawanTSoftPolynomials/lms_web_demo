import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * Watches a single import job so the UI can follow the real CourseImportJob
 * status while a long-running request is still in flight. The backend writes
 * EXTRACTING / ANALYZING / MAPPING part-way through POST /jobs/:id/process,
 * and that single response only ever returns the terminal state — polling the
 * existing job endpoint is what makes the intermediate stages observable.
 */
export const useCourseImportJobStatus = (jobId, enabled = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE_IMPORT_JOB, jobId],
    queryFn: async () => {
      const response = await api.get(`/course-import/jobs/${jobId}`);
      return response.data?.data;
    },
    enabled: Boolean(jobId) && enabled,
    refetchInterval: enabled ? 700 : false,
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });
};

/**
 * Uploads a ZIP course package.
 */
export const useUploadZipPackage = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("package", file);
      const response = await api.post("/course-import/jobs", formData, {
        headers: { "Content-Type": undefined },
      });
      return response.data?.data;
    },
  });
};

/**
 * Processes an extracted ZIP course import job.
 */
export const useProcessZipJob = () => {
  return useMutation({
    mutationFn: async (jobId) => {
      const response = await api.post(`/course-import/jobs/${jobId}/process`);
      return response.data?.data;
    },
  });
};

/**
 * Submits and validates direct JSON content or a .json file for course import.
 */
export const useProcessJsonCourse = () => {
  return useMutation({
    mutationFn: async ({ jsonContent, file }) => {
      if (file) {
        const formData = new FormData();
        formData.append("package", file);
        const response = await api.post("/course-import/json", formData, {
          headers: { "Content-Type": undefined },
        });
        return response.data?.data;
      } else {
        const response = await api.post("/course-import/json", {
          canonicalJson: jsonContent,
        });
        return response.data?.data;
      }
    },
  });
};

/**
 * Triggers course ingestion into database from a ready import job.
 */
export const useImportCourseJob = () => {
  return useMutation({
    mutationFn: async (jobId) => {
      const response = await api.post(`/course-import/jobs/${jobId}/import`);
      return response.data?.data;
    },
  });
};

/**
 * Fetches canonical JSON v2 template structure.
 */
export const useCourseJsonTemplate = () => {
  return useQuery({
    queryKey: ["courseJsonTemplate"],
    queryFn: async () => {
      const response = await api.get("/course-import/template");
      return response.data?.data;
    },
    enabled: false, // Manual refetch / trigger only
  });
};
