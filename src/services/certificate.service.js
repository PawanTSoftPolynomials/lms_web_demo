import api from "@/lib/axios";

export const getCertificates = async (
  userId,
  courseId
) => {
  let url = "/certificates";

  const params =
    new URLSearchParams();

  if (userId) {
    params.append(
      "userId",
      userId
    );
  }

  if (courseId) {
    params.append(
      "courseId",
      courseId
    );
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response =
    await api.get(url);

  return response.data.data;
};

export const getCertificateById =
  async (
    certificateId
  ) => {
    const response =
      await api.get(
        `/certificates/${certificateId}`
      );

    return response.data.data;
  };

export const deleteCertificate =
  async (
    certificateId
  ) => {
    const response =
      await api.delete(
        `/certificates/${certificateId}`
      );

    return response.data;
  };