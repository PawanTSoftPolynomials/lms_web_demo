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