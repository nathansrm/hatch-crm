import { AlertCircle, ArrowRight, Zap } from "lucide-react";
import { useGetList, useRedirect } from "ra-core";

import type { Deal } from "../../types";
import { ObsInsightCard } from "./ObsInsightCard";
import { getValidDate, UNARCHIVED_DEALS_LIST_PARAMS } from "./dashboardUtils";

export const ObsAttentionRow = ({
  overdueTasksCount,
}: {
  overdueTasksCount: number;
}) => {
  const redirect = useRedirect();
  const { data: allDeals } = useGetList<Deal>(
    "deals",
    UNARCHIVED_DEALS_LIST_PARAMS,
  );

  const now = new Date();
  const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
  const d14 = new Date(now); d14.setDate(d14.getDate() - 14);

  const thisWeekDeals = (allDeals ?? []).filter((d) => {
    const created = getValidDate(d.created_at);
    return created !== null && created >= d7;
  });
  const priorWeekDeals = (allDeals ?? []).filter((d) => {
    const created = getValidDate(d.created_at);
    return created !== null && created >= d14 && created < d7;
  });
  const newDealsPct =
    priorWeekDeals.length > 0
      ? Math.round(
          ((thisWeekDeals.length - priorWeekDeals.length) /
            priorWeekDeals.length) *
            100,
        )
      : null;

  return (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
    <div className="obs-interactive-row"
      role="button"
      tabIndex={0}
      onClick={() => redirect("/tasks")}
      onKeyDown={(e) => e.key === "Enter" && redirect("/tasks")}
      style={{
        padding: "16px 18px",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background:
          "linear-gradient(180deg, rgba(239,90,111,0.10) 0%, rgba(239,90,111,0.02) 100%)",
        border: "1px solid rgba(239,90,111,0.25)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            background: "rgba(239,90,111,0.18)",
            border: "1px solid rgba(239,90,111,0.35)",
            color: "var(--color-state-danger-dark)",
            flexShrink: 0,
          }}
        >
          <AlertCircle size={15} strokeWidth={2.3} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-state-danger-dark)",
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            Needs attention
          </div>
          <div
            style={{
              fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
              fontSize: 14.5,
              fontWeight: 700,
              color: "var(--color-text-primary-dark)",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ fontFamily: '"JetBrains Mono", ui-monospace' }}>
              {overdueTasksCount}
            </span>{" "}
            overdue tasks
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--color-text-subtle-dark)",
        }}
      >
        {overdueTasksCount > 0 ? "Blocking active deals" : "All clear"}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11.5,
          color: "var(--color-state-danger-dark)",
          fontWeight: 700,
          marginTop: "auto",
        }}
      >
        Clear queue <ArrowRight size={12} strokeWidth={2.5} />
      </div>
    </div>

    <ObsInsightCard
      accent="var(--color-accent-teal-dark)"
      icon={Zap}
      eyebrow="Trend"
      title={`${thisWeekDeals.length} new deal${thisWeekDeals.length === 1 ? "" : "s"} this week`}
      sub={
        newDealsPct !== null
          ? `${newDealsPct >= 0 ? "+" : ""}${newDealsPct}% vs last week`
          : "First week of data"
      }
      cta="Review deals"
      onClick={() => redirect("/deals")}
    />
  </div>
  );
};
