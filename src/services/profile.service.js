import api from "@/lib/axios";

/**
 * Get Current User Profile
 */
export const getProfile = async () => {
    const { data } = await api.get(
        "/users/profile/me"
    );

    return data.data;
};

/**
 * Update Current User Profile (name, phone, address, education, etc.)
 */
export const updateProfile = async (payload) => {
    const { data } = await api.put("/users/profile/me", payload);
    return data.data;
};