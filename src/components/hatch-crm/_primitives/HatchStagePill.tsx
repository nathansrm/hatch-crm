import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { stageColorMap } from "../deals/stageColors";

export interface HatchStagePillProps {
  /** Stage key as stored on the Deal record (e.g. "discovery"). */
  stage: string;
  /** Human label to render. Falls back to stage if omitted. */
  label?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

/**
 * HatchStagePill — single source of truth for stage chips. Pulls colors from
 * `deals/stageColors.ts` so every stage badge across the app stays consistent
 * (DealShow, ContactAside, deal cards, etc).
 */
export const HatchStagePill = ({
  stage,
  label,
  size = "sm",
  className,
}: HatchStagePillProps) => {
  const colors = stageColorMap[stage];
  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-heading font-bold uppercase tracking-[0.04em]",
        size === "sm"
          ? "px-2 py-0.5 text-[10.5px]"
          : "px-2.5 py-1 text-[11.5px]",
        className,
      )}
      style={{
        backgroundColor: colors?.bg ?? "rgba(255,255,255,0.04)",
        color: colors?.text ?? "var(--fg-mid)",
        border: `1px solid ${colors?.border ?? "rgba(255,255,255,0.14)"}`,
      }}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: colors?.text ?? "var(--fg-mid)" }}
      />
      {label ?? stage}
    </Badge>
  );
};
