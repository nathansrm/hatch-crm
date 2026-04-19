import { useGetList } from "ra-core";
import { memo, useMemo } from "react";
import { Link } from "react-router";

import { stageColorMap } from "../deals/stageColors";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";

type PipelineSummaryProps = {
  variant?: "grid" | "bars";
};

export const PipelineSummary = memo(
  ({ variant = "grid" }: PipelineSummaryProps) => {
    const { currency, dealStages } = useConfigurationContext();

    const { data: deals, isPending } = useGetList<Deal>("deals", {
      pagination: { page: 1, perPage: 500 },
    });

    const summary = useMemo(() => {
      if (!deals) return [];

      const byStage: Record<string, { count: number; amount: number }> = {};
      for (const deal of deals) {
        if (!byStage[deal.stage]) {
          byStage[deal.stage] = { count: 0, amount: 0 };
        }
        byStage[deal.stage].count++;
        byStage[deal.stage].amount += deal.amount ?? 0;
      }

      return dealStages
        .map((stage) => ({
          label: stage.label,
          value: stage.value,
          count: byStage[stage.value]?.count ?? 0,
          amount: byStage[stage.value]?.amount ?? 0,
        }))
        .filter((stage) => stage.count > 0);
    }, [deals, dealStages]);

    if (isPending) return null;
    if (summary.length === 0) return null;

    const totalDeals = summary.reduce((sum, stage) => sum + stage.count, 0);
    const totalAmount = summary.reduce((sum, stage) => sum + stage.amount, 0);
    const formatAmount = (amount: number) =>
      amount.toLocaleString(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      });

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-muted-foreground">
            {variant === "bars" ? "Pipeline Summary" : "Pipeline"}
          </h2>
          <div className="text-sm text-muted-foreground">
            {totalDeals} deals &middot;{" "}
            {variant === "bars"
              ? formatAmount(totalAmount)
              : `$${totalAmount.toLocaleString()}`}
          </div>
        </div>
        {variant === "bars" ? (
          <div className="space-y-3">
            {summary.map(({ label, value, count, amount }) => (
              <Link
                key={value}
                to={`/deals?filter=${encodeURIComponent(JSON.stringify({ stage: value }))}`}
                className="block transition-opacity hover:opacity-80"
              >
                <div className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)_48px_88px] items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 hover:bg-muted/40">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        stageColorMap[value]?.text ??
                        "var(--color-text-emphasis)",
                    }}
                  >
                    {label}
                  </span>
                  <div className="h-2 rounded-full bg-muted/70">
                    <div
                      className="h-2 rounded-full border"
                      style={{
                        width: `${(count / totalDeals) * 100}%`,
                        backgroundColor:
                          stageColorMap[value]?.bg ?? "var(--secondary)",
                        borderColor:
                          stageColorMap[value]?.border ?? "var(--border)",
                      }}
                    />
                  </div>
                  <span className="text-right text-sm font-semibold tabular-nums">
                    {count}
                  </span>
                  <span className="text-right text-xs text-muted-foreground">
                    {formatAmount(amount)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {summary.map(({ label, value, count }) => (
              <Link
                key={value}
                to={`/deals?filter=${encodeURIComponent(JSON.stringify({ stage: value }))}`}
                className="transition-opacity hover:opacity-80"
              >
                <div
                  className="flex cursor-pointer flex-col items-center rounded-md p-2"
                  style={{
                    backgroundColor:
                      stageColorMap[value]?.bg ?? "var(--secondary)",
                    borderLeft: `3px solid ${stageColorMap[value]?.border ?? "var(--border)"}`,
                  }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: stageColorMap[value]?.text }}
                  >
                    {count}
                  </span>
                  <span
                    className="text-center text-xs leading-tight"
                    style={{ color: stageColorMap[value]?.text }}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  },
);
