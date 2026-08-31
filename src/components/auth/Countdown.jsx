"use client";

export default function Countdown({
  seconds,
  loading,
  onResend,
}) {
  if (seconds > 0) {
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?
        </p>

        <p className="mt-1 font-medium text-primary">
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
        className="font-medium text-primary transition hover:text-primary disabled:opacity-50"
      >
        {loading ? "Sending..." : "Resend OTP"}
      </button>
    </div>
  );
}