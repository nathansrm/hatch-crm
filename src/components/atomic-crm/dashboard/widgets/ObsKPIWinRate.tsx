import { Percent, TrendingDown, TrendingUp } from "lucide-react";
import { useGetList } from "ra-core";

import type { Deal } from "../../types";
import { getValidDate, UNARCHIVED_DEALS_LIST_PARAMS } from "./dashboardUtils";

export const ObsKPIWinRate = () => {
  const { data: deals } = useGetList<Deal>(
    "deals",
    UNARCHIVED_DEALS_LIST_PARAMS,
  );
  const now = new Date();
  const t90 = new Date(now); t90.setDate(t90.getDate() - 90);
  const t180 = new Date(now); t180.setDate(t180.getDate() - 180);

  const isClosed = (d: Deal) => ["won", "lost"].includes(d.stage);
  const inWindow = (d: Deal, from: Date, to: Date) => {
    const ts = getValidDate(d.closed_at ?? d.updated_at);
    return ts !== null && ts >= from && ts < to;
  };

  const closedDeals = (deals ?? []).filter(
    (d) => isClosed(d) && inWindow(d, t90, now),
  );
  const priorClosed = (deals ?? []).filter(
    (d) => isClosed(d) && inWindow(d, t180, t90),
  );

  const winRate =
    closedDeals.length > 0
      ? Math.round(
          (closedDeals.filter((d) => d.stage === "won").length /
            closedDeals.length) *
            100,
        )
      : 0;
  const priorWinRate =
    priorClosed.length > 0
      ? Math.round(
          (priorClosed.filter((d) => d.stage === "won").length /
            priorClosed.length) *
            100,
        )
      : null;
  const winRateDelta =
    priorWinRate !== null ? winRate - priorWinRate : null;

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
          Win Rate
        </span>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            display: "grid",
            placeItems: "center",
            background: "rgba(167,139,250,0.08)",
            border: "1px solid rgba(167,139,250,0.2)",
            color: "var(--color-accent-violet-dark)",
          }}
        >
          <Percent size={13} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <div
              style={{
                fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                color: "var(--card)",
              }}
            >
              {closedDeals.length > 0 ? `${winRate}%` : "â€”"}
            </div>
            {winRateDelta !== null && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "5px 12px",
                  borderRadius: 5,
                  background: winRateDelta >= 0 ? "rgba(52,211,153,0.15)" : "rgba(239,90,111,0.15)",
                  border: winRateDelta >= 0 ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(239,90,111,0.35)",
                  color: winRateDelta >= 0
                    ? "var(--color-state-success-dark)"
                    : "var(--color-state-danger-dark)",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {winRateDelta >= 0 ? (
                  <TrendingUp size={15} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={15} strokeWidth={2.5} />
                )}{" "}
                {winRateDelta >= 0 ? "+" : ""}{winRateDelta}%
              </span>
            )}
          </div>
          <div
            style={{ fontSize: 11.5, color: "var(--color-text-muted-dark)" }}
          >
            trailing 90d
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <svg width={56} height={56} viewBox="0 0 56 56">
            <defs>
              <linearGradient id="winRateRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  stopColor="var(--color-accent-violet-dark)"
                />
                <stop offset="100%" stopColor="var(--chart-1)" />
              </linearGradient>
            </defs>
            <circle
              cx={28}
              cy={28}
              r={22}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={5}
            />
            <circle
              cx={28}
              cy={28}
              r={22}
              fill="none"
              stroke="url(#winRateRing)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 22}
              strokeDashoffset={2 * Math.PI * 22 * (1 - winRate / 100)}
              transform="rotate(-90 28 28)"
            />
          </svg>
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--color-text-muted-dark)",
          marginTop: "auto",
        }}
      >
        {closedDeals.length} deal{closedDeals.length === 1 ? "" : "s"} closed
        this period
      </div>
    </section>
  );
};
