import type * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * HatchSheet — right-slide drawer with the canonical Obsidian dark gradient,
 * eyebrow + title + subtitle slots, and a footer slot. Lifted 1:1 from
 * TaskCreateSheet.tsx so every Sheet across the app shares the same chrome.
 */
export interface HatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  titleId?: string;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  side?: "right" | "left";
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  /**
   * Optional wrapper around header + body + footer. Use this when the sheet's
   * contents need a shared React context (e.g. a `<Form>` that owns both the
   * body inputs and the footer's submit button).
   */
  wrap?: (node: React.ReactNode) => React.ReactNode;
}

export const HatchSheet = ({
  open,
  onOpenChange,
  eyebrow,
  title,
  titleId,
  subtitle,
  headerActions,
  footer,
  children,
  className,
  contentClassName,
  side = "right",
  ariaLabelledBy,
  ariaDescribedBy,
  wrap,
}: HatchSheetProps) => {
  const labelledBy = ariaLabelledBy ?? titleId;
  const usesCustomLabel = Boolean(labelledBy);
  const inner = (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {usesCustomLabel ? (
        <SheetTitle className="sr-only">{title}</SheetTitle>
      ) : null}
      <HatchSheetHeader
        eyebrow={eyebrow}
        title={title}
        titleId={titleId}
        subtitle={subtitle}
        actions={headerActions}
        titleAsRadix={!usesCustomLabel}
      />
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-5">{children}</div>
      </div>
      {footer ? (
        <SheetFooter className="flex-row justify-end gap-3 border-t border-[rgba(255,255,255,0.07)] px-6 py-4">
          {footer}
        </SheetFooter>
      ) : null}
    </div>
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        role="dialog"
        aria-modal="true"
        aria-describedby={ariaDescribedBy}
        {...(labelledBy ? { "aria-labelledby": labelledBy } : {})}
        className={cn(
          "flex h-dvh w-full flex-col border-l border-[rgba(255,255,255,0.07)] p-0 text-[var(--fg-1)] sm:max-w-xl",
          contentClassName,
        )}
        style={{
          background:
            "linear-gradient(180deg, var(--ink-3) 0%, var(--ink-2-deep) 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        {wrap ? wrap(inner) : inner}
      </SheetContent>
    </Sheet>
  );
};

export const HatchSheetHeader = ({
  eyebrow,
  title,
  titleId,
  subtitle,
  actions,
  titleAsRadix = true,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  titleId?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  titleAsRadix?: boolean;
}) => (
  <SheetHeader className="border-b border-[rgba(255,255,255,0.07)] px-6 py-5 text-left">
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0">
        {eyebrow ? (
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--fg-3)]">
            {eyebrow}
          </div>
        ) : null}
        {titleAsRadix ? (
          <SheetTitle
            id={titleId}
            className="font-heading text-xl font-bold text-[var(--fg-1)]"
          >
            {title}
          </SheetTitle>
        ) : (
          <h2
            id={titleId}
            className="font-heading text-xl font-bold text-[var(--fg-1)]"
          >
            {title}
          </h2>
        )}
        {subtitle ? (
          <p className="text-sm text-[var(--fg-mid)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  </SheetHeader>
);
