// Thin adapter over the canonical shadcn Button (src/components/ui/shadcn/button.tsx)
// so there is one real button implementation app-wide, while the 40+ existing
// callers of this component keep their current variant names/props unchanged.
import { Button as ShadcnButton } from "@/components/ui/shadcn/button";

const VARIANT_MAP = {
  primary: "default",
  secondary: "secondary",
  danger: "destructive",
  ghost: "ghost",
  outline: "outline",
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <ShadcnButton
      variant={VARIANT_MAP[variant] || "default"}
      className={`min-h-[44px] ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </ShadcnButton>
  );
}
