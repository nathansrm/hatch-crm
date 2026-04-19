import { useState } from "react";
import { useGetIdentity, useGetList, useTimeout } from "ra-core";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";

import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact, ContactNote, Deal, Task } from "../types";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { ObsKPIWon, ObsKPIWinRate, ObsAttentionRow } from "./Dashboard";
import { TasksList } from "./TasksList";
import { ActiveProjectsGrid } from "./widgets/ActiveProjectsGrid";
import { DeliveryKPIs } from "./widgets/DeliveryKPIs";
import { HandoffQueue } from "./widgets/HandoffQueue";

type MobileView = "dashboard" | "delivery";

const TERMINAL_WON_STAGE = "won";
const TERMINAL_LOST_STAGE = "lost";

const getTodayDateKey = () => {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const getDateKey = (value?: string | null) => value?.slice(0, 10) ?? null;

const DARK_BG: React.CSSProperties = { background: "#060A16" };

const GLASS_CARD: React.CSSProperties = {
  background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow:
    "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 24px rgba(0,0,0,0.35)",
  borderRadius: 12,
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

const DealSummaryRow = () => {
  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} style={{ ...GLASS_CARD, height: 96, padding: 16 }} className="animate-pulse" />
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
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Dashboard</h1>

      {/* KPI widgets */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <ObsKPIWon />
        <ObsKPIWinRate />
      </div>

      {/* Attention row — scrollable on narrow viewports */}
      <div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
        <ObsAttentionRow overdueTasksCount={overdueTasksCount} />
      </div>

      <DealSummaryRow />
      <DashboardActivityLog />
      <TasksList />
    </div>
  );
};

const DeliveryView = () => (
  <div className="flex flex-col gap-6">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#ECEEF5" }}>
        Delivery Dashboard
      </h1>
      <p className="text-sm" style={{ color: "#5C6784" }}>
        Handoff queue, active project load, and capacity.
      </p>
    </div>
    <DeliveryKPIs />
    <HandoffQueue />
    <ActiveProjectsGrid />
    <TasksList variant="sales" />
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
            border: active ? "1px solid rgba(77,200,232,0.3)" : "1px solid transparent",
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
