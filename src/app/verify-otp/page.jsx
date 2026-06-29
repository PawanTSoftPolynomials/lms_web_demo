"use client";

import { Suspense } from "react";
import VerifyOtpContent from "./VerifyOtpContent";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpContent />
    </Suspense>
  );
}