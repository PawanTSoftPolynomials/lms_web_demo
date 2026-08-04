"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/common/Loader";

function ReportsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const courseId = searchParams.get("courseId");
    router.replace(courseId ? `/instructor/analytics?courseId=${courseId}` : "/instructor/analytics");
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader />
    </div>
  );
}

/** Reports was renamed to Analytics; keep old bookmarks/links working. */
export default function InstructorReportsRedirect() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><Loader /></div>}>
      <ReportsRedirectContent />
    </Suspense>
  );
}
