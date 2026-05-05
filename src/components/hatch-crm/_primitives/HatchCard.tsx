import type * as React from "react";
import { cn } from "@/lib/utils";

export interface HatchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional 3px stage-color rail on the left edge. */
  accent?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap: Record<NonNullable<HatchCardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

/**
 * HatchCard — the canonical dark surface card. Replaces shadcn `<Card>` /
 * `<CardContent>` everywhere chrome is leaking light.
 */
export const HatchCard = ({
  accent,
  padding = "md",
  className,
  style,
  children,
  ...rest
}: HatchCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0D1424] text-[#ECEEF5]",
        "shadow-[0_8px_16px_rgba(0,0,0,0.25)]",
        paddingMap[padding],
        className,
      )}
      style={{
        ...(accent ? { borderLeft: `3px solid ${accent}` } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
