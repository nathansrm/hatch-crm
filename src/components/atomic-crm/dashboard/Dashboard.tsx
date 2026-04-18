import {
  AlertTriangle,
  ChevronRight,
  Clock,
  Percent,
  Trophy,
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
const TERMINAL_STAGES = ["won", "lost"];

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

const DashboardOverview = ({ totalDeal }: { totalDeal?: number }) => {
  void totalDeal;

  const { identity } = useGetIdentity();
  const todayKey = getTodayDateKey();

  const { data: deals } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 500 },
    filter: { "archived_at@is": null },
  });

  const { data: tasks } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: 500 },
      sort: { field: "due_date", order: "ASC" },
      filter: { "done_date@is": null, sales_id: identity?.id },
    },
    { enabled: identity?.id != null },
  );

  const staleDealsCount =
    deals
      ?.filter((deal) => !TERMINAL_STAGES.includes(deal.stage))
      .filter((deal) => getDealDecayLevel(deal) !== "none").length ?? 0;

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
      <ObsAttentionRow
        overdueTasksCount={overdueTasksCount}
        staleDealsCount={staleDealsCount}
      />
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

const ObsHeroPipeline = () => {
  const { currency } = useConfigurationContext();
  const { data: deals } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
    filter: { "archived_at@is": null },
  });

  const activeDeals = (deals ?? []).filter(
    (deal) => !["won", "lost"].includes(deal.stage),
  );
  const pipelineValue = activeDeals.reduce(
    (sum, deal) => sum + (deal.amount ?? 0),
    0,
  );
  const totalCount = activeDeals.length;

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
            Pipeline Value - Active
          </span>
        </div>
        <div
          style={{
            fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 0.95,
            color: "#FFFFFF",
            textShadow: "0 2px 20px rgba(77,200,232,0.2)",
            marginBottom: 12,
          }}
        >
          {fmt(pipelineValue)}
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}
        >
          <span
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace',
              fontSize: 12,
              color: "#9AA3BE",
            }}
          >
            <span style={{ color: "#ECEEF5", fontWeight: 600 }}>{totalCount}</span>{" "}
            active deals
          </span>
        </div>
      </div>
    </section>
  );
};

const ObsKPIWon = () => {
  const { data: deals } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });
  const wonCount = (deals ?? []).filter((deal) => deal.stage === "won").length;

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
      <div
        style={{
          fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: "#FFFFFF",
          marginBottom: 6,
        }}
      >
        {wonCount}
      </div>
      <div style={{ fontSize: 11.5, color: "#5C6784" }}>total closed won</div>
    </section>
  );
};

const ObsKPIWinRate = () => {
  const { data: deals } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });
  const closedDeals = (deals ?? []).filter((deal) =>
    ["won", "lost"].includes(deal.stage),
  );
  const wonDeals = closedDeals.filter((deal) => deal.stage === "won");
  const winRate =
    closedDeals.length > 0
      ? Math.round((wonDeals.length / closedDeals.length) * 100)
      : 0;

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
      <div
        style={{
          fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: "#FFFFFF",
          marginBottom: 6,
        }}
      >
        {closedDeals.length > 0 ? `${winRate}%` : "-"}
      </div>
      <div style={{ fontSize: 11.5, color: "#5C6784" }}>
        {closedDeals.length} closed deals
      </div>
    </section>
  );
};

const ObsAttentionRow = ({
  overdueTasksCount,
  staleDealsCount,
}: {
  overdueTasksCount: number;
  staleDealsCount: number;
}) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
    <div
      style={{
        padding: "16px 20px",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background:
          "linear-gradient(90deg, rgba(239,90,111,0.12) 0%, rgba(239,90,111,0.03) 100%)",
        border: "1px solid rgba(239,90,111,0.25)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "rgba(239,90,111,0.18)",
          border: "1px solid rgba(239,90,111,0.35)",
          color: "#EF5A6F",
        }}
      >
        <AlertTriangle size={20} strokeWidth={2.2} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#EF5A6F",
            fontWeight: 700,
            marginBottom: 3,
          }}
        >
          Needs attention
        </div>
        <div
          style={{
            fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
            fontSize: 17,
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
    <div
      style={{
        padding: "16px 20px",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background:
          "linear-gradient(90deg, rgba(245,184,74,0.08) 0%, rgba(245,184,74,0.02) 100%)",
        border: "1px solid rgba(245,184,74,0.2)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "rgba(245,184,74,0.12)",
          border: "1px solid rgba(245,184,74,0.3)",
          color: "#F5B84A",
        }}
      >
        <Clock size={20} strokeWidth={2.2} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#F5B84A",
            fontWeight: 700,
            marginBottom: 3,
          }}
        >
          Stale pipeline
        </div>
        <div
          style={{
            fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
            fontSize: 17,
            fontWeight: 700,
            color: "#ECEEF5",
            letterSpacing: "-0.01em",
          }}
        >
          <span style={{ fontFamily: '"JetBrains Mono", ui-monospace' }}>
            {staleDealsCount}
          </span>{" "}
          deals need follow-up
        </div>
      </div>
    </div>
  </div>
);

const ObsHotDealsPanel = () => {
  const { currency } = useConfigurationContext();
  const { data: deals } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: "amount", order: "DESC" },
    filter: { "archived_at@is": null },
  });
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
    audit: "#5EEAD4",
    proposal: "#F5B84A",
    negotiation: "#F5B84A",
    won: "#34D399",
    lost: "#EF5A6F",
  };

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
            Top opportunities{" "}
            <span style={{ color: "#5C6784", fontWeight: 500, fontSize: 16 }}>
              by pipeline value
            </span>
          </h2>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {hotDeals.map((deal, index) => {
          const color = stageColor[deal.stage] ?? "#9AA3BE";
          return (
            <div
              key={deal.id}
              onClick={() => redirect(`/deals/${deal.id}/show`)}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 2fr 1fr 1fr 1fr 24px",
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
                  fontFamily: '"JetBrains Mono", ui-monospace',
                  fontSize: 11,
                  color: "#3A4362",
                  fontWeight: 600,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <div
                  style={{
                    fontFamily:
                      "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#ECEEF5",
                    letterSpacing: "-0.01em",
                    marginBottom: 2,
                  }}
                >
                  {deal.name}
                </div>
                <div style={{ fontSize: 11.5, color: "#5C6784" }}>{deal.stage}</div>
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
                  background: `${color}12`,
                  border: `1px solid ${color}33`,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {deal.stage}
              </div>
              <div
                style={{
                  fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.01em",
                }}
              >
                {fmt(deal.amount ?? 0)}
              </div>
              <div style={{ fontSize: 12, color: "#9AA3BE" }}>
                {fmtRel(deal.updated_at)}
              </div>
              <div
                style={{ color: "#3A4362", display: "grid", placeItems: "center" }}
              >
                <ChevronRight size={16} />
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
