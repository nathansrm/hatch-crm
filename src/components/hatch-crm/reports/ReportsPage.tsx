import { useGetList } from "ra-core";
import {
  BarChart3,
  CircleDollarSign,
  Gauge,
  Target,
  Trophy,
} from "lucide-react";

import { HatchCard, HatchPageHeader, HatchPanel, HATCH } from "../_primitives";
import { OPEN_DEALS_FILTER } from "../deals/dealFilters";
import { formatCategory } from "../deals/dealFormatters";
import type { Deal, Sale } from "../types";

const REPORTS_DEALS_FILTER = {
  "archived_at@is": OPEN_DEALS_FILTER["archived_at@is"],
} as const;

const fmt = (n: number, compact = false) => {
  if (!compact) return `$${n.toLocaleString("en-CA")}`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

const fmtPct = (n: number) => `${Math.round(n)}%`;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const barColors = [
  "#4DC8E8",
  "#34D399",
  "#A78BFA",
  "#F5B84A",
  "#5EEAD4",
  "#EF5A6F",
  "#F5B84A",
];

const sectionHeadingClass =
  "text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C6784]";
const panelTitleClass = "font-heading text-sm font-bold text-[#ECEEF5]";

const getRateColor = (rate: number) => {
  if (rate >= 50) return "text-emerald-400";
  if (rate >= 30) return "text-amber-300";
  return "text-rose-400";
};

export const ReportsPage = () => {
  const { data: deals = [] } = useGetList<Deal>("deals", {
    filter: REPORTS_DEALS_FILTER,
    pagination: { page: 1, perPage: 2000 },
  });
  const { data: sales = [] } = useGetList<Sale>("sales", {
    pagination: { page: 1, perPage: 100 },
  });

  const won = deals.filter((d) => d.stage === "won");
  const lost = deals.filter((d) => d.stage === "lost");
  const active = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");

  const wonValue = won.reduce((a, d) => a + (d.amount ?? 0), 0);
  const pipelineValue = active.reduce((a, d) => a + (d.amount ?? 0), 0);
  const lostValue = lost.reduce((a, d) => a + (d.amount ?? 0), 0);
  const closedTotal = won.length + lost.length;
  const winRate = closedTotal > 0 ? (won.length / closedTotal) * 100 : 0;
  const avgDeal = won.length > 0 ? wonValue / won.length : 0;

  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const value = won
      .filter((deal) => {
        const cd = new Date(deal.expected_closing_date ?? deal.created_at);
        return cd.getFullYear() === y && cd.getMonth() === m;
      })
      .reduce((a, deal) => a + (deal.amount ?? 0), 0);
    return { month: MONTH_LABELS[m], value };
  });
  const maxBar = Math.max(...monthlyData.map((d) => d.value), 1);

  const repStats = sales.map((rep) => {
    const repDeals = deals.filter((d) => d.sales_id === rep.id);
    const repWon = repDeals.filter((d) => d.stage === "won");
    const repPipe = repDeals.filter(
      (d) => d.stage !== "won" && d.stage !== "lost",
    );
    const repClosed = repDeals.filter(
      (d) => d.stage === "won" || d.stage === "lost",
    );
    return {
      name: `${rep.first_name} ${rep.last_name}`,
      initials:
        `${rep.first_name?.[0] ?? ""}${rep.last_name?.[0] ?? ""}`.toUpperCase(),
      pipeline: repPipe.length,
      won: repWon.length,
      revenue: repWon.reduce((a, d) => a + (d.amount ?? 0), 0),
      rate: repClosed.length > 0 ? (repWon.length / repClosed.length) * 100 : 0,
    };
  });

  const categories = Array.from(
    new Set(deals.map((d) => d.category).filter(Boolean)),
  );
  const catStats = categories
    .map((cat) => {
      const catDeals = deals.filter((d) => d.category === cat);
      const catWon = catDeals.filter((d) => d.stage === "won");
      return {
        cat,
        won: catWon.length,
        value: catWon.reduce((a, d) => a + (d.amount ?? 0), 0),
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
  const maxCat = catStats[0]?.value ?? 1;

  const outcomeWonPct = closedTotal > 0 ? (won.length / closedTotal) * 100 : 50;
  const outcomeLostPct =
    closedTotal > 0 ? (lost.length / closedTotal) * 100 : 50;

  const kpis = [
    {
      label: "Closed Won",
      value: fmt(wonValue, true),
      sub: `${won.length} deal${won.length !== 1 ? "s" : ""}`,
      color: "#34D399",
      Icon: Trophy,
    },
    {
      label: "Pipeline",
      value: fmt(pipelineValue, true),
      sub: `${active.length} active`,
      color: "#4DC8E8",
      Icon: BarChart3,
    },
    {
      label: "Closed Lost",
      value: fmt(lostValue, true),
      sub: `${lost.length} deal${lost.length !== 1 ? "s" : ""}`,
      color: "#EF5A6F",
      Icon: Target,
    },
    {
      label: "Win Rate",
      value: fmtPct(winRate),
      sub: "closed deals",
      color: "#A78BFA",
      Icon: Gauge,
    },
    {
      label: "Avg Deal Size",
      value: fmt(avgDeal, true),
      sub: "closed won",
      color: "#F5B84A",
      Icon: CircleDollarSign,
    },
  ];

  return (
    <div
      className="hatch-scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto p-7"
      style={{ background: HATCH.surfaceDeep }}
    >
      <header className="pb-5">
        <HatchPageHeader
          eyebrow="Analytics"
          title="Reports"
          count={deals.length}
          countSuffix="open deal records"
          subline="Pipeline metrics and revenue breakdown"
        />
      </header>

      <main className="space-y-5">
        <section className="grid grid-cols-5 gap-3">
          {kpis.map(({ Icon, ...kpi }) => (
            <HatchCard
              key={kpi.label}
              padding="md"
              className="relative min-h-[132px] overflow-hidden"
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5"
                style={{
                  background: `linear-gradient(90deg, ${kpi.color} 0%, ${kpi.color}66 44%, transparent 100%)`,
                }}
              />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={sectionHeadingClass}>{kpi.label}</p>
                  <p className="font-heading mt-3 text-2xl font-bold text-[#ECEEF5]">
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#9AA3BE]">
                    {kpi.sub}
                  </p>
                </div>
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg border bg-[rgba(255,255,255,0.03)]"
                  style={{
                    borderColor: `${kpi.color}44`,
                    color: kpi.color,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
            </HatchCard>
          ))}
        </section>

        <section className="grid grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)] gap-5">
          <HatchPanel className="p-5">
            <PanelHeader eyebrow="Revenue Trend" title="Monthly closed won" />
            <div className="mt-5 grid h-[168px] grid-cols-6 items-end gap-2">
              {monthlyData.map((d, i) => {
                const h =
                  maxBar > 0
                    ? Math.max((d.value / maxBar) * 128, d.value > 0 ? 8 : 4)
                    : 4;
                const isLast = i === monthlyData.length - 1;
                return (
                  <div
                    key={d.month}
                    className="flex min-w-0 flex-col items-center"
                  >
                    <span
                      className={`font-mono mb-1 min-h-4 text-[10px] font-semibold ${
                        isLast ? "text-[#4DC8E8]" : "text-[#9AA3BE]"
                      }`}
                    >
                      {d.value > 0 ? fmt(d.value, true) : ""}
                    </span>
                    <div
                      className={`w-full rounded-t-md rounded-b-sm border ${
                        isLast
                          ? "border-[#4DC8E8]/40 shadow-[0_0_20px_rgba(77,200,232,0.24)]"
                          : "border-[rgba(255,255,255,0.06)]"
                      }`}
                      style={{
                        height: h,
                        background: isLast
                          ? "linear-gradient(180deg, var(--hatch-cyan) 0%, rgba(77,200,232,0.48) 100%)"
                          : "linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.055) 100%)",
                      }}
                    />
                    <span className="mt-2 text-[11px] font-semibold text-[#5C6784]">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </HatchPanel>

          <HatchPanel className="p-5">
            <PanelHeader eyebrow="Outcomes" title="Won vs lost" />
            <div className="mt-5">
              <div className="flex h-5 gap-0.5 overflow-hidden rounded-md bg-[rgba(255,255,255,0.035)]">
                <div
                  className="min-w-0 bg-gradient-to-r from-emerald-500 to-emerald-300 transition-[width]"
                  style={{
                    width: `${outcomeWonPct}%`,
                    minWidth: closedTotal > 0 && won.length > 0 ? 4 : 0,
                  }}
                />
                <div
                  className="min-w-0 bg-gradient-to-r from-rose-500 to-rose-300 transition-[width]"
                  style={{
                    width: `${outcomeLostPct}%`,
                    minWidth: closedTotal > 0 && lost.length > 0 ? 4 : 0,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-semibold">
                <span className="text-emerald-400">
                  Won {closedTotal > 0 ? fmtPct(outcomeWonPct) : "-"}
                </span>
                <span className="text-rose-400">
                  Lost {closedTotal > 0 ? fmtPct(outcomeLostPct) : "-"}
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { label: "Won", color: "#34D399", val: won.length },
                { label: "Lost", color: "#EF5A6F", val: lost.length },
                { label: "Active", color: "#4DC8E8", val: active.length },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] px-3 py-3 text-center"
                >
                  <span
                    className="mx-auto block h-1.5 w-8 rounded-full"
                    style={{ background: item.color }}
                  />
                  <p className="font-heading mt-3 text-2xl font-bold text-[#ECEEF5]">
                    {item.val}
                  </p>
                  <p className={sectionHeadingClass}>{item.label}</p>
                </div>
              ))}
            </div>
          </HatchPanel>
        </section>

        <section className="grid grid-cols-2 items-start gap-5">
          <HatchPanel className="p-5">
            <PanelHeader eyebrow="Team" title="Performance by rep" />
            {repStats.length === 0 ? (
              <EmptyState>No rep data yet.</EmptyState>
            ) : (
              <div className="mt-4">
                <div className="grid grid-cols-[minmax(160px,1.6fr)_0.7fr_0.7fr_0.9fr_0.7fr] gap-3 border-b border-[rgba(255,255,255,0.07)] px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5C6784]">
                  <span>Rep</span>
                  <span className="text-right">Pipe</span>
                  <span className="text-right">Won</span>
                  <span className="text-right">Revenue</span>
                  <span className="text-right">Rate</span>
                </div>
                <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {repStats.map((r) => (
                    <div
                      key={r.name}
                      className="grid grid-cols-[minmax(160px,1.6fr)_0.7fr_0.7fr_0.9fr_0.7fr] items-center gap-3 px-2 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="font-heading grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#243B55] text-[10px] font-bold text-[#ECEEF5] ring-1 ring-[rgba(255,255,255,0.12)]">
                          {r.initials}
                        </div>
                        <span className="truncate text-sm font-semibold text-[#ECEEF5]">
                          {r.name}
                        </span>
                      </div>
                      <span className="font-mono text-right text-xs text-[#B8C0D6]">
                        {r.pipeline}
                      </span>
                      <span className="font-mono text-right text-xs text-emerald-400">
                        {r.won}
                      </span>
                      <span className="font-mono text-right text-xs text-[#ECEEF5]">
                        {fmt(r.revenue, true)}
                      </span>
                      <span
                        className={`font-mono text-right text-xs font-bold ${getRateColor(r.rate)}`}
                      >
                        {fmtPct(r.rate)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </HatchPanel>

          <HatchPanel className="p-5">
            <PanelHeader eyebrow="Vertical" title="Revenue by category" />
            {catStats.length === 0 ? (
              <EmptyState>No category data yet.</EmptyState>
            ) : (
              <div className="mt-4 space-y-3">
                {catStats.map((t, i) => {
                  const color = barColors[i % barColors.length];
                  return (
                    <div
                      key={t.cat}
                      className="grid grid-cols-[150px_minmax(0,1fr)_72px_40px] items-center gap-3"
                    >
                      <span className="truncate text-sm font-medium text-[#B8C0D6]">
                        {formatCategory(t.cat ?? "")}
                      </span>
                      <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.035)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(t.value / maxCat) * 100}%`,
                            background: `linear-gradient(90deg, ${color}aa, ${color})`,
                            boxShadow: `0 0 12px ${color}40`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-right text-xs font-semibold text-[#ECEEF5]">
                        {t.value ? fmt(t.value, true) : "-"}
                      </span>
                      <span className="font-mono text-right text-xs text-[#9AA3BE]">
                        {t.won}W
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </HatchPanel>
        </section>
      </main>
    </div>
  );
};

const PanelHeader = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <div>
    <p className={sectionHeadingClass}>{eyebrow}</p>
    <h2 className={`${panelTitleClass} mt-1`}>{title}</h2>
  </div>
);

const EmptyState = ({ children }: { children: string }) => (
  <div className="mt-4 rounded-lg border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.025)] px-4 py-8 text-center text-sm text-[#9AA3BE]">
    {children}
  </div>
);

ReportsPage.path = "/reports";
