import { useMutation } from "@tanstack/react-query";
import { getPedagogicalDecision } from "@/services/adaptiveLearning.service";

export default function usePedagogicalDecision() {
    return useMutation({
        mutationFn: (data) => getPedagogicalDecision(data),
    });
}
