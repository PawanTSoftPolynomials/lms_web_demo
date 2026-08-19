import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  uploadCoursePackage,
  processCourseImportJob,
  getCourseImportJob,
  listCourseImportJobs,
  updateCourseImportJob,
  importCourseImportJob,
  deleteCourseImportJob,
} from "@/services/courseImport.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCourseImportJob(jobId) {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE_IMPORT_JOB, jobId],
    queryFn: () => getCourseImportJob(jobId),
    enabled: !!jobId,
  });
}

export function useCourseImportJobs() {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE_IMPORT_JOBS],
    queryFn: listCourseImportJobs,
  });
}

export function useUploadCoursePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadCoursePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_IMPORT_JOBS] });
    },
  });
}

export function useProcessCourseImportJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: processCourseImportJob,
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_IMPORT_JOB, job.id] });
    },
  });
}

export function useUpdateCourseImportJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, canonicalJson }) => updateCourseImportJob(jobId, canonicalJson),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_IMPORT_JOB, job.id] });
    },
  });
}

export function useImportCourseImportJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importCourseImportJob,
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_IMPORT_JOB, job.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
    },
  });
}

export function useDeleteCourseImportJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCourseImportJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_IMPORT_JOBS] });
    },
  });
}
