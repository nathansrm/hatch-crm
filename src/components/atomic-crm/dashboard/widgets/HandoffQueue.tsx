import { format } from "date-fns";
import { useGetList, useRefresh, useUpdate } from "ra-core";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal } from "../../types";

type CompanyRecord = {
  id: number;
  name: string;
};

type SalesRecord = {
  id: number | string;
  first_name: string;
  last_name: string;
};

const formatCurrency = (value: number, currency: string) =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

const InitialsAvatar = ({
  name,
  size = 28,
}: {
  name: string;
  size?: number;
}) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue}, 50%, 32%)`,
        border: `1px solid hsl(${hue}, 50%, 44%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        color: "#fff",
        fontFamily: "JetBrains Mono, monospace",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
};

export const HandoffQueue = () => {
  const { currency } = useConfigurationContext();
  const refresh = useRefresh();
  const [update, { isPending: isUpdating }] = useUpdate<Deal>();

  const { data: deals, isPending: dealsPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  const { data: companies, isPending: companiesPending } =
    useGetList<CompanyRecord>("companies", {
      pagination: { page: 1, perPage: 10000 },
    });

  const { data: sales, isPending: salesPending } = useGetList<SalesRecord>(
    "sales",
    { pagination: { page: 1, perPage: 100 } },
  );

  if (dealsPending || companiesPending || salesPending) {
    return null;
  }

  const companyNameById = new Map(
    (companies ?? []).map((c) => [c.id, c.name]),
  );
  const salesNameById = new Map(
    (sales ?? []).map((s) => [
      s.id,
      `${s.first_name} ${s.last_name}`.trim(),
    ]),
  );
  const pendingHandoffDeals =
    deals?.filter(
      (deal) => deal.stage === "won" && deal.project_status == null,
    ) ?? [];

  const handleStartOnboarding = (deal: Deal) => {
    const projectedHoursInput = window.prompt(
      "How many projected hours for this project?",
    );
    const trimmedInput = projectedHoursInput?.trim() ?? "";
    const projectedHours =
      trimmedInput === "" ? undefined : Number.parseFloat(trimmedInput);

    if (trimmedInput !== "" && Number.isNaN(projectedHours)) {
      return;
    }

    update(
      "deals",
      {
        id: deal.id,
        data: {
          ...deal,
          project_started_at: new Date().toISOString(),
          project_status: "on_track",
          ...(projectedHours !== undefined ? { projected_hours: projectedHours } : {}),
        },
        previousData: deal,
      },
      { onSuccess: () => refresh() },
    );
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: "var(--fg-3)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 3,
  };

  return (
    <section
      style={{
        borderRadius: 12,
        background: "#0D1424",
        border: "1px solid var(--line)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 22px",
          borderBottom: "1px solid var(--line)",
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
            Handoff Queue
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily:
                "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#ECEEF5",
              letterSpacing: "-0.01em",
            }}
          >
            Recently closed-won
          </h3>
        </div>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            fontWeight: 700,
            color: "#F5B84A",
            background: "rgba(245,184,74,0.1)",
            border: "1px solid rgba(245,184,74,0.25)",
            padding: "4px 10px",
            borderRadius: 5,
          }}
        >
          {pendingHandoffDeals.length} pending
        </span>
      </div>

      {/* Empty state */}
      {pendingHandoffDeals.length === 0 && (
        <div
          style={{
            padding: "32px 22px",
            textAlign: "center",
            color: "var(--fg-3)",
            fontSize: 13,
          }}
        >
          No deals pending handoff. Pipeline is clear.
        </div>
      )}

      {/* Rows */}
      {pendingHandoffDeals.map((deal, i) => (
        <div
          key={deal.id}
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
            gap: 20,
            padding: "18px 22px",
            borderBottom:
              i < pendingHandoffDeals.length - 1
                ? "1px solid var(--line)"
                : "none",
            alignItems: "center",
          }}
        >
          {/* Company + deal name */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "#34D399",
                  boxShadow: "0 0 8px #34D399",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily:
                    "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#ECEEF5",
                  letterSpacing: "-0.01em",
                }}
              >
                {companyNameById.get(deal.company_id as number) ?? "Unknown"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginLeft: 16 }}>
              {deal.name}
            </div>
          </div>

          {/* Deal value */}
          <div>
            <div style={labelStyle}>Deal value</div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 14,
                fontWeight: 700,
                color: "#ECEEF5",
              }}
            >
              {formatCurrency(deal.amount ?? 0, currency)}
            </div>
          </div>

          {/* Won date */}
          <div>
            <div style={labelStyle}>Won date</div>
            <div
              style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}
            >
              {format(new Date(deal.updated_at), "MMM d")}
            </div>
          </div>

          {/* Owner */}
          <div>
            <div style={labelStyle}>Owner</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <InitialsAvatar
                name={
                  salesNameById.get(
                    deal.sales_id as number | string,
                  ) ?? ""
                }
                size={22}
              />
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--fg-1)",
                  fontWeight: 500,
                }}
              >
                {salesNameById.get(deal.sales_id as number | string) ??
                  "Unassigned"}
              </span>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={() => handleStartOnboarding(deal)}
            disabled={isUpdating}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 12.5,
              background: "var(--hatch-cyan)",
              color: "#061022",
              border: "none",
              boxShadow:
                "0 2px 0 rgba(0,0,0,0.3), 0 0 20px rgba(77,200,232,0.2)",
              cursor: isUpdating ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              opacity: isUpdating ? 0.6 : 1,
            }}
          >
            Start Onboarding →
          </button>
        </div>
      ))}
    </section>
  );
};
