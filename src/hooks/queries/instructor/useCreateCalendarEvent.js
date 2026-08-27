import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCalendarEvent } from "@/services/calendar.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export function useCreateCalendarEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCalendarEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR] });
        },
    });
}
