import { TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { useGetList } from "ra-core";

import type { Deal } from "../../types";
import { getValidDate, UNARCHIVED_DEALS_LIST_PARAMS } from "./dashboardUtils";

export const ObsKPIWon = () => {
  const { data: deals } = useGetList<Deal>(
    "deals",
    UNARCHIVED_DEALS_LIST_PARAMS,
  );
  const now = new Date();
  const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
  const qtdStart = new Date(now.getFullYear(), qStartMonth, 1);
  const priorQStart = new Date(now.getFullYear(), qStartMonth - 3, 1);

  const wonDeals = (deals ?? []).filter((d) => d.stage === "won");
  const qtdWon = wonDeals.filter((d) => {
    const ts = getValidDate(d.closed_at ?? d.updated_at);
    return ts !== null && ts >= qtdStart;
  });
  const priorQWon = wonDeals.filter((d) => {
    const ts = getValidDate(d.closed_at ?? d.updated_at);
    return ts !== null && ts >= priorQStart && ts < qtdStart;
  });
  const wonCount = qtdWon.length;
  const wonDelta = wonCount - priorQWon.length;

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 14,
        padding: "22px 24px",
        background:
          "linear-gradient(180deg, var(--color-surface-deep) 0%, var(--color-surface-deeper) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 40px rgba(0,0,0,0.35)",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--color-text-muted-dark)",
            fontWeight: 700,
          }}
        >
          Deals Won
        </span>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            display: "grid",
            placeItems: "center",
            background: "rgba(77,200,232,0.08)",
            border: "1px solid rgba(77,200,232,0.2)",
            color: "var(--chart-1)",
          }}
        >
          <Trophy size={13} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <div
          style={{
            fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--color-text-pure-white)",
          }}
        >
          {wonCount}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            padding: "5px 12px",
            borderRadius: 5,
            background: wonDelta >= 0 ? "rgba(52,211,153,0.15)" : "rgba(239,90,111,0.15)",
            border: wonDelta >= 0 ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(239,90,111,0.35)",
            color: wonDelta >= 0
              ? "var(--color-state-success-dark)"
              : "var(--color-state-danger-dark)",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {wonDelta >= 0 ? (
            <TrendingUp size={15} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={15} strokeWidth={2.5} />
          )}{" "}
          {wonDelta >= 0 ? "+" : ""}{wonDelta}
        </span>
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--color-text-muted-dark)",
          marginBottom: 16,
        }}
      >
        this quarter
      </div>

    </section>
  );
};
