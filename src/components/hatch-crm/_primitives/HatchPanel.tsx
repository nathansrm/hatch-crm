import type * as React from "react";
import { cn } from "@/lib/utils";

export interface HatchPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  flush?: boolean;
}

/**
 * HatchPanel — table/list container. Same surface tokens as HatchCard but
 * defaults to no padding + overflow-hidden so list/table content sits flush
 * against the rounded border.
 */
export const HatchPanel = ({
  flush = true,
  className,
  children,
  ...rest
}: HatchPanelProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0D1424] text-[#ECEEF5]",
        flush && "overflow-hidden",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
