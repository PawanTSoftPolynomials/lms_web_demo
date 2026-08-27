import { useQuery } from "@tanstack/react-query";

import { getCalendarEvents } from "@/services/calendar.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useStudentCalendar() {
  return useQuery({
    queryKey: [QUERY_KEYS.CALENDAR],
    queryFn: getCalendarEvents,
    staleTime: 1000 * 60 * 5,
  });
}
