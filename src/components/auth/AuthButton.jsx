"use client";

import Button from "@/components/ui/Button";

export default function AuthButton({
  loading,
  loadingText,
  children,
  ...props
}) {
  return (
    <Button
      className="w-full"
      disabled={loading}
      {...props}
    >
      {loading ? loadingText : children}
    </Button>
  );
}