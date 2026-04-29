import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * HatchDialog — centered modal variant of HatchSheet. Used for tag create/edit,
 * confirms, and short forms that don't justify a full slide-in.
 */
export interface HatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** When false, the standard header (eyebrow + title + subtitle) is suppressed. */
  showHeader?: boolean;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Optional wrapper around header + body + footer. Use this when the dialog's
   * contents need a shared React context (e.g. an `<EditBase><Form>` pairing
   * that owns the body inputs and the footer's submit button).
   */
  wrap?: (node: React.ReactNode) => React.ReactNode;
}

const sizeMap: Record<NonNullable<HatchDialogProps["size"]>, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

const getFallbackDescription = (title: React.ReactNode) =>
  typeof title === "string" ? title : "Dialog content";

export const HatchDialog = ({
  open,
  onOpenChange,
  eyebrow,
  title,
  subtitle,
  footer,
  headerActions,
  children,
  className,
  contentClassName,
  size = "md",
  showHeader = true,
  wrap,
}: HatchDialogProps) => {
  const inner = (
    <>
      {showHeader ? (
        <DialogHeader className="space-y-1.5 border-b border-[rgba(255,255,255,0.07)] px-6 py-5 text-left">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              {eyebrow ? (
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--fg-3)]">
                  {eyebrow}
                </div>
              ) : null}
              <DialogTitle className="font-heading text-lg font-bold text-[var(--fg-1)]">
                {title}
              </DialogTitle>
              {subtitle ? (
                <DialogDescription className="text-sm text-[var(--fg-mid)]">
                  {subtitle}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  {getFallbackDescription(title)}
                </DialogDescription>
              )}
            </div>
            {headerActions ? (
              <div className="flex items-center gap-2">{headerActions}</div>
            ) : null}
          </div>
        </DialogHeader>
      ) : (
        // Radix requires a DialogTitle for accessibility — render it
        // visually-hidden when the caller suppresses the header.
        <>
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {getFallbackDescription(title)}
          </DialogDescription>
        </>
      )}
      <div className={cn("hatch-scrollbar-none px-6 py-5", className)}>
        {children}
      </div>
      {footer ? (
        <div className="flex flex-row justify-end gap-3 border-t border-[rgba(255,255,255,0.07)] px-6 py-4">
          {footer}
        </div>
      ) : null}
    </>
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden border border-[rgba(255,255,255,0.07)] p-0 text-[var(--fg-1)]",
          sizeMap[size],
          contentClassName,
        )}
        style={{
          background:
            "linear-gradient(180deg, var(--ink-3) 0%, var(--ink-2-deep) 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
        }}
      >
        {wrap ? wrap(inner) : inner}
      </DialogContent>
    </Dialog>
  );
};
