import { useMutation } from "@tanstack/react-query";
import { generateVerificationQuestion } from "@/services/adaptiveLearning.service";

export default function useGenerateVerificationQuestion() {
    return useMutation({
        mutationFn: (data) => generateVerificationQuestion(data),
    });
}
