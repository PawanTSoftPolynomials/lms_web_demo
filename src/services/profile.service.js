import api from "@/lib/axios";

/**
 * Get Current User Profile
 */
export const getProfile = async () => {
  const { data } = await api.get("/users/profile/me");
  return data.data;
};

/**
 * Update Current User Profile (name, phone, address, education, etc.)
 */
export const updateProfile = async (payload) => {
  const { data } = await api.put("/users/profile/me", payload);
  return data.data;
};

/**
 * Upload User Profile Avatar Photo
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.post("/users/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data;
};

/**
 * Remove User Profile Avatar Photo
 */
export const removeAvatar = async () => {
  const { data } = await api.delete("/users/profile/avatar");
  return data.data;
};