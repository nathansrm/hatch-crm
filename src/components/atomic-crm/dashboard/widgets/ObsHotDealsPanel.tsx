import { ArrowRight, ChevronRight } from "lucide-react";
import { useGetList, useRedirect } from "ra-core";

import { OPEN_DEALS_LIST_PARAMS } from "../../deals/dealFilters";
import { getDealDecayLevel } from "../../deals/dealUtils";
import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal } from "../../types";
import { AVATAR_COLORS } from "./dashboardUtils";

export const ObsHotDealsPanel = () => {
  const { currency } = useConfigurationContext();
  const { data: deals } = useGetList<Deal>("deals", {
    ...OPEN_DEALS_LIST_PARAMS,
    sort: { field: "amount", order: "DESC" },
  });
  const { data: sales } = useGetList<{
    id: number | string;
    first_name: string;
    last_name: string;
  }>("sales", { pagination: { page: 1, perPage: 100 } });
  const redirect = useRedirect();

  const hotDeals = (deals ?? [])
    .filter((deal) => !["won", "lost"].includes(deal.stage))
    .sort((left, right) => (right.amount ?? 0) - (left.amount ?? 0))
    .slice(0, 5);

  const fmt = (value: number) =>
    (value ?? 0).toLocaleString(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  const fmtRel = (value: string) => {
    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
    return days === 0 ? "today" : days === 1 ? "1d ago" : `${days}d ago`;
  };

  const stageColor: Record<string, string> = {
    lead: "#4DC8E8",
    qualified: "#A78BFA",
    "audit-scheduled": "#5EEAD4",
    audit: "#5EEAD4",
    "proposal-sent": "#F5B84A",
    proposal: "#F5B84A",
    negotiation: "#F5B84A",
    won: "#34D399",
    lost: "#EF5A6F",
  };
  const stageLabel: Record<string, string> = {
    lead: "Lead",
    qualified: "Qualified",
    "audit-scheduled": "Audit Scheduled",
    audit: "Audit",
    "proposal-sent": "Proposal Sent",
    proposal: "Proposal",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
  };
  const decayColor: Record<string, string> = {
    none: "#34D399",
    warn: "#F5B84A",
    stale: "#EF5A6F",
  };

  const salesNameById = new Map(
    (sales ?? []).map((s) => [
      String(s.id),
      `${s.first_name} ${s.last_name}`.trim(),
    ]),
  );
  const teamAvatars = Array.from(
    new Set(
      hotDeals
        .map((d) => (d.sales_id != null ? String(d.sales_id) : null))
        .filter((id): id is string => id !== null),
    ),
  )
    .slice(0, 5)
    .map((id, i) => {
      const name = salesNameById.get(id) ?? "?";
      return { initial: name.charAt(0).toUpperCase(), color: AVATAR_COLORS[i % AVATAR_COLORS.length] };
    });

  if (!hotDeals.length) return null;

  return (
    <section
      style={{
        borderRadius: 14,
        padding: "24px 28px",
        background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#5C6784",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Hot Deals
          </div>
          <h2
            style={{
              margin: 0,
              fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            Top 5 opportunities{" "}
            <span style={{ color: "#5C6784", fontWeight: 500, fontSize: 16 }}>
              closing this quarter
            </span>
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex" }}>
            {teamAvatars.map((member, i) => (
              <div
                key={`${member.initial}-${i}`}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  marginLeft: i === 0 ? 0 : -8,
                  background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}aa 100%)`,
                  border: "2px solid #0D1424",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#061022",
                  fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                }}
              >
                {member.initial}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => redirect("/deals")}
            style={{
              padding: "7px 13px",
              borderRadius: 7,
              fontSize: 11.5,
              fontWeight: 700,
              color: "#4DC8E8",
              background: "rgba(77,200,232,0.08)",
              border: "1px solid rgba(77,200,232,0.25)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            Kanban view <ArrowRight size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {hotDeals.map((deal, index) => {
          const color = stageColor[deal.stage] ?? "#9AA3BE";
          const label = stageLabel[deal.stage] ?? deal.stage;
          const decay = getDealDecayLevel(deal);
          const dot = decayColor[decay] ?? "#9AA3BE";
          const initial = (deal.name ?? "?").trim().charAt(0).toUpperCase();
          return (
            <div
              key={deal.id}
              onClick={() => redirect(`/deals/${deal.id}/show`)}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 2fr 1.2fr 1fr 40px",
                gap: 16,
                padding: "16px 0",
                borderBottom:
                  index < hotDeals.length - 1
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "none",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  background: `linear-gradient(135deg, ${color} 0%, ${color}88 100%)`,
                  boxShadow: `0 0 12px ${color}40`,
                  fontFamily:
                    "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#061022",
                  letterSpacing: "-0.01em",
                }}
              >
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: dot,
                      boxShadow: `0 0 6px ${dot}80`,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      fontFamily:
                        "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#ECEEF5",
                      letterSpacing: "-0.01em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {deal.name}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: '"JetBrains Mono", ui-monospace',
                    fontSize: 11,
                    color: "#5C6784",
                    marginLeft: 15,
                  }}
                >
                  {String(index + 1).padStart(2, "0")} · {fmtRel(deal.updated_at)}
                </div>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 10px",
                  borderRadius: 5,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color,
                  background: `${color}14`,
                  border: `1px solid ${color}3A`,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                  justifySelf: "start",
                }}
              >
                {label}
              </div>
              <div>
                <div
                  style={{
                    fontFamily:
                      "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                  }}
                >
                  {fmt(deal.amount ?? 0)}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#5C6784",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                  }}
                >
                  CAD
                </div>
              </div>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#5C6784",
                  justifySelf: "end",
                }}
              >
                <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
