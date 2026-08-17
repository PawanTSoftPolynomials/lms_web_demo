"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// /student/batches/[batchId] has no content of its own — it always lands on
// the Overview tab, matching the folder-per-section structure below it.
export default function BatchWorkspaceIndexPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    router.replace(`/student/batches/${params.batchId}/overview`);
  }, [router, params.batchId]);

  return null;
}
