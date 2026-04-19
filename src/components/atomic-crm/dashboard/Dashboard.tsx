import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Flame,
  Percent,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGetIdentity, useGetList, useRedirect } from "ra-core";
import { useSearchParams } from "react-router";

import { getDealDecayLevel } from "../deals/dealUtils";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact, ContactNote, Deal, Task } from "../types";
import { DeliveryDashboard } from "./DeliveryDashboard";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { StaleDeals } from "./StaleDeals";
import { TasksList } from "./TasksList";

const DASHBOARD_VIEW_STORAGE_KEY = "crm_dashboard_tab";

type DashboardView = "dashboard" | "delivery";

const normalizeDashboardView = (value: string | null): DashboardView | null => {
  if (value === "dashboard" || value === "delivery") {
    return value;
  }

  if (value === "pipeline") {
    return "dashboard";
  }

  return null;
};

const getTodayDateKey = () => {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const getDateKey = (value?: string | null) => value?.slice(0, 10) ?? null;

const getValidDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Keep these params identical across the dashboard KPI cards so react-admin can
// dedupe the shared "deals" fetch instead of issuing parallel equivalent queries.
const UNARCHIVED_DEALS_LIST_PARAMS = {
  pagination: { page: 1, perPage: 10000 },
  filter: { "archived_at@is": null },
} as const;

const DashboardOverview = ({ totalDeal }: { totalDeal?: number }) => {
  void totalDeal;

  const { identity } = useGetIdentity();
  const todayKey = getTodayDateKey();

  const { data: tasks } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: 500 },
      sort: { field: "due_date", order: "ASC" },
      filter: { "done_date@is": null, sales_id: identity?.id },
    },
    { enabled: identity?.id != null },
  );

  const overdueTasksCount =
    tasks?.filter((task) => {
      const dueDateKey = getDateKey(task.due_date);
      return dueDateKey != null && dueDateKey < todayKey;
    }).length ?? 0;

  return (
    <main
      style={{
        padding: "28px 32px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: "#060A16",
        overflowY: "auto",
        minHeight: 0,
        flex: 1,
      }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}
      >
        <ObsHeroPipeline />
        <ObsKPIWon />
        <ObsKPIWinRate />
      </div>
      <ObsAttentionRow overdueTasksCount={overdueTasksCount} />
      <ObsHotDealsPanel />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1.3fr 1fr",
          gap: 14,
        }}
      >
        <TasksList />
        <DashboardActivityLog />
        <StaleDeals />
      </div>
    </main>
  );
};

const PIPELINE_STAGES: Array<{ key: string; label: string; color: string }> = [
  { key: "lead", label: "Lead", color: "#4DC8E8" },
  { key: "qualified", label: "Qualified", color: "#A78BFA" },
  { key: "audit-scheduled", label: "Audit Scheduled", color: "#5EEAD4" },
  { key: "proposal-sent", label: "Proposal Sent", color: "#F5B84A" },
];

type HeroRange = "30d" | "qtd" | "ytd";

const getRangeWindow = (range: HeroRange) => {
  const now = new Date();
  if (range === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    const priorStart = new Date(now);
    priorStart.setDate(priorStart.getDate() - 60);
    return { start, end: now, priorStart, priorEnd: new Date(start) };
  }
  if (range === "qtd") {
    const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), qStartMonth, 1);
    const priorStart = new Date(now.getFullYear(), qStartMonth - 3, 1);
    return { start, end: now, priorStart, priorEnd: new Date(start) };
  }
  const start = new Date(now.getFullYear(), 0, 1);
  return {
    start,
    end: now,
    priorStart: new Date(now.getFullYear() - 1, 0, 1),
    priorEnd: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
  };
};

const getHeroEyebrow = (range: HeroRange) => {
  const now = new Date();
  if (range === "30d") return "Pipeline Value · Created in Last 30 Days";
  if (range === "ytd") return `Pipeline Value · Created YTD ${now.getFullYear()}`;
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `Pipeline Value · Created in Q${q} ${now.getFullYear()}`;
};

const ObsHeroPipeline = () => {
  const { currency } = useConfigurationContext();
  const [range, setRange] = useState<HeroRange>("30d");
  const { data: deals } = useGetList<Deal>(
    "deals",
    UNARCHIVED_DEALS_LIST_PARAMS,
  );

  const { start, end, priorStart, priorEnd } = getRangeWindow(range);
  const allActiveDeals = (deals ?? []).filter(
    (deal) => !["won", "lost"].includes(deal.stage),
  );
  const activeDeals = allActiveDeals.filter((deal) => {
    const created = getValidDate(deal.created_at);
    return created !== null && created >= start && created <= end;
  });
  const priorDeals = allActiveDeals.filter((deal) => {
    const created = getValidDate(deal.created_at);
    return created !== null && created >= priorStart && created < priorEnd;
  });
  const pipelineValue = activeDeals.reduce(
    (sum, deal) => sum + (deal.amount ?? 0),
    0,
  );
  const priorValue = priorDeals.reduce(
    (sum, deal) => sum + (deal.amount ?? 0),
    0,
  );
  const growthPct =
    priorValue > 0
      ? Math.round(((pipelineValue - priorValue) / priorValue) * 100)
      : null;
  const totalCount = activeDeals.length;
  const stageStrip = PIPELINE_STAGES.map((stage) => {
    const matches = activeDeals.filter((deal) => deal.stage === stage.key);
    const value = matches.reduce((sum, deal) => sum + (deal.amount ?? 0), 0);
    return { ...stage, count: matches.length, value };
  });
  const populatedStages = stageStrip.filter((stage) => stage.count > 0).length;

  const fmt = (value: number) =>
    value.toLocaleString(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 14,
        padding: "26px 28px",
        background:
          "radial-gradient(ellipse at top right, rgba(77,200,232,0.18) 0%, transparent 55%), linear-gradient(180deg, #0F2554 0%, #0A1B3D 55%, #060D22 100%)",
        border: "1px solid rgba(77,200,232,0.22)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 40px rgba(0,0,0,0.4)",
        minHeight: 220,
      }}
    >
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.12,
          pointerEvents: "none",
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(77,200,232,0.5)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-grid)" />
      </svg>
      <div style={{ position: "relative" }}>
        {/* Eyebrow + range toggle */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#4DC8E8",
              boxShadow: "0 0 12px #4DC8E8",
            }}
          />
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#4DC8E8",
              fontWeight: 700,
            }}
          >
            {getHeroEyebrow(range)}
          </span>
          <span
            style={{
              flex: 1,
              height: 1,
              background:
                "linear-gradient(90deg, rgba(77,200,232,0.3), transparent)",
            }}
          />
          <div
            style={{
              display: "inline-flex",
              padding: 3,
              borderRadius: 7,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
              gap: 2,
            }}
          >
            {(["30d", "qtd", "ytd"] as const).map((option) => {
              const active = option === range;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: active ? "#ECEEF5" : "#5C6784",
                    background: active
                      ? "linear-gradient(180deg, rgba(77,200,232,0.25) 0%, rgba(77,200,232,0.05) 100%)"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(77,200,232,0.35)"
                      : "1px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {option.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big money + delta */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
          <div>
            <div
              style={{
                fontFamily:
                  "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                fontSize: 62,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                lineHeight: 0.95,
                color: "#FFFFFF",
                textShadow: "0 2px 20px rgba(77,200,232,0.2)",
              }}
            >
              {fmt(pipelineValue)}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
              }}
            >
              {growthPct !== null ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: growthPct >= 0 ? "rgba(52,211,153,0.15)" : "rgba(239,90,111,0.15)",
                    border: growthPct >= 0 ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(239,90,111,0.35)",
                    color: growthPct >= 0 ? "#34D399" : "#EF5A6F",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {growthPct >= 0 ? (
                    <TrendingUp size={13} strokeWidth={2.5} />
                  ) : (
                    <TrendingDown size={13} strokeWidth={2.5} />
                  )}
                  {growthPct >= 0 ? "+" : ""}{growthPct}% vs prior period
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#5C6784",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  No prior period data
                </span>
              )}
              <span style={{ fontSize: 12, color: "#9AA3BE" }}>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", ui-monospace',
                    color: "#ECEEF5",
                    fontWeight: 600,
                  }}
                >
                  {totalCount}
                </span>{" "}
                open deals created in this period across{" "}
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", ui-monospace',
                    color: "#ECEEF5",
                    fontWeight: 600,
                  }}
                >
                  {populatedStages || PIPELINE_STAGES.length}
                </span>{" "}
                stages
              </span>
            </div>
          </div>
        </div>

        {/* Stage strip (gradient bar) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            marginTop: 22,
            borderRadius: 6,
            overflow: "hidden",
            height: 10,
            background: "rgba(0,0,0,0.3)",
          }}
        >
          {stageStrip.map((stage) => (
            <div
              key={stage.key}
              title={`${stage.label} — ${stage.count}`}
              style={{
                flex: stage.value || stage.count || 1,
                background: `linear-gradient(180deg, ${stage.color} 0%, ${stage.color}aa 100%)`,
                boxShadow: `0 0 20px ${stage.color}66`,
                borderRight: "1px solid rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>

        {/* Per-stage counts */}
        <div
          style={{
            display: "flex",
            marginTop: 10,
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {stageStrip.map((stage) => (
            <div
              key={stage.key}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: stage.color,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#5C6784",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {stage.label}
                </span>
              </div>
              <div
                style={{
                  fontFamily:
                    "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ECEEF5",
                }}
              >
                {stage.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WON_GOAL = 10;

const ObsKPIWon = () => {
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
    // TODO: Replace this updated_at proxy with a real deals.closed_at column.
    const ts = getValidDate(d.updated_at);
    return ts !== null && ts >= qtdStart;
  });
  const priorQWon = wonDeals.filter((d) => {
    // TODO: Replace this updated_at proxy with a real deals.closed_at column.
    const ts = getValidDate(d.updated_at);
    return ts !== null && ts >= priorQStart && ts < qtdStart;
  });
  const wonCount = qtdWon.length;
  const wonDelta = wonCount - priorQWon.length;
  const filled = Math.min(wonCount, WON_GOAL);

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 14,
        padding: "22px 24px",
        background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
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
            color: "#5C6784",
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
            color: "#4DC8E8",
          }}
        >
          <Trophy size={13} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <div
          style={{
            fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "#FFFFFF",
          }}
        >
          {wonCount}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            padding: "3px 8px",
            borderRadius: 5,
            background: wonDelta >= 0 ? "rgba(52,211,153,0.15)" : "rgba(239,90,111,0.15)",
            border: wonDelta >= 0 ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(239,90,111,0.35)",
            color: wonDelta >= 0 ? "#34D399" : "#EF5A6F",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {wonDelta >= 0 ? (
            <TrendingUp size={11} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={11} strokeWidth={2.5} />
          )}{" "}
          {wonDelta >= 0 ? "+" : ""}{wonDelta}
        </span>
      </div>
      <div style={{ fontSize: 11.5, color: "#5C6784", marginBottom: 16 }}>this quarter</div>

      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            display: "flex",
            gap: 3,
            marginBottom: 8,
          }}
        >
          {Array.from({ length: WON_GOAL }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 2,
                background:
                  i < filled
                    ? "linear-gradient(90deg, #4DC8E8 0%, #34D399 100%)"
                    : "rgba(255,255,255,0.06)",
                boxShadow: i < filled ? "0 0 6px rgba(77,200,232,0.4)" : "none",
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: "#5C6784",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace',
              color: "#ECEEF5",
            }}
          >
            {filled}
          </span>{" "}
          of {WON_GOAL} goal
        </div>
      </div>
    </section>
  );
};

const ObsKPIWinRate = () => {
  const { data: deals } = useGetList<Deal>(
    "deals",
    UNARCHIVED_DEALS_LIST_PARAMS,
  );
  const now = new Date();
  const t90 = new Date(now); t90.setDate(t90.getDate() - 90);
  const t180 = new Date(now); t180.setDate(t180.getDate() - 180);

  const isClosed = (d: Deal) => ["won", "lost"].includes(d.stage);
  const inWindow = (d: Deal, from: Date, to: Date) => {
    // TODO: Replace this updated_at proxy with a real deals.closed_at column.
    const ts = getValidDate(d.updated_at);
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
        background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
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
            color: "#5C6784",
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
            color: "#A78BFA",
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
                fontSize: 46,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                color: "#FFFFFF",
              }}
            >
              {closedDeals.length > 0 ? `${winRate}%` : "—"}
            </div>
            {winRateDelta !== null && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: winRateDelta >= 0 ? "rgba(52,211,153,0.15)" : "rgba(239,90,111,0.15)",
                  border: winRateDelta >= 0 ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(239,90,111,0.35)",
                  color: winRateDelta >= 0 ? "#34D399" : "#EF5A6F",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {winRateDelta >= 0 ? (
                  <TrendingUp size={11} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={11} strokeWidth={2.5} />
                )}{" "}
                {winRateDelta >= 0 ? "+" : ""}{winRateDelta}%
              </span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: "#5C6784" }}>trailing 90d</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <svg width={56} height={56} viewBox="0 0 56 56">
            <defs>
              <linearGradient id="winRateRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#4DC8E8" />
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

      <div style={{ marginTop: "auto", paddingTop: 16 }}>
        <div
          style={{
            fontSize: 10.5,
            color: "#5C6784",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 3,
          }}
        >
          Industry avg{" "}
          <span style={{ fontFamily: '"JetBrains Mono", ui-monospace', color: "#9AA3BE" }}>
            32%
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#34D399", fontWeight: 600 }}>
          +{Math.max(0, winRate - 32)} pts above
        </div>
      </div>
    </section>
  );
};

const ObsInsightCard = ({
  accent,
  icon: Icon,
  eyebrow,
  title,
  sub,
  cta,
  onClick,
}: {
  accent: string;
  icon: typeof Flame;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  onClick?: () => void;
}) => (
  <div
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    style={{
      padding: "16px 18px",
      borderRadius: 10,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      background: `linear-gradient(180deg, ${accent}0F 0%, ${accent}03 100%)`,
      border: `1px solid ${accent}2A`,
      cursor: onClick ? "pointer" : "default",
      outline: "none",
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
          background: `${accent}1F`,
          border: `1px solid ${accent}40`,
          color: accent,
          flexShrink: 0,
        }}
      >
        <Icon size={15} strokeWidth={2.3} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent,
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
            fontSize: 14.5,
            fontWeight: 700,
            color: "#ECEEF5",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
      </div>
    </div>
    <div style={{ fontSize: 11.5, color: "#9AA3BE" }}>{sub}</div>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11.5,
        color: accent,
        fontWeight: 700,
        marginTop: "auto",
      }}
    >
      {cta} <ArrowRight size={12} strokeWidth={2.5} />
    </div>
  </div>
);

const ObsAttentionRow = ({
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

  const oldestProposalDeal = (allDeals ?? [])
    .filter((deal) => deal.stage === "proposal-sent")
    .map((deal) => ({
      deal,
      updatedAt: getValidDate(deal.updated_at),
    }))
    .filter(
      (candidate): candidate is { deal: Deal; updatedAt: Date } =>
        candidate.updatedAt !== null,
    )
    .sort((left, right) => left.updatedAt.getTime() - right.updatedAt.getTime())[0];
  const staleDaysRaw = oldestProposalDeal
    ? Math.floor(
        (now.getTime() - oldestProposalDeal.updatedAt.getTime()) / 86400000,
      )
    : null;
  const staleDeal =
    oldestProposalDeal !== undefined && staleDaysRaw !== null && staleDaysRaw >= 1
      ? oldestProposalDeal.deal
      : null;
  const staleDays =
    staleDeal !== null && staleDaysRaw !== null ? staleDaysRaw : null;

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
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
    <div
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
        outline: "none",
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
            color: "#EF5A6F",
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
              color: "#EF5A6F",
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
              color: "#ECEEF5",
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
      <div style={{ fontSize: 11.5, color: "#9AA3BE" }}>{overdueTasksCount > 0 ? "Blocking active deals" : "All clear"}</div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11.5,
          color: "#EF5A6F",
          fontWeight: 700,
          marginTop: "auto",
        }}
      >
        Clear queue <ArrowRight size={12} strokeWidth={2.5} />
      </div>
    </div>

    <ObsInsightCard
      accent="#F5B84A"
      icon={Flame}
      eyebrow="Watch"
      title={staleDeal ? staleDeal.name : "No stale deals"}
      sub={
        staleDeal && staleDays !== null
          ? `Proposal sent · waiting ${staleDays} day${staleDays === 1 ? "" : "s"}`
          : "All proposal-sent deals are moving"
      }
      cta={staleDeal ? "Follow up" : "Review pipeline"}
      onClick={() =>
        redirect(staleDeal ? `/deals/${staleDeal.id}/show` : "/deals")
      }
    />
    <ObsInsightCard
      accent="#5EEAD4"
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

const AVATAR_COLORS = ["#4DC8E8", "#A78BFA", "#F5B84A", "#34D399", "#EF5A6F"];

const ObsHotDealsPanel = () => {
  const { currency } = useConfigurationContext();
  const { data: deals } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: "amount", order: "DESC" },
    filter: { "archived_at@is": null },
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
                gridTemplateColumns: "40px 2fr 1.2fr 1fr 1fr 40px",
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
              <div style={{ fontSize: 12, color: "#9AA3BE" }}>
                {fmtRel(deal.updated_at)}
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

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashboardView>("dashboard");
  const {
    data: dataContact,
    total: totalContact,
    isPending: isPendingContact,
  } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 1 },
  });

  const { total: totalContactNotes, isPending: isPendingContactNotes } =
    useGetList<ContactNote>("contact_notes", {
      pagination: { page: 1, perPage: 1 },
    });

  const { total: totalDeal, isPending: isPendingDeal } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: 1 },
    },
  );

  const isPending = isPendingContact || isPendingContactNotes || isPendingDeal;

  useEffect(() => {
    const urlView = normalizeDashboardView(searchParams.get("view"));
    const storedView =
      typeof window === "undefined"
        ? null
        : normalizeDashboardView(
            window.localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY),
          );
    const nextView = urlView ?? storedView ?? "dashboard";

    setActiveTab((currentTab) =>
      currentTab === nextView ? currentTab : nextView,
    );

    if (searchParams.get("view") === nextView) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("view", nextView);
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const handleTabChange = (nextValue: string) => {
    const nextView = normalizeDashboardView(nextValue) ?? "dashboard";
    setActiveTab(nextView);

    if (searchParams.get("view") === nextView) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("view", nextView);
    setSearchParams(nextSearchParams, { replace: true });
  };

  if (isPending) {
    return null;
  }

  if (!totalContact) {
    return <DashboardStepper step={1} />;
  }

  if (!totalContactNotes) {
    return <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        background: "#060A16",
      }}
    >
      <div
        style={{
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "#060A16",
          flexShrink: 0,
        }}
      >
        {(["dashboard", "delivery"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            style={{
              padding: "12px 18px",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "capitalize",
              color: activeTab === tab ? "#ECEEF5" : "#5C6784",
              borderBottom:
                activeTab === tab
                  ? "2px solid #4DC8E8"
                  : "2px solid transparent",
              marginBottom: -1,
              background: "transparent",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              borderBottomColor:
                activeTab === tab ? "#4DC8E8" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "dashboard" && <DashboardOverview totalDeal={totalDeal} />}
      {activeTab === "delivery" && <DeliveryDashboard />}
    </div>
  );
};
