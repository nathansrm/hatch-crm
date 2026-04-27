import type * as React from "react";
import { cn } from "@/lib/utils";

export interface HatchPageHeaderProps {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  count?: number | null;
  countSuffix?: React.ReactNode;
  subline?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * HatchPageHeader — eyebrow + cyan hairline + title + counter line + actions.
 * Replaces the inline-styled headers on every list/show page.
 */
export const HatchPageHeader = ({
  eyebrow,
  title,
  count,
  countSuffix = "in the pipeline",
  subline,
  actions,
  className,
}: HatchPageHeaderProps) => {
  return (
    <div className={cn("pb-5", className)}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#4DC8E8]">
          {eyebrow}
        </span>
        <span
          aria-hidden
          className="h-px w-6"
          style={{ background: "rgba(77,200,232,0.4)" }}
        />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="font-heading text-[26px] font-bold tracking-[-0.02em] text-[#ECEEF5]"
            style={{ margin: 0 }}
          >
            {title}
          </h1>
          {subline !== undefined ? (
            <p className="mt-1 text-[13px] text-[#9AA3BE]">{subline}</p>
          ) : count != null ? (
            <p className="mt-1 text-[13px] text-[#9AA3BE]">
              <span className="font-mono font-semibold text-[#ECEEF5]">
                {count}
              </span>{" "}
              {countSuffix}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
};
