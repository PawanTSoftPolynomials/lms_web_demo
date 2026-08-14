import api from "@/lib/axios";

/** Uploads a .zip course package and creates a CourseImportJob (status: UPLOADED). */
export const uploadCoursePackage = async (file) => {
  const formData = new FormData();
  formData.append("package", file);

  const { data } = await api.post("/course-import/jobs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data;
};

/** Runs the scan -> extract -> classify -> analyze -> map -> validate pipeline for an uploaded job. */
export const processCourseImportJob = async (jobId) => {
  const { data } = await api.post(`/course-import/jobs/${jobId}/process`);
  return data?.data;
};

export const getCourseImportJob = async (jobId) => {
  const { data } = await api.get(`/course-import/jobs/${jobId}`);
  return data?.data;
};

export const listCourseImportJobs = async () => {
  const { data } = await api.get("/course-import/jobs");
  return data?.data ?? [];
};

/** Persists the instructor's edited preview tree back onto the job before import. */
export const updateCourseImportJob = async (jobId, canonicalJson) => {
  const { data } = await api.patch(`/course-import/jobs/${jobId}`, { canonicalJson });
  return data?.data;
};

/** Walks the job's canonicalJson and creates the real Course/Module/Lesson/Content(+Quiz/Question) rows. */
export const importCourseImportJob = async (jobId) => {
  const { data } = await api.post(`/course-import/jobs/${jobId}/import`);
  return data?.data;
};

export const deleteCourseImportJob = async (jobId) => {
  const { data } = await api.delete(`/course-import/jobs/${jobId}`);
  return data;
};
