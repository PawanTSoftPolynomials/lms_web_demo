"use client";

export default function AuthAlert({
  type = "error",
  message,
}) {
  if (!message) return null;

  const styles = {
    success:
      "border-green-500/30 bg-green-500/10 text-green-300",
    error:
      "border-red-500/30 bg-red-500/10 text-red-300",
    info:
      "border-blue-500/30 bg-blue-500/10 text-blue-300",
  };

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center text-sm ${styles[type]}`}
    >
      {message}
    </div>
  );
}