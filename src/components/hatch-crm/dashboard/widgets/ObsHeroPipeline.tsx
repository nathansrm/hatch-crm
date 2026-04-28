import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useGetList } from "ra-core";

import { OPEN_DEALS_LIST_PARAMS } from "../../deals/dealFilters";
import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal } from "../../types";
import {
  getHeroEyebrow,
  getRangeWindow,
  getStagePalette,
  getValidDate,
  type HeroRange,
} from "./dashboardUtils";

export const ObsHeroPipeline = () => {
  const { currency, dealStages } = useConfigurationContext();
  const [range, setRange] = useState<HeroRange>("30d");
  const { data: deals } = useGetList<Deal>(
    "deals",
    OPEN_DEALS_LIST_PARAMS,
  );

  const { start, end, priorStart, priorEnd } = getRangeWindow(range);
  const pipelineStages = getStagePalette(dealStages);
  const allActiveDeals = deals ?? [];
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
  const stageStrip = pipelineStages.map((stage) => {
    const matches = activeDeals.filter((deal) => deal.stage === stage.value);
    const value = matches.reduce((sum, deal) => sum + (deal.amount ?? 0), 0);
    return {
      key: stage.value,
      label: stage.label,
      color: stage.color,
      count: matches.length,
      value,
    };
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
              className="font-heading"
              style={{
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
                  className="font-mono"
                  style={{
                    color: "#ECEEF5",
                    fontWeight: 600,
                  }}
                >
                  {totalCount}
                </span>{" "}
                open deals created in {range.toUpperCase()} across{" "}
                <span
                  className="font-mono"
                  style={{
                  color: "#ECEEF5",
                  fontWeight: 600,
                }}
              >
                  {populatedStages || stageStrip.length}
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
              title={`${stage.label} - ${stage.count}`}
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
                className="font-heading"
                style={{
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
