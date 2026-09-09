import { useQuery } from "@tanstack/react-query";

import { getLandingData } from "@/services/landing.service";
import { defaultQueryOptions } from "@/lib/queryOptions";

// Public landing-page data (platform stats + featured published courses).
// Shared by Hero and FeaturedCourses so both sections read from one
// deduped request instead of each firing its own getLandingData() call.
export function useLandingData() {
  return useQuery({
    queryKey: ["public", "landing-data"],
    queryFn: getLandingData,
    ...defaultQueryOptions,
  });
}
