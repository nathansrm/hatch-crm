import { useGetList } from "ra-core";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal } from "../../types";
import { calcUtilization } from "./DeliveryKPIs";

type CompanyRecord = {
  id: number;
  name: string;
};

const ACTIVE_PROJECT_STATUSES = ["on_track", "at_risk", "behind"] as const;
type ActiveStatus = (typeof ACTIVE_PROJECT_STATUSES)[number];

const formatCurrency = (value: number, currency: string) =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

const statusCopy: Record<ActiveStatus, string> = {
  at_risk: "At Risk",
  behind: "Behind",
  on_track: "On Track",
};

const statusPillStyle: Record<ActiveStatus, React.CSSProperties> = {
  on_track: {
    background: "rgba(52,211,153,0.12)",
    color: "#34D399",
  },
  at_risk: {
    background: "rgba(245,184,74,0.12)",
    color: "#F5B84A",
  },
  behind: {
    background: "rgba(239,68,68,0.12)",
    color: "#F87171",
  },
};

const headerCellStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--fg-3)",
  borderBottom: "1px solid var(--line)",
};

const cellStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 13,
  color: "#ECEEF5",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  verticalAlign: "middle",
};

const monoCellStyle: React.CSSProperties = {
  ...cellStyle,
  fontFamily: "JetBrains Mono, monospace",
  fontWeight: 700,
};

export const CapacityPanel = () => {
  const { currency } = useConfigurationContext();
  const { data: deals, isPending: dealsPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  const { data: companies, isPending: companiesPending } =
    useGetList<CompanyRecord>("companies", {
      pagination: { page: 1, perPage: 10000 },
    });

  if (dealsPending || companiesPending) {
    return null;
  }

  const companyNameById = new Map(
    (companies ?? []).map((company) => [company.id, company.name]),
  );
  const activeProjects =
    deals?.filter((deal) =>
      ACTIVE_PROJECT_STATUSES.includes(
        (deal.project_status ?? "") as ActiveStatus,
      ),
    ) ?? [];
  const weeklyCapacity = 40;
  const utilization = calcUtilization(activeProjects, weeklyCapacity);

  if (utilization <= 85) {
    return null;
  }

  const totalHours = activeProjects.reduce(
    (sum, deal) => sum + (deal.projected_hours ?? 0),
    0,
  );
  const sortedProjects = [...activeProjects].sort(
    (left, right) => (right.projected_hours ?? 0) - (left.projected_hours ?? 0),
  );
  const overCapacity = totalHours > weeklyCapacity;

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
            Capacity Warning
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
            Active project workload
          </h3>
        </div>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            fontWeight: 700,
            color: overCapacity ? "#F87171" : "#F5B84A",
            background: overCapacity
              ? "rgba(239,68,68,0.1)"
              : "rgba(245,184,74,0.1)",
            border: `1px solid ${
              overCapacity ? "rgba(239,68,68,0.25)" : "rgba(245,184,74,0.25)"
            }`,
            padding: "4px 10px",
            borderRadius: 5,
          }}
        >
          {utilization}% utilized
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={headerCellStyle}>Deal</th>
              <th style={{ ...headerCellStyle, textAlign: "right" }}>Value</th>
              <th style={headerCellStyle}>Status</th>
              <th style={{ ...headerCellStyle, textAlign: "right" }}>
                Projected Hours
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((deal) => {
              const status = deal.project_status as ActiveStatus | undefined;
              if (!status) return null;

              const rowTint =
                status === "behind"
                  ? "rgba(239,68,68,0.04)"
                  : status === "at_risk"
                    ? "rgba(245,184,74,0.04)"
                    : "transparent";

              return (
                <tr key={deal.id} style={{ background: rowTint }}>
                  <td style={cellStyle}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#ECEEF5",
                        marginBottom: 2,
                      }}
                    >
                      {companyNameById.get(deal.company_id as number) ??
                        "Unknown company"}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>
                      {deal.name ?? "—"}
                    </div>
                  </td>
                  <td style={{ ...monoCellStyle, textAlign: "right" }}>
                    {formatCurrency(deal.amount ?? 0, currency)}
                  </td>
                  <td style={cellStyle}>
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        ...statusPillStyle[status],
                      }}
                    >
                      {statusCopy[status]}
                    </span>
                  </td>
                  <td style={{ ...monoCellStyle, textAlign: "right" }}>
                    {deal.projected_hours ?? 0}h
                  </td>
                </tr>
              );
            })}
            <tr>
              <td
                colSpan={4}
                style={{
                  padding: "14px 16px",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  background: overCapacity
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(52,211,153,0.06)",
                  color: overCapacity ? "#F87171" : "#34D399",
                  borderTop: "1px solid var(--line)",
                }}
              >
                {overCapacity
                  ? `OVER CAPACITY — ${totalHours}h projected / ${weeklyCapacity}h weekly`
                  : `${totalHours}h projected / ${weeklyCapacity}h weekly`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
