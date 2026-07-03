import {useQuery} from "@tanstack/react-query";

import {getStudentDashboard} from "@/services/student.service";
import {QUERY_KEYS} from "@/constants/queryKeys";
import {defaultQueryOptions} from "@/lib/queryOptions";

export default function useDashboard() {
    return useQuery({
        queryKey: [QUERY_KEYS.STUDENT_DASHBOARD],
        queryFn: getStudentDashboard,
        ...defaultQueryOptions,
    });
}