import { useMutation } from "@tanstack/react-query";
import { evaluateVerificationAnswer } from "@/services/adaptiveLearning.service";

export default function useEvaluateVerificationAnswer() {
    return useMutation({
        mutationFn: (data) => evaluateVerificationAnswer(data),
    });
}
