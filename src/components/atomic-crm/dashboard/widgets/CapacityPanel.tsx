import { AlertTriangle } from "lucide-react";
import { useGetList } from "ra-core";
import { Card } from "@/components/ui/card";

import type { Deal } from "../../types";
import { calcUtilization } from "./DeliveryKPIs";

type CompanyRecord = {
  id: number;
  name: string;
};

const ACTIVE_PROJECT_STATUSES = ["on_track", "at_risk", "behind"] as const;

export const CapacityPanel = () => {
  const { data: deals, isPending: dealsPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  const { data: companies, isPending: companiesPending } =
    useGetList<CompanyRecord>("companies", {
      pagination: { page: 1, perPage: 10000 },
    });

  if (dealsPending || companiesPending) {
    return null;
  }

  const companyNameById = new Map(
    (companies ?? []).map((company) => [company.id, company.name]),
  );
  const activeProjects =
    deals?.filter((deal) =>
      ACTIVE_PROJECT_STATUSES.includes(
        (deal.project_status ?? "") as (typeof ACTIVE_PROJECT_STATUSES)[number],
      ),
    ) ?? [];
  const weeklyCapacity = 40; // TODO: fetch from agency_settings table in live mode
  const utilization = calcUtilization(activeProjects, weeklyCapacity);

  if (utilization <= 85) {
    return null;
  }

  const totalHours = activeProjects.reduce(
    (sum, deal) => sum + (deal.projected_hours ?? 0),
    0,
  );
  const sortedProjects = [...activeProjects].sort(
    (left, right) => (right.projected_hours ?? 0) - (left.projected_hours ?? 0),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          Capacity Watch
        </h2>
      </div>
      <Card className="border-amber-200 bg-amber-50/60 p-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-base font-semibold text-amber-900">
              You're at {utilization}% capacity. Consider before taking on new
              work.
            </p>
            <p className="text-sm text-amber-800">
              {totalHours}h allocated of {weeklyCapacity}h weekly capacity
            </p>
          </div>
          <div className="space-y-2">
            {sortedProjects.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-white/70 px-3 py-2"
              >
                <span className="text-sm font-medium">
                  {companyNameById.get(deal.company_id as number) ??
                    "Unknown company"}{" "}
                  &middot; {deal.name}
                </span>
                <span className="text-sm font-semibold text-amber-900">
                  {deal.projected_hours ?? 0}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
