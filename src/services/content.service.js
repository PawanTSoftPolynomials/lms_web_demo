import api from "@/lib/axios";

export const getContents = async (topicId) => {
  const response = await api.get(`/contents?topicId=${topicId}`);
  return response.data?.data ?? response.data ?? [];
};

/** Instructor-wide contents (no topicId = every topic across the instructor's own courses). */
export const getInstructorContents = async () => {
  const response = await api.get("/contents");
  return response.data?.data ?? response.data ?? [];
};

export const getContentById = async (contentId) => {
  const response = await api.get(`/contents/${contentId}`);
  return response.data;
};

import { uploadFileToBlob } from "./blobUpload.service";

/** Uploads a raw file (PDF/PPT/DOCX/ZIP/Video/Image) directly to Vercel Blob and returns { url, fileUrl, originalName, size }. */
export const uploadFileToVercelBlob = async (file, options = {}) => {
  return await uploadFileToBlob(file, options);
};

/** Uploads a content file directly to Vercel Blob and returns its hosted URL and file metadata. */
export const uploadContentFile = async (file, options = {}) => {
  const result = await uploadFileToBlob(file, options);
  return {
    success: true,
    fileUrl: result.url,
    originalName: result.originalName,
    size: result.size,
    ...result,
  };
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

export const reorderContents = async (contents) => {
  const response = await api.patch("/contents/reorder", { contents });
  return response.data;
};