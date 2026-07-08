"use client";

import { useRef } from "react";

export default function OtpInput({
  value = "",
  onChange,
  length = 6,
}) {
  const inputRefs = useRef([]);

  const otp = Array.from({ length }, (_, i) => value[i] || "");

  const handleChange = (e, index) => {
    const digit = e.target.value.replace(/\D/g, "");

    if (digit.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = digit;

    onChange(newOtp.join(""));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        onChange(newOtp.join(""));
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    const newOtp = Array.from({ length }, (_, i) => pasted[i] || "");
    onChange(newOtp.join(""));

    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div
      className="flex justify-center gap-3"
      onPaste={handlePaste}
    >
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          style={{
            color: "#ffffff",
            WebkitTextFillColor: "#ffffff",
            caretColor: "#f97316",
          }}
          className="
            h-14
            w-14
            rounded-xl
            border-2
            border-slate-700
            bg-slate-900
            text-center
            text-2xl
            font-bold
            shadow-sm
            outline-none
            transition-all
            duration-200
            focus:border-orange-500
            focus:ring-2
            focus:ring-orange-500/40
          "
        />
      ))}
    </div>
  );
}