import { AlertTriangle } from "lucide-react";
import { useGetList, useRedirect } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { getDealDecayLevel } from "../deals/dealUtils";
import { stageColorMap } from "../deals/stageColors";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";

const TERMINAL_STAGES = ["won", "lost"];

export const StaleDeals = () => {
  const { dealStages, currency } = useConfigurationContext();
  const redirect = useRedirect();

  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "updated_at", order: "ASC" },
    filter: { "archived_at@is": null },
  });

  const staleDeals = (deals ?? [])
    .filter((deal) => !TERMINAL_STAGES.includes(deal.stage))
    .filter((deal) => getDealDecayLevel(deal) !== "none")
    .sort(
      (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    );

  if (isPending || staleDeals.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          Stale Deals
        </h2>
        <Badge variant="secondary" className="ml-2">
          {staleDeals.length}
        </Badge>
      </div>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium">Name</th>
              <th className="px-3 py-2.5 text-left font-medium">Stage</th>
              <th className="px-3 py-2.5 text-left font-medium">
                Last Activity
              </th>
              <th className="px-3 py-2.5 text-right font-medium">Value</th>
              <th className="px-3 py-2.5 text-right font-medium">
                Days Stale
              </th>
            </tr>
          </thead>
          <tbody>
            {staleDeals.map((deal) => {
              const decay = getDealDecayLevel(deal);
              const days = Math.floor(
                (Date.now() - new Date(deal.updated_at).getTime()) / 86400000,
              );
              const stage = dealStages.find((item) => item.value === deal.stage);
              const colors = stageColorMap[deal.stage];

              return (
                <tr
                  key={deal.id}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-b-0"
                  onClick={() =>
                    redirect(
                      `/deals/${deal.id}/show`,
                      undefined,
                      undefined,
                      undefined,
                      {
                        _scrollToTop: false,
                      },
                    )
                  }
                >
                  <td className="px-3 py-2.5">
                    <span className="font-medium">{deal.name}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge
                      style={{
                        backgroundColor: colors?.bg ?? "#F5F5F4",
                        color: colors?.text ?? "#1A1A2E",
                        border: `1px solid ${colors?.border ?? "#E5E5E3"}`,
                      }}
                    >
                      {stage?.label ?? deal.stage}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {days}d ago
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-medium">
                      {(deal.amount ?? 0).toLocaleString("en-US", {
                        notation: "compact",
                        style: "currency",
                        currency,
                        currencyDisplay: "narrowSymbol",
                        minimumSignificantDigits: 3,
                      })}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={`font-semibold ${
                        decay === "red" ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {days}d
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
