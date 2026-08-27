import api from "@/lib/axios";

// AI generation can take substantially longer than the app's default axios
// timeout (large course/module drafts), hence the extended per-call timeout.
export const generateAiContent = async (payload) => {
    const response = await api.post("/api/ai/generate", payload, {
        timeout: 240000,
    });
    return response.data;
};
