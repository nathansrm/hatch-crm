import { useEffect, useState } from "react";
import { useGetList } from "ra-core";
import { useSearchParams } from "react-router";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import type { Contact, ContactNote } from "../types";
import { DeliveryDashboard } from "./DeliveryDashboard";
import { ActionQueue } from "./ActionQueue";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { DealsChart } from "./DealsChart";
import { DealsByTradeType } from "./DealsByTradeType";
import { HotContacts } from "./HotContacts";
import { KPICards } from "./KPICards";
import { PipelineSummary } from "./PipelineSummary";
import { StaleDeals } from "./StaleDeals";
import { TasksList } from "./TasksList";

const DASHBOARD_VIEW_STORAGE_KEY = "crm_dashboard_view";

type DashboardView = "pipeline" | "delivery";

const normalizeDashboardView = (value: string | null): DashboardView | null =>
  value === "pipeline" || value === "delivery" ? value : null;

const PipelineDashboardContent = ({ totalDeal }: { totalDeal?: number }) => (
  <div className="space-y-6">
    <KPICards />
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <div className="md:col-span-8">
        {totalDeal ? (
          <Card className="p-4">
            <DealsChart />
          </Card>
        ) : null}
      </div>
      <div className="flex flex-col gap-6 md:col-span-4">
        <Card className="p-4">
          <PipelineSummary />
        </Card>
        <DealsByTradeType />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <div className="flex flex-col gap-6 md:col-span-8">
        <ActionQueue />
        <StaleDeals />
        <DashboardActivityLog />
      </div>
      <div className="flex flex-col gap-6 md:col-span-4">
        <TasksList />
        <HotContacts />
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashboardView>("pipeline");
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

  const { total: totalDeal, isPending: isPendingDeal } = useGetList<Contact>(
    "deals",
    {
      pagination: { page: 1, perPage: 1 },
    },
  );

  const isPending = isPendingContact || isPendingContactNotes || isPendingDeal;

  useEffect(() => {
    const urlView = normalizeDashboardView(searchParams.get("view"));
    if (urlView) {
      if (urlView !== activeTab) {
        setActiveTab(urlView);
      }
      return;
    }

    const storedView =
      typeof window === "undefined"
        ? null
        : normalizeDashboardView(
            window.localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY),
          );
    const nextView = storedView ?? "pipeline";

    if (nextView !== activeTab) {
      setActiveTab(nextView);
    }

    if (searchParams.get("view") === nextView) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("view", nextView);
    setSearchParams(nextSearchParams, { replace: true });
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const handleTabChange = (nextValue: string) => {
    const nextView = normalizeDashboardView(nextValue) ?? "pipeline";
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
        <TabsList className="mb-4">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline">
          <PipelineDashboardContent totalDeal={totalDeal} />
        </TabsContent>
        <TabsContent value="delivery">
          <DeliveryDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
