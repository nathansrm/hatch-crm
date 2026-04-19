import { useGetList, useRedirect } from "ra-core";

import { getDealDecayLevel } from "../deals/dealUtils";
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
        background:
          "linear-gradient(180deg, var(--color-surface-deep) 0%, var(--color-surface-deeper) 100%)",
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
              color: "var(--color-state-warning-dark)",
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
              color: "var(--color-text-primary-dark)",
            }}
          >
            Stale deals
          </h3>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-state-warning-dark)",
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
          const accentColor =
            decay === "red"
              ? "var(--color-state-danger-dark)"
              : "var(--color-state-warning-dark)";
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
                background: `color-mix(in srgb, ${accentColor} 2.7%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accentColor} 14.5%, transparent)`,
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
                  background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 18%, transparent) 0%, color-mix(in srgb, ${accentColor} 2.7%, transparent) 100%)`,
                  border: `1px solid color-mix(in srgb, ${accentColor} 26.7%, transparent)`,
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
                    color: "var(--color-text-primary-dark)",
                    marginBottom: 3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {deal.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted-dark)",
                  }}
                >
                  {stageMeta?.label ?? deal.stage}
                  {" · "}
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", ui-monospace',
                      color: "var(--color-text-subtle-dark)",
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
