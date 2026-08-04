import api from "@/lib/axios";

export const getContents = async (
  lessonId
) => {
  const response =
    await api.get(
      `/contents?lessonId=${lessonId}`
    );

  return response.data?.data ?? response.data ?? [];
};

/** Instructor-wide contents (no lessonId = every lesson across the instructor's own courses). */
export const getInstructorContents = async () => {
  const response = await api.get("/contents");
  return response.data?.data ?? response.data ?? [];
};

export const getContentById =
  async (contentId) => {
    const response =
      await api.get(
        `/contents/${contentId}`
      );

    return response.data;
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

export const createContent =
  async (data) => {
    const response =
      await api.post(
        "/contents",
        data
      );

    return response.data;
  };

export const updateContent =
  async (
    contentId,
    data
  ) => {
    const response =
      await api.put(
        `/contents/${contentId}`,
        data
      );

    return response.data;
  };

export const deleteContent =
  async (contentId) => {
    const response =
      await api.delete(
        `/contents/${contentId}`
      );

    return response.data;
  };