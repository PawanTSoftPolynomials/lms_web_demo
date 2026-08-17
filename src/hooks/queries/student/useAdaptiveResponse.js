import { useMutation } from "@tanstack/react-query";
import { respondToStudent } from "@/services/adaptiveLearning.service";

export default function useAdaptiveResponse() {
    return useMutation({
        mutationFn: (data) => respondToStudent(data),
    });
}
