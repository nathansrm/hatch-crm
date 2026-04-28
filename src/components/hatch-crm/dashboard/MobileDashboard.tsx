import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { useGetIdentity, useGetList, useTimeout } from "ra-core";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  OPEN_DEALS_LIST_PARAMS,
  UNARCHIVED_DEALS_LIST_PARAMS,
} from "../deals/dealFilters";
import { getDealDecayLevel } from "../deals/dealUtils";
import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact, ContactNote, Deal, Task } from "../types";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { KPICards } from "./KPICards";
import { TasksList } from "./TasksList";
import { ActiveProjectsGrid } from "./widgets/ActiveProjectsGrid";
import { DeliveryKPIs } from "./widgets/DeliveryKPIs";
import { HandoffQueue } from "./widgets/HandoffQueue";

type MobileView = "dashboard" | "delivery";

const TERMINAL_WON_STAGE = "won";
const TERMINAL_LOST_STAGE = "lost";
const TERMINAL_STAGES = [TERMINAL_WON_STAGE, TERMINAL_LOST_STAGE];

const getTodayDateKey = () => {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const getDateKey = (value?: string | null) => value?.slice(0, 10) ?? null;

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
      <MobileContent>{children}</MobileContent>
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
  const { data: deals, isPending } = useGetList<Deal>(
    "deals",
    UNARCHIVED_DEALS_LIST_PARAMS,
  );

  if (isPending) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="h-24 animate-pulse bg-muted p-4" />
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

  return (
    <div className="grid grid-cols-3 gap-3">
      <Link to="/deals">
        <Card className="gap-2 p-4 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:shadow-sm active:translate-y-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Won
          </p>
          <p className="text-2xl font-bold tabular-nums">{wonCount}</p>
        </Card>
      </Link>
      <Link to="/deals">
        <Card className="gap-2 p-4 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:shadow-sm active:translate-y-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pending
          </p>
          <p className="text-2xl font-bold tabular-nums">{pendingCount}</p>
        </Card>
      </Link>
      <Link to="/deals">
        <Card className="gap-2 p-4 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:shadow-sm active:translate-y-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Lost
          </p>
          <p className="text-2xl font-bold tabular-nums">{lostCount}</p>
        </Card>
      </Link>
    </div>
  );
};

const UrgencyMetricCard = ({
  borderClassName,
  icon: Icon,
  label,
  value,
}: {
  borderClassName: string;
  icon: typeof Calendar;
  label: string;
  value: number;
}) => (
  <Card className={`gap-0 border-l-4 p-4 ${borderClassName}`}>
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  </Card>
);

const DashboardView = () => {
  const { identity } = useGetIdentity();
  const todayKey = getTodayDateKey();

  const { data: deals } = useGetList<Deal>("deals", OPEN_DEALS_LIST_PARAMS);

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
  const followUpsDueCount =
    tasks?.filter((task) => getDateKey(task.due_date) === todayKey).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Dashboard</h1>
      <KPICards variant="overview" columns={2} />
      <div className="flex flex-col gap-4">
        <UrgencyMetricCard
          borderClassName={
            staleDealsCount > 0
              ? "border-l-destructive"
              : "border-l-emerald-500"
          }
          icon={AlertTriangle}
          label="Stale Deals"
          value={staleDealsCount}
        />
        <UrgencyMetricCard
          borderClassName={
            overdueTasksCount > 0
              ? "border-l-destructive"
              : "border-l-emerald-500"
          }
          icon={Clock}
          label="Overdue Tasks"
          value={overdueTasksCount}
        />
        <UrgencyMetricCard
          borderClassName={
            followUpsDueCount > 0
              ? "border-l-amber-500"
              : "border-l-emerald-500"
          }
          icon={Calendar}
          label="Follow-ups Due"
          value={followUpsDueCount}
        />
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
      <h1 className="text-2xl font-bold tracking-tight">
        Delivery Dashboard
      </h1>
      <p className="text-sm text-muted-foreground">
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
  <div className="flex gap-2">
    {(["dashboard", "delivery"] as const).map((view) => (
      <button
        key={view}
        type="button"
        onClick={() => onChange(view)}
        className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
          activeView === view
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
        aria-current={activeView === view ? "page" : undefined}
      >
        {VIEW_LABELS[view]}
      </button>
    ))}
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
