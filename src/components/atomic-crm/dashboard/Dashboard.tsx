import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetIdentity, useGetList } from "ra-core";
import { useSearchParams } from "react-router";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { getDealDecayLevel } from "../deals/dealUtils";
import type { Contact, ContactNote, Deal, Task } from "../types";
import { DeliveryDashboard } from "./DeliveryDashboard";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { DealsChart } from "./DealsChart";
import { DealsByTradeType } from "./DealsByTradeType";
import { HotContacts } from "./HotContacts";
import { KPICards } from "./KPICards";
import { PipelineSummary } from "./PipelineSummary";
import { StaleDeals } from "./StaleDeals";
import { TasksList } from "./TasksList";

const DASHBOARD_VIEW_STORAGE_KEY = "crm_dashboard_tab";
const TERMINAL_STAGES = ["won", "lost"];

type DashboardView = "dashboard" | "sales" | "delivery";

const normalizeDashboardView = (value: string | null): DashboardView | null => {
  if (value === "dashboard" || value === "sales" || value === "delivery") {
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

const DashboardOverview = ({ totalDeal }: { totalDeal?: number }) => (
  <div className="space-y-6">
    <KPICards variant="overview" />
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="xl:col-span-8">
        {totalDeal ? (
          <Card className="p-4">
            <DealsChart />
          </Card>
        ) : null}
      </div>
      <div className="xl:col-span-4">
        <Card className="p-5">
          <DealsByTradeType />
        </Card>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <DashboardActivityLog />
      </div>
      <div className="xl:col-span-4">
        <TasksList />
      </div>
    </div>
  </div>
);

const UrgencyMetricCard = ({
  borderClassName,
  icon: Icon,
  label,
  value,
}: {
  borderClassName: string;
  icon: typeof AlertTriangle;
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

const SalesDashboardContent = () => {
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

  const followUpsDueCount =
    tasks?.filter((task) => getDateKey(task.due_date) === todayKey).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UrgencyMetricCard
          borderClassName={
            staleDealsCount > 0 ? "border-l-red-500" : "border-l-emerald-500"
          }
          icon={AlertTriangle}
          label="Stale Deals"
          value={staleDealsCount}
        />
        <UrgencyMetricCard
          borderClassName={
            overdueTasksCount > 0
              ? "border-l-red-500"
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
      <KPICards variant="sales" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-7">
          <Card className="p-5">
            <PipelineSummary variant="bars" />
          </Card>
          <StaleDeals />
        </div>
        <div className="flex flex-col gap-6 xl:col-span-5">
          <TasksList variant="sales" />
          <HotContacts />
        </div>
      </div>
    </div>
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
    <div className="mt-1">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 grid h-auto w-full grid-cols-3 md:w-fit">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <DashboardOverview totalDeal={totalDeal} />
        </TabsContent>
        <TabsContent value="sales">
          <SalesDashboardContent />
        </TabsContent>
        <TabsContent value="delivery">
          <DeliveryDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
