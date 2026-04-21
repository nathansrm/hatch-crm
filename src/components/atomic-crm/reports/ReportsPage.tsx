import { useGetList } from "ra-core";
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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  // Monthly revenue (last 6 months from won deals by expected_closing_date)
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

  // By rep
  const repStats = sales.map((rep) => {
    const repDeals = deals.filter((d) => d.sales_id === rep.id);
    const repWon = repDeals.filter((d) => d.stage === "won");
    const repPipe = repDeals.filter((d) => d.stage !== "won" && d.stage !== "lost");
    const repClosed = repDeals.filter((d) => d.stage === "won" || d.stage === "lost");
    return {
      name: `${rep.first_name} ${rep.last_name}`,
      initials: `${rep.first_name?.[0] ?? ""}${rep.last_name?.[0] ?? ""}`.toUpperCase(),
      pipeline: repPipe.length,
      won: repWon.length,
      revenue: repWon.reduce((a, d) => a + (d.amount ?? 0), 0),
      rate: repClosed.length > 0 ? (repWon.length / repClosed.length) * 100 : 0,
    };
  });

  // By category (trade)
  const categories = Array.from(new Set(deals.map((d) => d.category).filter(Boolean)));
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

  const kpis = [
    { label: "Closed Won", value: fmt(wonValue, true), sub: `${won.length} deal${won.length !== 1 ? "s" : ""}`, color: "#34D399" },
    { label: "Pipeline", value: fmt(pipelineValue, true), sub: `${active.length} active`, color: "#4DC8E8" },
    { label: "Closed Lost", value: fmt(lostValue, true), sub: `${lost.length} deal${lost.length !== 1 ? "s" : ""}`, color: "#EF5A6F" },
    { label: "Win Rate", value: fmtPct(winRate), sub: "closed deals", color: "#A78BFA" },
    { label: "Avg Deal Size", value: fmt(avgDeal, true), sub: "closed won", color: "#F5B84A" },
  ];

  const barColors = ["#4DC8E8", "#34D399", "#A78BFA", "#F5B84A", "#5EEAD4", "#EF5A6F", "#F5B84A"];

  return (
    <div style={{ flex: 1, overflowY: "auto", minHeight: 0, background: "#060A16" }}>
      {/* Page header */}
      <div style={{ padding: "24px 28px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#4DC8E8", fontWeight: 700 }}>
            Analytics
          </span>
          <span style={{ height: 1, width: 24, background: "rgba(77,200,232,0.4)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: '"Manrope Variable", ui-sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#ECEEF5" }}>
              Reports
            </h1>
            <p style={{ margin: "4px 0 0", color: "#6B7494", fontSize: 13 }}>Pipeline metrics and revenue breakdown</p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ padding: "0 28px 20px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ padding: "16px 20px", borderRadius: 12, background: "#0D1424", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${k.color} 0%, ${k.color}44 50%, transparent 100%)` }} />
            <div style={{ fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700, marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontFamily: '"Manrope Variable", ui-sans-serif', fontSize: 26, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#4A5270" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 28px 28px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        {/* Revenue bar chart */}
        <div style={{ padding: "20px 24px", borderRadius: 12, background: "#0D1424", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700, marginBottom: 4 }}>Revenue trend</div>
          <div style={{ fontFamily: '"Manrope Variable", ui-sans-serif', fontSize: 15, fontWeight: 700, color: "#ECEEF5", marginBottom: 16 }}>Monthly closed won</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, padding: "0 4px" }}>
            {monthlyData.map((d, i) => {
              const h = maxBar > 0 ? Math.max((d.value / maxBar) * 120, d.value > 0 ? 6 : 0) : 0;
              const isLast = i === monthlyData.length - 1;
              return (
                <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontFamily: '"JetBrains Mono", ui-monospace', fontSize: 9.5, color: isLast ? "#4DC8E8" : "#4A5270", marginBottom: 4, fontWeight: 600 }}>
                    {d.value > 0 ? fmt(d.value, true) : ""}
                  </div>
                  <div style={{
                    width: "100%", height: h || 4, borderRadius: "5px 5px 2px 2px",
                    background: isLast ? "linear-gradient(180deg, #4DC8E8 0%, rgba(77,200,232,0.5) 100%)" : "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
                    boxShadow: isLast ? "0 0 20px rgba(77,200,232,0.3)" : "none",
                    border: isLast ? "1px solid rgba(77,200,232,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  }} />
                  <div style={{ fontSize: 10, color: "#4A5270", marginTop: 6, fontWeight: 600 }}>{d.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Won vs Lost */}
        <div style={{ padding: "20px 24px", borderRadius: 12, background: "#0D1424", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700, marginBottom: 4 }}>Outcomes</div>
          <div style={{ fontFamily: '"Manrope Variable", ui-sans-serif', fontSize: 15, fontWeight: 700, color: "#ECEEF5", marginBottom: 20 }}>Won vs Lost</div>
          <div>
            <div style={{ display: "flex", height: 20, borderRadius: 6, overflow: "hidden", gap: 2 }}>
              <div style={{ width: `${closedTotal > 0 ? (won.length / closedTotal) * 100 : 50}%`, background: "linear-gradient(90deg, #22C55E, #34D399)", transition: "width .6s", minWidth: closedTotal > 0 && won.length > 0 ? 4 : 0 }} />
              <div style={{ flex: 1, background: "linear-gradient(90deg, #EF5A6F, #F87191)", minWidth: closedTotal > 0 && lost.length > 0 ? 4 : 0 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5, fontWeight: 600 }}>
              <span style={{ color: "#34D399" }}>Won {closedTotal > 0 ? fmtPct((won.length / closedTotal) * 100) : "—"}</span>
              <span style={{ color: "#EF5A6F" }}>Lost {closedTotal > 0 ? fmtPct((lost.length / closedTotal) * 100) : "—"}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 24 }}>
            {[{ label: "Won", color: "#34D399", val: won.length }, { label: "Lost", color: "#EF5A6F", val: lost.length }, { label: "Active", color: "#4DC8E8", val: active.length }].map((item) => (
              <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: item.color }} />
                <span style={{ fontFamily: '"Manrope Variable", ui-sans-serif', fontSize: 28, fontWeight: 700, color: "#FFFFFF" }}>{item.val}</span>
                <span style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 28px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* By rep */}
        <div style={{ padding: "20px 24px", borderRadius: 12, background: "#0D1424", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700, marginBottom: 4 }}>Team</div>
          <div style={{ fontFamily: '"Manrope Variable", ui-sans-serif', fontSize: 15, fontWeight: 700, color: "#ECEEF5", marginBottom: 16 }}>Performance by rep</div>
          {repStats.length === 0 ? (
            <div style={{ color: "#4A5270", fontSize: 13, padding: "20px 0" }}>No rep data yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 12, padding: "8px 4px", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 6 }}>
                <div>Rep</div><div style={{ textAlign: "right" }}>Pipe</div><div style={{ textAlign: "right" }}>Won</div><div style={{ textAlign: "right" }}>Revenue</div><div style={{ textAlign: "right" }}>Rate</div>
              </div>
              {repStats.map((r) => (
                <div key={r.name} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 12, padding: "10px 4px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "oklch(0.55 0.13 220)", display: "grid", placeItems: "center", fontFamily: '"Manrope Variable", ui-sans-serif', fontWeight: 700, fontSize: 10, color: "#FFFFFF", flexShrink: 0 }}>{r.initials}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#ECEEF5" }}>{r.name}</span>
                  </div>
                  <div style={{ fontFamily: '"JetBrains Mono", ui-monospace', fontSize: 12, color: "#ECEEF5", textAlign: "right" }}>{r.pipeline}</div>
                  <div style={{ fontFamily: '"JetBrains Mono", ui-monospace', fontSize: 12, color: "#34D399", textAlign: "right" }}>{r.won}</div>
                  <div style={{ fontFamily: '"JetBrains Mono", ui-monospace', fontSize: 12, color: "#ECEEF5", textAlign: "right" }}>{fmt(r.revenue, true)}</div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.rate >= 50 ? "#34D399" : r.rate >= 30 ? "#F5B84A" : "#EF5A6F", fontFamily: '"JetBrains Mono", ui-monospace' }}>{fmtPct(r.rate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By category */}
        <div style={{ padding: "20px 24px", borderRadius: 12, background: "#0D1424", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700, marginBottom: 4 }}>Vertical</div>
          <div style={{ fontFamily: '"Manrope Variable", ui-sans-serif', fontSize: 15, fontWeight: 700, color: "#ECEEF5", marginBottom: 16 }}>Revenue by category</div>
          {catStats.length === 0 ? (
            <div style={{ color: "#4A5270", fontSize: 13, padding: "20px 0" }}>No category data yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {catStats.map((t, i) => {
                const color = barColors[i % barColors.length];
                return (
                  <div key={t.cat} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 90, fontSize: 12, color: "#9AA3BE", fontWeight: 500, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{formatCategory(t.cat ?? "")}</div>
                    <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.03)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(t.value / maxCat) * 100}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: 4, boxShadow: `0 0 12px ${color}44` }} />
                    </div>
                    <div style={{ fontFamily: '"JetBrains Mono", ui-monospace', fontSize: 11.5, color: "#ECEEF5", fontWeight: 600, width: 56, textAlign: "right" }}>{t.value ? fmt(t.value, true) : "—"}</div>
                    <div style={{ fontFamily: '"JetBrains Mono", ui-monospace', fontSize: 11, color: "#4A5270", width: 24, textAlign: "right" }}>{t.won}W</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ReportsPage.path = "/reports";
