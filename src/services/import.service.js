import api from "@/lib/axios";

/**
 * Validate ZIP file and get preview data or validation errors
 * @param {File} zipFile 
 */
export const validateCourseZip = async (zipFile) => {
  const formData = new FormData();
  formData.append("file", zipFile);

  const { data } = await api.post("/courses/import/validate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/**
 * Execute transactional course import
 * @param {File} zipFile 
 * @param {Object} previewData 
 */
export const executeCourseImport = async (zipFile, previewData) => {
  const formData = new FormData();
  formData.append("file", zipFile);
  formData.append("preview", JSON.stringify(previewData));

  const { data } = await api.post("/courses/import/execute", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/**
 * Download sample ZIP template (Python-Basics.zip)
 */
export const downloadSampleTemplate = async () => {
  const response = await api.get("/courses/import/template", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Python-Basics.zip");
  document.body.appendChild(link);
  link.click();
  link.remove();
};
