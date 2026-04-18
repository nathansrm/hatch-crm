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
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        padding: "20px 22px",
        background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <AlertTriangle
            className="mt-0.5"
            size={16}
            style={{ color: "#F5B84A", flexShrink: 0 }}
          />
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#F5B84A",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Attention
            </div>
            <h3
              style={{
                margin: 0,
                fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "#ECEEF5",
              }}
            >
              Stale deals
            </h3>
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#F5B84A",
            background: "rgba(245,184,74,0.08)",
            border: "1px solid rgba(245,184,74,0.25)",
            padding: "3px 9px",
            borderRadius: 5,
          }}
        >
          {staleDeals.length} stuck
        </span>
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
    </section>
  );
};
