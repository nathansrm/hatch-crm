import { useGetList } from "ra-core";
import { Card } from "@/components/ui/card";

import type { Deal } from "../../types";

const ACTIVE_PROJECT_STATUSES = ["on_track", "at_risk", "behind"] as const;

export const calcUtilization = (deals: Deal[], weeklyCapacity: number): number =>
  weeklyCapacity <= 0
    ? 0
    : Math.round(
        deals.reduce((sum, deal) => sum + (deal.projected_hours ?? 0), 0) /
          weeklyCapacity *
          100,
      );

export const DeliveryKPIs = () => {
  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="h-28 animate-pulse bg-muted p-4" />
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
  const capacityBorderClass =
    capacityUtilization < 85
      ? "border-l-emerald-500"
      : capacityUtilization <= 100
        ? "border-l-amber-500"
        : "border-l-red-500";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="border-l-4 border-l-amber-500 p-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Deals Pending Handoff
          </p>
          <p className="text-3xl font-bold">{pendingHandoffDeals.length}</p>
          <p className="text-sm text-muted-foreground">
            ready for onboarding
          </p>
        </div>
      </Card>
      <Card className="border-l-4 border-l-blue-400 p-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Active Projects
          </p>
          <p className="text-3xl font-bold">{activeProjects.length}</p>
          <p className="text-sm text-muted-foreground">in delivery</p>
        </div>
      </Card>
      <Card className={`border-l-4 p-4 ${capacityBorderClass}`}>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Capacity Utilization
          </p>
          <p className="text-3xl font-bold">{capacityUtilization}%</p>
          <p className="text-sm text-muted-foreground">
            of weekly capacity
          </p>
        </div>
      </Card>
    </div>
  );
};
