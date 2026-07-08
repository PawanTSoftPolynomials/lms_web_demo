"use client";

export default function Countdown({
  seconds,
  loading,
  onResend,
}) {
  if (seconds > 0) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-400">
          Didn't receive the code?
        </p>

        <p className="mt-1 font-medium text-orange-500">
          Resend in {seconds}s
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={onResend}
        disabled={loading}
        className="font-medium text-orange-500 transition hover:text-orange-400 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Resend OTP"}
      </button>
    </div>
  );
}