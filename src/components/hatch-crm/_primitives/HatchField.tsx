import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * HatchField — eyebrow label + slot. Variants are exposed as separate inputs
 * (HatchTextInput / HatchTextareaInput / HatchDateInput) so callers can mix
 * them with ra-core inputs as needed.
 */
export interface HatchFieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const HatchField = ({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: HatchFieldProps) => (
  <div className={className}>
    {label ? (
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#9AA3BE]"
      >
        {label}
      </label>
    ) : null}
    {children}
    {hint ? (
      <p className="mt-1.5 text-xs text-[#9AA3BE]">{hint}</p>
    ) : null}
    {error ? (
      <p className="mt-1.5 text-xs text-[#EF5A6F]">{error}</p>
    ) : null}
  </div>
);

const fieldBase =
  "w-full rounded-lg border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] text-[#ECEEF5] outline-none placeholder:text-[#5C6784] focus:border-[#4DC8E8]";

export const HatchTextInput = ({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...rest}
    className={cn(fieldBase, "px-4 py-3 text-base", className)}
  />
);

export const HatchTextareaInput = ({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...rest}
    className={cn(
      fieldBase,
      "min-h-24 resize-none px-4 py-3 text-base",
      className,
    )}
  />
);

export const HatchDateInput = ({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type="date"
    {...rest}
    className={cn(fieldBase, "h-11 px-3 text-sm", className)}
  />
);

/**
 * Pill-group toggle. Active button gets the accent tint; inactive gets the
 * subdued field background.
 */
export interface HatchPillGroupProps<V extends string> {
  value: V | null | undefined;
  onChange: (value: V) => void;
  options: Array<{
    value: V;
    label: React.ReactNode;
    accent?: { bg: string; fg: string; border: string };
    icon?: React.ReactNode;
  }>;
  ariaLabel?: string;
  className?: string;
}

export function HatchPillGroup<V extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: HatchPillGroupProps<V>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const accent = opt.accent;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors",
              !active &&
                "border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] text-[#B8C0D6] hover:text-[#ECEEF5]",
            )}
            style={
              active
                ? {
                    borderColor: accent?.border ?? "#4DC8E8",
                    background: accent?.bg ?? "rgba(77,200,232,0.14)",
                    color: accent?.fg ?? "#4DC8E8",
                  }
                : undefined
            }
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Autocomplete shell — wraps an `<AutocompleteInput>` from ra-admin so its
 * trigger inherits dark-field tokens. Used by sheets that show contact /
 * company autocompletes.
 */
export const HatchAutocompleteShell = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-lg border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] p-3",
      className,
    )}
  >
    {children}
  </div>
);
