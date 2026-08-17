import { useMutation } from "@tanstack/react-query";
import { streamAdaptiveResponse } from "@/services/adaptiveLearning.service";

export default function useAdaptiveResponseStream() {
    return useMutation({
        mutationFn: ({ data, onChunk, signal }) =>
            streamAdaptiveResponse({ data, onChunk, signal }),
    });
}
