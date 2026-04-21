import { ResponsiveBar } from "@nivo/bar";
import { format, startOfMonth } from "date-fns";
import { TrendingUp } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { memo, useMemo } from "react";

import { findDealLabel } from "../deals/dealUtils";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { DASHBOARD_COLLECTION_PAGINATION } from "./widgets/dashboardUtils";

const multiplier: Record<string, number> = {
  lead: 0.1,
  qualified: 0.3,
  "audit-scheduled": 0.5,
  "proposal-sent": 0.75,
};

const threeMonthsAgo = new Date(
  new Date().setMonth(new Date().getMonth() - 6),
).toISOString();

const DEFAULT_LOCALE = "en-US";

export const DealsChart = memo(() => {
  const translate = useTranslate();
  const { dealStages, currency } = useConfigurationContext();
  const acceptedLanguages = navigator
    ? navigator.languages || [navigator.language]
    : [DEFAULT_LOCALE];
  const wonLabel = findDealLabel(dealStages, "won") ?? "Won";
  const lostLabel = findDealLabel(dealStages, "lost") ?? "Lost";

  const { data, isPending } = useGetList<Deal>("deals", {
    pagination: DASHBOARD_COLLECTION_PAGINATION,
    sort: {
      field: "created_at",
      order: "ASC",
    },
    filter: {
      "created_at@gte": threeMonthsAgo,
    },
  });
  const months = useMemo(() => {
    if (!data) return [];
    const dealsByMonth = data.reduce((acc, deal) => {
      const month = startOfMonth(deal.created_at ?? new Date()).toISOString();
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(deal);
      return acc;
    }, {} as any);

    const amountByMonth = Object.keys(dealsByMonth).map((month) => {
      return {
        date: format(month, "MMM"),
        won: dealsByMonth[month]
          .filter((deal: Deal) => deal.stage === "won")
          .reduce((acc: number, deal: Deal) => {
            acc += deal.amount;
            return acc;
          }, 0),
        pending: dealsByMonth[month]
          .filter((deal: Deal) => !["won", "lost"].includes(deal.stage))
          .reduce((acc: number, deal: Deal) => {
            acc += deal.amount * (multiplier[deal.stage] ?? 0);
            return acc;
          }, 0),
        lost: dealsByMonth[month]
          .filter((deal: Deal) => deal.stage === "lost")
          .reduce((acc: number, deal: Deal) => {
            acc -= deal.amount;
            return acc;
          }, 0),
      };
    });

    return amountByMonth;
  }, [data]);

  if (isPending) return null; // FIXME return skeleton instead
  const range = months.reduce(
    (acc, month) => {
      acc.min = Math.min(acc.min, month.lost);
      acc.max = Math.max(acc.max, month.won + month.pending);
      return acc;
    },
    { min: 0, max: 0 },
  );
  const scaledMin = range.min * 1.2;
  const scaledMax = range.max * 1.2;
  // nivo ResponsiveBar throws when the y-axis has zero range (all deals in untracked stages)
  if (scaledMin === scaledMax) return null;
  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-4">
        <div className="mr-3 flex">
          <TrendingUp className="text-muted-foreground w-6 h-6" />
        </div>
        <h2
          className="text-xl font-semibold text-muted-foreground"
          style={{
            fontFamily:
              '"Manrope Variable", ui-sans-serif, system-ui, sans-serif',
          }}
        >
          {translate("crm.dashboard.deals_chart")}
        </h2>
        <div className="ml-auto flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: "#22C55E" }}
            />
            {wonLabel}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: "#4AC1E0" }}
            />
            Pending
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: "#EF4444" }}
            />
            {lostLabel}
          </span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveBar
          data={months}
          indexBy="date"
          keys={["won", "pending", "lost"]}
          colors={["#22C55E", "#4AC1E0", "#EF4444"]}
          margin={{ top: 10, right: 10, bottom: 30, left: 55 }}
          padding={0.3}
          valueScale={{
            type: "linear",
            min: scaledMin,
            max: scaledMax,
          }}
          indexScale={{ type: "band", round: true }}
          enableGridX={false}
          enableGridY={true}
          enableLabel={false}
          tooltip={({ value, indexValue }) => (
            <div className="p-2 bg-secondary rounded shadow inline-flex items-center gap-1 text-secondary-foreground">
              <strong>{indexValue}: </strong>&nbsp;{value > 0 ? "+" : ""}
              {value.toLocaleString(acceptedLanguages.at(0) ?? DEFAULT_LOCALE, {
                style: "currency",
                currency,
              })}
            </div>
          )}
          axisBottom={{
            legendPosition: "middle",
            legendOffset: 50,
            tickSize: 0,
            tickPadding: 12,
            style: {
              ticks: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
              legend: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
            },
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 12,
            tickValues: 5,
            format: (v: any) => {
              const abs = Math.abs(v);
              if (abs >= 1000) return `${abs / 1000}k`;
              return `${abs}`;
            },
            style: {
              ticks: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
              legend: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
});
