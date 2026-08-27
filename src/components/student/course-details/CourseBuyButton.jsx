"use client";

import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import useRazorpayCheckout from "@/hooks/useRazorpayCheckout";

export default function CourseBuyButton({ courseId, courseTitle }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: myEnrollments = [] } = useMyCourses();
  const { startCheckout, isProcessing, getButtonLabel, errorMsg } = useRazorpayCheckout();

  const isEnrolled =
    user &&
    Array.isArray(myEnrollments) &&
    myEnrollments.some(
      (e) => e.courseId === courseId || e.course?.id === courseId
    );

  const handleBuy = async () => {
    await startCheckout({
      courseId,
      courseTitle,
      returnPath: `/courses/${courseId}`,
      onSuccess: () => {
        router.push(`/student/learn/${courseId}`);
      },
    });
  };

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/student/learn/${courseId}`)}
        className="block text-center w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black uppercase tracking-widest text-xs py-4 transition cursor-pointer"
      >
        Continue Learning
      </button>
    );
  }

  return (
    <div className="space-y-2 w-full">
      <button
        onClick={handleBuy}
        disabled={isProcessing}
        className="block text-center w-full rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-75 text-slate-950 font-black uppercase tracking-widest text-xs py-4 transition cursor-pointer"
      >
        {getButtonLabel("Buy Course")}
      </button>
      {errorMsg && (
        <p className="text-red-400 text-xs font-semibold mt-1 text-center animate-in fade-in duration-150">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
