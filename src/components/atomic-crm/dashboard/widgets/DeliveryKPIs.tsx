import {
  ArrowRightLeft,
  DollarSign,
  FolderOpen,
  Gauge,
} from "lucide-react";
import { useGetList } from "ra-core";
import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal } from "../../types";

const ACTIVE_PROJECT_STATUSES = ["on_track", "at_risk", "behind"] as const;

const formatCurrency = (value: number, currency: string) =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

export const calcUtilization = (deals: Deal[], weeklyCapacity: number): number =>
  weeklyCapacity <= 0
    ? 0
    : Math.round(
        deals.reduce((sum, deal) => sum + (deal.projected_hours ?? 0), 0) /
          weeklyCapacity *
          100,
      );

export const DeliveryKPIs = () => {
  const { currency } = useConfigurationContext();
  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  const pendingHandoffDeals =
    deals?.filter((deal) => deal.stage === "won" && deal.project_status == null) ??
    [];
  const activeProjects =
    deals?.filter((deal) =>
      ACTIVE_PROJECT_STATUSES.includes(
        (deal.project_status ?? "") as (typeof ACTIVE_PROJECT_STATUSES)[number],
      ),
    ) ?? [];
  const weeklyCapacity = 40; // TODO: fetch from agency_settings table in live mode
  const capacityUtilization = calcUtilization(activeProjects, weeklyCapacity);
  const pendingHandoffValue = pendingHandoffDeals.reduce(
    (sum, deal) => sum + (deal.amount ?? 0),
    0,
  );
  const capacityColorClass =
    capacityUtilization < 80
      ? "text-emerald-600"
      : capacityUtilization <= 95
        ? "text-amber-600"
        : "text-destructive";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="gap-3 p-4">
        <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Deals Pending Handoff
          </p>
          <p className="text-2xl font-bold">{pendingHandoffDeals.length}</p>
        </div>
      </Card>
      <Card className="gap-3 p-4">
        <FolderOpen className="h-5 w-5 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Active Projects
          </p>
          <p className="text-2xl font-bold">{activeProjects.length}</p>
        </div>
      </Card>
      <Card className="gap-3 p-4">
        <Gauge className="h-5 w-5 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Capacity Utilization
          </p>
          <p className={`text-2xl font-bold ${capacityColorClass}`}>
            {capacityUtilization}%
          </p>
        </div>
      </Card>
      <Card className="gap-3 p-4">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Pending Handoff Value
          </p>
          <p className="text-2xl font-bold">
            {formatCurrency(pendingHandoffValue, currency)}
          </p>
        </div>
      </Card>
    </div>
  );
};
