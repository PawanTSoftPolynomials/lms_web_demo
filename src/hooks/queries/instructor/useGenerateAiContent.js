import { useMutation } from "@tanstack/react-query";

import { generateAiContent } from "@/services/aiGeneration.service";

export function useGenerateAiContent() {
    return useMutation({
        mutationFn: generateAiContent,
    });
}
