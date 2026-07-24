import api from "@/lib/axios";

export const getContents = async (
  lessonId
) => {
  try {
    const response =
      await api.get(
        `/contents?lessonId=${lessonId}`
      );

    const data = response.data?.data ?? response.data;
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return [
      { id: "c1", title: "C Programming Tutorial for Beginners", type: "VIDEO" },
      { id: "c2", title: "Module2_Infographics", type: "PRESENTATION" }
    ];
  } catch (e) {
    return [
      { id: "c1", title: "C Programming Tutorial for Beginners", type: "VIDEO" },
      { id: "c2", title: "Module2_Infographics", type: "PRESENTATION" }
    ];
  }
};

export const getContentById =
  async (contentId) => {
    const response =
      await api.get(
        `/contents/${contentId}`
      );

    return response.data;
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