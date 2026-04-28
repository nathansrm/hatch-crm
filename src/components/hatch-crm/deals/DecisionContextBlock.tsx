import { CheckCircle2, XCircle } from "lucide-react";

import type { Deal } from "../types";

const hasValue = (value: string | null | undefined) =>
  typeof value === "string" ? value.trim().length > 0 : false;

export const DecisionContextBlock = ({ record }: { record: Deal }) => {
  const hasBottleneck = hasValue(record.primary_bottleneck);
  const hasHoursWasted = record.hours_wasted_per_week != null;
  const hasOwnerSignal = record.dm_present != null;
  const hasResponseTime = record.response_time_hours != null;
  const hasAnyContext =
    hasBottleneck || hasHoursWasted || hasOwnerSignal || hasResponseTime;

  return (
    <section className="rounded-lg border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Decision Context</h3>
      {hasAnyContext ? (
        <div className="space-y-3">
          {hasBottleneck ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bottleneck
              </p>
              <p className="text-sm leading-6">{record.primary_bottleneck}</p>
            </div>
          ) : null}

          {hasHoursWasted ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Hours Wasted
              </p>
              <p className="text-sm">
                {record.hours_wasted_per_week} hours/week lost to manual work
              </p>
            </div>
          ) : null}

          {hasOwnerSignal ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Owner Presence
              </p>
              <p className="inline-flex items-center gap-2 text-sm">
                {record.dm_present ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">
                      Decision maker present
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Owner not in deal
                    </span>
                  </>
                )}
              </p>
            </div>
          ) : null}

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Time to First Response
            </p>
            <p className="text-sm">
              {hasResponseTime
                ? `${record.response_time_hours} hours`
                : "Not tracked"}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No context captured yet &mdash; fill in during Discovery call.
        </p>
      )}
    </section>
  );
};
