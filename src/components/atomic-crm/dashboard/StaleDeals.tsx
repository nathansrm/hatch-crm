import { useGetList, useRedirect } from "ra-core";

import { getDealDecayLevel } from "../deals/dealUtils";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { isTerminalDealStage } from "../deals/dealFilters";
import {
  DASHBOARD_COLLECTION_PAGINATION,
} from "./widgets/dashboardUtils";

export const StaleDeals = () => {
  const { dealStages, currency } = useConfigurationContext();
  const redirect = useRedirect();

  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: DASHBOARD_COLLECTION_PAGINATION,
    sort: { field: "updated_at", order: "ASC" },
    filter: { "archived_at@is": null },
  });

  const staleDeals = (deals ?? [])
    .filter((deal) => !isTerminalDealStage(deal.stage))
    .filter((deal) => getDealDecayLevel(deal) !== "none")
    .sort(
      (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    );

  if (isPending || staleDeals.length === 0) return null;

  const fmt = (value: number) =>
    (value ?? 0).toLocaleString(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {staleDeals.slice(0, 6).map((deal) => {
          const days = Math.floor(
            (Date.now() - new Date(deal.updated_at).getTime()) / 86400000,
          );
          const decay = getDealDecayLevel(deal);
          const accentColor = decay === "red" ? "#EF5A6F" : "#F5B84A";
          const stageMeta = dealStages.find((s) => s.value === deal.stage);

          return (
            <div
              key={deal.id}
              onClick={() => redirect(`/deals/${deal.id}/show`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px",
                background: `${accentColor}07`,
                border: `1px solid ${accentColor}25`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 9,
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${accentColor}2e 0%, ${accentColor}07 100%)`,
                  border: `1px solid ${accentColor}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: accentColor,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                <span style={{ fontSize: 16 }}>{days}</span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    marginTop: 2,
                  }}
                >
                  DAYS
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ECEEF5",
                    marginBottom: 3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {deal.name}
                </div>
                <div style={{ fontSize: 11, color: "#5C6784" }}>
                  {stageMeta?.label ?? deal.stage}
                  {" - "}
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", ui-monospace',
                      color: "#9AA3BE",
                    }}
                  >
                    {fmt(deal.amount ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
