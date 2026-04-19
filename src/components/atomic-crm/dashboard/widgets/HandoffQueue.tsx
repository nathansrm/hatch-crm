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

const safeFormatDate = (value: unknown): string => {
  if (value == null || value === "") return "—";
  const d = new Date(value as string | number | Date);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return format(d, "MMM d");
  } catch {
    return "—";
  }
};

type HandoffCardProps = {
  companyName: string;
  dealName: string;
  dealValue: string;
  wonDate: string;
  salesName: string;
  onStart?: () => void;
  isUpdating?: boolean;
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "var(--fg-3)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight: 700,
  marginBottom: 6,
};

const metricValueStyle: React.CSSProperties = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 14,
  fontWeight: 700,
  color: "#ECEEF5",
  letterSpacing: "-0.01em",
};

const HandoffCard = ({
  companyName,
  dealName,
  dealValue,
  wonDate,
  salesName,
  onStart,
  isUpdating,
}: HandoffCardProps) => (
  <div
    style={{
      background: "#111A2E",
      border: "1px solid var(--line)",
      borderLeft: "3px solid #F5B84A",
      borderRadius: 10,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      minWidth: 0,
    }}
  >
    {/* Top row: company + description, cta */}
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "#34D399",
              boxShadow: "0 0 8px rgba(52,211,153,0.7)",
              flexShrink: 0,
            }}
          />
          <h3
            style={{
              margin: 0,
              fontFamily:
                "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: "#ECEEF5",
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {companyName}
          </h3>
        </div>
        <p
          style={{
            margin: "0 0 0 17px",
            fontSize: 12.5,
            color: "var(--fg-3)",
            lineHeight: 1.45,
          }}
        >
          {dealName}
        </p>
      </div>
      <button
        onClick={onStart}
        disabled={isUpdating || !onStart}
        style={{
          padding: "9px 16px",
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
          flexShrink: 0,
        }}
      >
        Start Onboarding →
      </button>
    </div>

    {/* Metric stack */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 10,
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--line)",
        }}
      >
        <div style={labelStyle}>Deal Value</div>
        <div style={metricValueStyle}>{dealValue}</div>
      </div>
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--line)",
        }}
      >
        <div style={labelStyle}>Won Date</div>
        <div style={metricValueStyle}>{wonDate}</div>
      </div>
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--line)",
        }}
      >
        <div style={labelStyle}>Sales</div>
        <div style={metricValueStyle}>{salesName}</div>
      </div>
    </div>
  </div>
);

const MOCK_CARDS: Omit<HandoffCardProps, "onStart" | "isUpdating">[] = [
  {
    companyName: "Northshore Builders Inc.",
    dealName: "Kitchen and basement renovation package",
    dealValue: "$125,000",
    wonDate: "Apr 17",
    salesName: "Nathan",
  },
  {
    companyName: "Oakville Custom Homes",
    dealName: "Design-build upgrade package",
    dealValue: "$87,000",
    wonDate: "Apr 14",
    salesName: "Nathan",
  },
];

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
          ...(projectedHours !== undefined
            ? { projected_hours: projectedHours }
            : {}),
        },
        previousData: deal,
      },
      { onSuccess: () => refresh() },
    );
  };

  const showMocks = pendingHandoffDeals.length === 0;
  const badgeCount = showMocks ? MOCK_CARDS.length : pendingHandoffDeals.length;

  return (
    <section
      style={{
        borderRadius: 12,
        background: "#0D1424",
        border: "1px solid var(--line)",
        overflow: "hidden",
        flexShrink: 0,
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
          {badgeCount} pending
        </span>
      </div>

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 14,
          padding: 18,
        }}
      >
        {showMocks
          ? MOCK_CARDS.map((row, i) => (
              <HandoffCard key={`mock-${i}`} {...row} />
            ))
          : pendingHandoffDeals.map((deal) => {
              const companyName =
                (deal.company_id != null
                  ? companyNameById.get(deal.company_id as number)
                  : undefined) ?? "Unknown";
              const salesName =
                (deal.sales_id != null
                  ? salesNameById.get(deal.sales_id as number | string)
                  : undefined) ?? "Unassigned";
              const amountValue =
                typeof deal.amount === "number" && Number.isFinite(deal.amount)
                  ? deal.amount
                  : 0;
              return (
                <HandoffCard
                  key={deal.id}
                  companyName={companyName}
                  dealName={deal.name ?? "Untitled deal"}
                  dealValue={formatCurrency(amountValue, currency)}
                  wonDate={safeFormatDate(deal.updated_at)}
                  salesName={salesName}
                  onStart={() => handleStartOnboarding(deal)}
                  isUpdating={isUpdating}
                />
              );
            })}
      </div>
    </section>
  );
};
