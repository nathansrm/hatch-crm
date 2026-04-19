import { useState } from "react";
import { useGetIdentity, useGetList, useTimeout } from "ra-core";
import { useRedirect } from "ra-core";
import { Link } from "react-router";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Flame,
  Percent,
  Trophy,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgencySettings } from "@/hooks/useAgencySettings";
import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact, ContactNote, Deal, Task } from "../types";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { TasksList } from "./TasksList";
import { ActiveProjectsGrid } from "./widgets/ActiveProjectsGrid";
import { DeliveryKPIs } from "./widgets/DeliveryKPIs";
import { HandoffQueue } from "./widgets/HandoffQueue";

type MobileView = "dashboard" | "delivery";

type CollapsibleSectionProps = {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

type DeltaBadgeProps = {
  delta: number | null;
};

const TERMINAL_WON_STAGE = "won";
const TERMINAL_LOST_STAGE = "lost";

const UNARCHIVED_DEALS_LIST_PARAMS = {
  pagination: { page: 1, perPage: 10000 },
  filter: { "archived_at@is": null },
} as const;

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

const DARK_BG: React.CSSProperties = { background: "#060A16" };

const GLASS_CARD: React.CSSProperties = {
  background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow:
    "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 24px rgba(0,0,0,0.35)",
  borderRadius: 12,
};

const KPI_CARD_STYLE: React.CSSProperties = {
  borderRadius: 12,
  padding: "18px 16px",
  background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { darkModeLogo, lightModeLogo, title } = useConfigurationContext();
  return (
    <>
      <MobileHeader>
        <div className="flex items-center gap-2 text-secondary-foreground no-underline py-3">
          <img
            className="[.light_&]:hidden h-6"
            src={darkModeLogo}
            alt=""
            aria-hidden="true"
          />
          <img
            className="[.dark_&]:hidden h-6"
            src={lightModeLogo}
            alt=""
            aria-hidden="true"
          />
          <h1 className="sr-only">{title}</h1>
        </div>
      </MobileHeader>
      <MobileContent style={DARK_BG}>{children}</MobileContent>
    </>
  );
};

const Loading = () => (
  <Wrapper>
    <Skeleton className="h-4 w-3/4 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
  </Wrapper>
);

const CollapsibleSection = ({
  title,
  count,
  defaultOpen,
  children,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? true);

  return (
    <section style={{ ...GLASS_CARD, overflow: "hidden", padding: 0 }}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          minHeight: 44,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#5C6784",
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>
          {count !== undefined ? (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 10,
                background: "rgba(77,200,232,0.12)",
                border: "1px solid rgba(77,200,232,0.25)",
                color: "#4DC8E8",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {count}
            </span>
          ) : null}
        </div>
        {isOpen ? (
          <ChevronDown size={16} color="#5C6784" />
        ) : (
          <ChevronUp size={16} color="#5C6784" />
        )}
      </button>
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.07)",
        }}
      />
      <div style={{ display: isOpen ? "block" : "none", paddingTop: 14 }}>
        {children}
      </div>
    </section>
  );
};

const DeltaBadge = ({ delta }: DeltaBadgeProps) => {
  if (delta === null) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 8px",
          borderRadius: 5,
          fontSize: 11,
          fontWeight: 700,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#9AA3BE",
        }}
      >
        N/A
      </span>
    );
  }

  const positive = delta >= 0;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "3px 8px",
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 700,
        background: positive ? "rgba(52,211,153,0.15)" : "rgba(239,90,111,0.15)",
        border: positive
          ? "1px solid rgba(52,211,153,0.35)"
          : "1px solid rgba(239,90,111,0.35)",
        color: positive ? "#34D399" : "#EF5A6F",
      }}
    >
      {positive ? (
        <TrendingUp size={11} strokeWidth={2.5} />
      ) : (
        <TrendingDown size={11} strokeWidth={2.5} />
      )}
      {positive ? "+" : ""}
      {delta}
    </span>
  );
};

const MobileKPIWon = () => {
  const { won_goal: WON_GOAL } = useAgencySettings();
  const { data: deals } = useGetList<Deal>(
    "deals",
    UNARCHIVED_DEALS_LIST_PARAMS,
  );
  const now = new Date();
  const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
  const qtdStart = new Date(now.getFullYear(), qStartMonth, 1);
  const priorQStart = new Date(now.getFullYear(), qStartMonth - 3, 1);

  const wonDeals = (deals ?? []).filter((deal) => deal.stage === "won");
  const qtdWon = wonDeals.filter((deal) => {
    const ts = getValidDate(deal.closed_at ?? deal.updated_at);
    return ts !== null && ts >= qtdStart;
  });
  const priorQWon = wonDeals.filter((deal) => {
    const ts = getValidDate(deal.closed_at ?? deal.updated_at);
    return ts !== null && ts >= priorQStart && ts < qtdStart;
  });
  const wonCount = qtdWon.length;
  const wonDelta = wonCount - priorQWon.length;
  const filled = Math.min(wonCount, WON_GOAL);

  return (
    <section style={KPI_CARD_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#5C6784",
            fontWeight: 700,
          }}
        >
          Deals Won
        </span>
        <div
          style={{
            width: 24,
            height: 24,
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
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
            fontSize: 36,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {wonCount}
        </div>
        <DeltaBadge delta={wonDelta} />
      </div>
      <div style={{ color: "#5C6784", fontSize: 11.5, marginTop: 8 }}>
        {filled} of {WON_GOAL} goal
      </div>
    </section>
  );
};

const MobileKPIWinRate = () => {
  const { data: deals } = useGetList<Deal>(
    "deals",
    UNARCHIVED_DEALS_LIST_PARAMS,
  );
  const now = new Date();
  const t90 = new Date(now);
  t90.setDate(t90.getDate() - 90);
  const t180 = new Date(now);
  t180.setDate(t180.getDate() - 180);

  const isClosed = (deal: Deal) => ["won", "lost"].includes(deal.stage);
  const inWindow = (deal: Deal, from: Date, to: Date) => {
    const ts = getValidDate(deal.closed_at ?? deal.updated_at);
    return ts !== null && ts >= from && ts < to;
  };

  const closedDeals = (deals ?? []).filter(
    (deal) => isClosed(deal) && inWindow(deal, t90, now),
  );
  const priorClosed = (deals ?? []).filter(
    (deal) => isClosed(deal) && inWindow(deal, t180, t90),
  );
  const winRate =
    closedDeals.length > 0
      ? Math.round(
          (closedDeals.filter((deal) => deal.stage === "won").length /
            closedDeals.length) *
            100,
        )
      : 0;
  const priorWinRate =
    priorClosed.length > 0
      ? Math.round(
          (priorClosed.filter((deal) => deal.stage === "won").length /
            priorClosed.length) *
            100,
        )
      : null;
  const winRateDelta = priorWinRate !== null ? winRate - priorWinRate : null;

  return (
    <section style={KPI_CARD_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#5C6784",
            fontWeight: 700,
          }}
        >
          Win Rate
        </span>
        <div
          style={{
            width: 24,
            height: 24,
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
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
            fontSize: 36,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {winRate}%
        </div>
        <DeltaBadge delta={winRateDelta} />
      </div>
      <div style={{ color: "#5C6784", fontSize: 11.5, marginTop: 8 }}>
        vs 32% avg · trailing 90d
      </div>
    </section>
  );
};

const MobileAttentionRow = ({
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
  const d7 = new Date(now);
  d7.setDate(d7.getDate() - 7);
  const d14 = new Date(now);
  d14.setDate(d14.getDate() - 14);

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
    .sort(
      (left, right) => left.updatedAt.getTime() - right.updatedAt.getTime(),
    )[0];
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

  const thisWeekDeals = (allDeals ?? []).filter((deal) => {
    const created = getValidDate(deal.created_at);
    return created !== null && created >= d7;
  });
  const priorWeekDeals = (allDeals ?? []).filter((deal) => {
    const created = getValidDate(deal.created_at);
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

  const handleKeyDown = (handler: () => void) => {
    return (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") {
        handler();
      }
    };
  };

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => redirect("/tasks")}
        onKeyDown={handleKeyDown(() => redirect("/tasks"))}
        style={{
          padding: "14px 16px",
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            background: "#EF5A6F1F",
            border: "1px solid #EF5A6F40",
            color: "#EF5A6F",
            flexShrink: 0,
          }}
        >
          <AlertCircle size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#ECEEF5" }}>
            {overdueTasksCount} overdue task{overdueTasksCount === 1 ? "" : "s"}
          </div>
          <div style={{ fontSize: 12, color: "#9AA3BE", marginTop: 2 }}>
            {overdueTasksCount > 0 ? "Blocking active deals" : "All clear"}
          </div>
        </div>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#EF5A6F",
            marginLeft: "auto",
            paddingLeft: 8,
            whiteSpace: "nowrap",
          }}
        >
          Clear queue
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() =>
          redirect(staleDeal ? `/deals/${staleDeal.id}/show` : "/deals")
        }
        onKeyDown={handleKeyDown(() =>
          redirect(staleDeal ? `/deals/${staleDeal.id}/show` : "/deals"),
        )}
        style={{
          padding: "14px 16px",
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            background: "#F5B84A1F",
            border: "1px solid #F5B84A40",
            color: "#F5B84A",
            flexShrink: 0,
          }}
        >
          <Flame size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#ECEEF5",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {staleDeal ? staleDeal.name : "No stale deals"}
          </div>
          <div style={{ fontSize: 12, color: "#9AA3BE", marginTop: 2 }}>
            {staleDeal && staleDays !== null
              ? `Proposal sent · waiting ${staleDays}d`
              : "All proposal-sent deals moving"}
          </div>
        </div>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#F5B84A",
            marginLeft: "auto",
            paddingLeft: 8,
            whiteSpace: "nowrap",
          }}
        >
          {staleDeal ? "Follow up" : "Review pipeline"}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => redirect("/deals")}
        onKeyDown={handleKeyDown(() => redirect("/deals"))}
        style={{
          padding: "14px 16px",
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          outline: "none",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            background: "#5EEAD41F",
            border: "1px solid #5EEAD440",
            color: "#5EEAD4",
            flexShrink: 0,
          }}
        >
          <Zap size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#ECEEF5" }}>
            {thisWeekDeals.length} new deal{thisWeekDeals.length === 1 ? "" : "s"} this
            week
          </div>
          <div style={{ fontSize: 12, color: "#9AA3BE", marginTop: 2 }}>
            {newDealsPct !== null
              ? `${newDealsPct >= 0 ? "+" : ""}${newDealsPct}% vs last week`
              : "First week of data"}
          </div>
        </div>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#5EEAD4",
            marginLeft: "auto",
            paddingLeft: 8,
            whiteSpace: "nowrap",
          }}
        >
          Review deals
        </span>
      </div>
    </div>
  );
};

const DealSummaryRow = () => {
  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            style={{ ...GLASS_CARD, height: 96, padding: 16 }}
            className="animate-pulse"
          />
        ))}
      </div>
    );
  }

  const wonCount =
    deals?.filter((deal) => deal.stage === TERMINAL_WON_STAGE).length ?? 0;
  const lostCount =
    deals?.filter((deal) => deal.stage === TERMINAL_LOST_STAGE).length ?? 0;
  const pendingCount =
    deals?.filter(
      (deal) =>
        deal.stage !== TERMINAL_WON_STAGE && deal.stage !== TERMINAL_LOST_STAGE,
    ).length ?? 0;

  const items = [
    { label: "Won", value: wonCount, color: "#34D399" },
    { label: "Pending", value: pendingCount, color: "#4DC8E8" },
    { label: "Lost", value: lostCount, color: "#EF5A6F" },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, color }) => (
        <Link to="/deals" key={label}>
          <div
            style={{
              ...GLASS_CARD,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#5C6784",
                margin: 0,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {value}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

const DashboardView = () => {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 className="sr-only">Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <MobileKPIWon />
        <MobileKPIWinRate />
      </div>
      <CollapsibleSection title="ATTENTION" defaultOpen={true}>
        <MobileAttentionRow overdueTasksCount={overdueTasksCount} />
      </CollapsibleSection>
      <DealSummaryRow />
      <CollapsibleSection title="MY TASKS" defaultOpen={true}>
        <TasksList />
      </CollapsibleSection>
      <CollapsibleSection title="RECENT ACTIVITY" defaultOpen={false}>
        <DashboardActivityLog />
      </CollapsibleSection>
    </div>
  );
};

const DeliveryView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#ECEEF5",
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        Delivery
      </h1>
      <p style={{ fontSize: 12, color: "#5C6784", margin: "4px 0 0" }}>
        Handoff queue, project load, and capacity.
      </p>
    </div>
    <div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
      <DeliveryKPIs />
    </div>
    <CollapsibleSection title="HANDOFF QUEUE" defaultOpen={true}>
      <HandoffQueue />
    </CollapsibleSection>
    <CollapsibleSection title="ACTIVE PROJECTS" defaultOpen={true}>
      <ActiveProjectsGrid />
    </CollapsibleSection>
    <CollapsibleSection title="DELIVERY TASKS" defaultOpen={false}>
      <TasksList variant="sales" />
    </CollapsibleSection>
  </div>
);

const VIEW_LABELS: Record<MobileView, string> = {
  dashboard: "Dashboard",
  delivery: "Delivery",
};

const ViewSwitcher = ({
  activeView,
  onChange,
}: {
  activeView: MobileView;
  onChange: (view: MobileView) => void;
}) => (
  <div
    style={{
      display: "inline-flex",
      padding: 3,
      borderRadius: 10,
      background: "rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.08)",
      gap: 2,
      width: "100%",
    }}
  >
    {(["dashboard", "delivery"] as const).map((view) => {
      const active = activeView === view;
      return (
        <button
          key={view}
          type="button"
          onClick={() => onChange(view)}
          aria-current={active ? "page" : undefined}
          style={{
            flex: 1,
            padding: "7px 12px",
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 700,
            color: active ? "#ECEEF5" : "#5C6784",
            background: active
              ? "linear-gradient(180deg, rgba(77,200,232,0.22) 0%, rgba(77,200,232,0.05) 100%)"
              : "transparent",
            border: active
              ? "1px solid rgba(77,200,232,0.3)"
              : "1px solid transparent",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {VIEW_LABELS[view]}
        </button>
      );
    })}
  </div>
);

export const MobileDashboard = () => {
  const [activeView, setActiveView] = useState<MobileView>("dashboard");
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
  const oneSecondHasPassed = useTimeout(1000);

  const isPending = isPendingContact || isPendingContactNotes;

  if (isPending) {
    return oneSecondHasPassed ? <Loading /> : null;
  }

  if (!totalContact) {
    return (
      <Wrapper>
        <DashboardStepper step={1} />
      </Wrapper>
    );
  }

  if (!totalContactNotes) {
    return (
      <Wrapper>
        <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="mt-1 flex flex-col gap-6">
        <ViewSwitcher activeView={activeView} onChange={setActiveView} />
        {activeView === "dashboard" ? <DashboardView /> : null}
        {activeView === "delivery" ? <DeliveryView /> : null}
      </div>
    </Wrapper>
  );
};
