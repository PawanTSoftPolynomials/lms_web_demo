import {useQuery} from "@tanstack/react-query";

import {getMyEnrollments} from "@/services/enrollment.service";

import {QUERY_KEYS} from "@/constants/queryKeys";
import {defaultQueryOptions} from "@/lib/queryOptions";

export default function useMyCourses() {
    return useQuery({
        queryKey: [QUERY_KEYS.MY_COURSES],
        queryFn: getMyEnrollments,
        ...defaultQueryOptions,
    });
}