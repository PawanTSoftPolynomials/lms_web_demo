// Thin adapter over the canonical shadcn Card (src/components/ui/shadcn/card.tsx)
// so there is one real card implementation app-wide, while the 75+ existing
// callers of this component keep their current `padding` prop unchanged.
import { Card as ShadcnCard } from "@/components/ui/shadcn/card";

export default function Card({
  children,
  className = "",
  padding = "p-6",
  onClick,
}) {
  return (
    <ShadcnCard
      onClick={onClick}
      className={`${padding} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </ShadcnCard>
  );
}
