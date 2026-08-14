import Cookies from "js-cookie";
import api from "@/lib/axios";

export const getContents = async (lessonId) => {
  const response = await api.get(`/contents?lessonId=${lessonId}`);
  return response.data?.data ?? response.data ?? [];
};

/** Instructor-wide contents (no lessonId = every lesson across the instructor's own courses). */
export const getInstructorContents = async () => {
  const response = await api.get("/contents");
  return response.data?.data ?? response.data ?? [];
};

export const getContentById = async (contentId) => {
  const response = await api.get(`/contents/${contentId}`);
  return response.data;
};

/** Uploads a raw file (PDF/PPT/DOCX/ZIP/Video/Image) to Next.js Vercel Blob API route (/api/upload) and returns { url, pathname }. */
export const uploadFileToVercelBlob = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = Cookies.get("accessToken") || (typeof window !== "undefined" ? localStorage.getItem("accessToken") : "");

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${response.status}`);
  }

  return await response.json();
};

/** Uploads a raw file (PDF/PPT/DOCX/ZIP/Video) and returns its hosted URL, for use as a Content's fileUrl. */
export const uploadContentFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/contents/upload-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

export const createContent = async (data) => {
  // Ensure order is ALWAYS sent as an integer in the HTTP request payload
  const parsedOrder = Number(data?.order);
  const safeOrder = !isNaN(parsedOrder) && parsedOrder > 0 ? parsedOrder : 1;

  const payload = {
    ...data,
    order: safeOrder,
  };

  const response = await api.post("/contents", payload);
  return response.data;
};

export const updateContent = async (contentId, data) => {
  const response = await api.put(`/contents/${contentId}`, data);
  return response.data;
};

export const deleteContent = async (contentId) => {
  const response = await api.delete(`/contents/${contentId}`);
  return response.data;
};