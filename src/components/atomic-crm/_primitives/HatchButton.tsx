import type * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Hatch buttons — thin wrappers over shadcn Button that lock in the cyan/ghost
 * /danger token combinations from the audit. Mirrors the shadcn Button API
 * (asChild, size, type, etc) so callers can drop them in with no other change.
 */

export const HatchPrimaryButton = ({
  className,
  ...rest
}: ButtonProps) => (
  <Button
    {...rest}
    className={cn(
      "bg-[#4DC8E8] font-semibold text-[#06111F] shadow-[0_0_20px_rgba(77,200,232,0.25)] hover:bg-[#7DDCF0]",
      className,
    )}
  />
);

export const HatchGhostButton = ({
  className,
  variant,
  ...rest
}: ButtonProps) => (
  <Button
    variant={variant ?? "ghost"}
    {...rest}
    className={cn(
      "text-[#B8C0D6] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#ECEEF5]",
      className,
    )}
  />
);

export const HatchDangerButton = ({
  className,
  ...rest
}: ButtonProps) => (
  <Button
    {...rest}
    className={cn(
      "border border-[rgba(239,90,111,0.28)] bg-[rgba(239,90,111,0.08)] font-semibold text-[#EF5A6F] hover:bg-[rgba(239,90,111,0.14)]",
      className,
    )}
  />
);
