import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * HatchAside — sticky right rail used by Show pages. Replaces the ad-hoc
 * `AsideSection` light styling with the dark eyebrow + muted body pattern.
 */

export interface HatchAsideProps {
  children: React.ReactNode;
  className?: string;
}

export const HatchAside = ({ children, className }: HatchAsideProps) => (
  <aside
    className={cn(
      "hidden w-92 min-w-92 flex-col gap-6 text-sm text-[#B8C0D6] sm:flex",
      className,
    )}
  >
    {children}
  </aside>
);

export interface HatchAsideSectionProps {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const HatchAsideSection = ({
  title,
  action,
  children,
  className,
}: HatchAsideSectionProps) => (
  <section className={cn("space-y-2", className)}>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5C6784]">
        {title}
      </span>
      {action}
    </div>
    <div className="text-[13px] leading-[1.55] text-[#B8C0D6]">{children}</div>
  </section>
);
