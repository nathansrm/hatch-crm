import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useConfigurationContext } from "../root/ConfigurationContext";

export const MOBILE_PANEL =
  "rounded-xl border border-white/[0.07] bg-[#0d1424] shadow-[0_16px_32px_rgba(0,0,0,0.24)]";

export const MOBILE_PANEL_SOFT =
  "rounded-xl border border-white/[0.06] bg-white/[0.025]";

export const MobileBrandMark = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={cn(
      "relative inline-flex h-6 w-5 items-center justify-center text-[#4dc8e8]",
      className,
    )}
  >
    <span className="absolute left-0 h-5 w-1 rounded-sm bg-current" />
    <span className="absolute right-0 h-5 w-1 rounded-sm bg-current" />
    <span className="h-1 w-5 rounded-sm bg-current" />
  </span>
);

export const MobileAppHeader = ({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
}) => {
  const { darkModeLogo, title: appTitle } = useConfigurationContext();

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {darkModeLogo ? (
          <img
            src={darkModeLogo}
            alt={appTitle}
            className="h-8 w-auto max-w-[132px] shrink-0 object-contain"
          />
        ) : (
          <MobileBrandMark />
        )}
        {title || subtitle || eyebrow ? (
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-0.5 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[#5c6784]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h1 className="truncate text-base font-bold leading-tight text-[#eceef5]">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <div className="truncate text-[11px] font-medium text-[#9aa3be]">
                {subtitle}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
};

export const MobileAvatar = ({ label = "N" }: { label?: string }) => (
  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-bold text-[#eceef5]">
    {label}
  </span>
);

export const MobileSegmentedControl = ({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex rounded-xl border border-white/[0.07] bg-black/20 p-1">
    {options.map((option) => {
      const active = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg px-2 text-xs font-bold transition-colors",
            active
              ? "bg-[#4DC8E8] text-[#06111F] shadow-[0_8px_20px_rgba(77,200,232,0.24)]"
              : "text-[#9aa3be]",
          )}
        >
          <span>{option.label}</span>
          {typeof option.count === "number" ? (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                active ? "bg-white/20 text-white" : "bg-white/[0.06]",
              )}
            >
              {option.count}
            </span>
          ) : null}
        </button>
      );
    })}
  </div>
);

export const MobileStatGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-3 gap-2">{children}</div>
);

export const MobileStatTile = ({
  label,
  value,
  delta,
  icon,
  tone = "cyan",
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  icon?: ReactNode;
  tone?: "cyan" | "green" | "amber" | "red" | "blue";
}) => {
  const toneClass = {
    cyan: "text-[#4dc8e8] border-[#4dc8e8]/25 bg-[#4dc8e8]/10",
    green: "text-emerald-400 border-emerald-400/25 bg-emerald-400/10",
    amber: "text-amber-300 border-amber-300/25 bg-amber-300/10",
    red: "text-rose-400 border-rose-400/25 bg-rose-400/10",
    blue: "text-[#0EA5E9] border-[#0EA5E9]/25 bg-[#0EA5E9]/10",
  }[tone];

  return (
    <div className={cn(MOBILE_PANEL, "min-h-[88px] p-3")}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "grid h-6 w-6 place-items-center rounded-lg border",
            toneClass,
          )}
        >
          {icon}
        </span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5c6784]">
        {label}
      </p>
      <p className="mt-1 truncate text-xl font-bold leading-none text-[#eceef5]">
        {value}
      </p>
      {delta ? (
        <p className="mt-1 text-[10px] font-semibold text-emerald-300">
          {delta}
        </p>
      ) : null}
    </div>
  );
};

export const MobileSection = ({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn(MOBILE_PANEL, "overflow-hidden", className)}>
    <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-3.5 py-3">
      <div>
        {eyebrow ? (
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5c6784]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-sm font-bold text-[#eceef5]">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
    <div className="p-3.5">{children}</div>
  </section>
);

export const MobilePill = ({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "min-h-8 shrink-0 rounded-lg border px-3 text-xs font-bold",
      active
        ? "border-[#4DC8E8]/40 bg-[#4DC8E8] text-[#06111F]"
        : "border-white/[0.08] bg-white/[0.03] text-[#9aa3be]",
    )}
  >
    {children}
  </button>
);
