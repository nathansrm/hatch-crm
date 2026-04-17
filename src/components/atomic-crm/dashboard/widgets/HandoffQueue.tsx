import { format } from "date-fns";
import { useGetList, useRefresh, useUpdate } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal } from "../../types";

type CompanyRecord = {
  id: number;
  name: string;
};

type SalesRecord = {
  id: number | string;
  first_name: string;
  last_name: string;
};

const formatCurrency = (value: number, currency: string) =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

export const HandoffQueue = () => {
  const { currency } = useConfigurationContext();
  const refresh = useRefresh();
  const [update, { isPending: isUpdating }] = useUpdate<Deal>();

  const { data: deals, isPending: dealsPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  const { data: companies, isPending: companiesPending } =
    useGetList<CompanyRecord>("companies", {
      pagination: { page: 1, perPage: 10000 },
    });

  const { data: sales, isPending: salesPending } = useGetList<SalesRecord>(
    "sales",
    {
      pagination: { page: 1, perPage: 100 },
    },
  );

  if (dealsPending || companiesPending || salesPending) {
    return null;
  }

  const companyNameById = new Map(
    (companies ?? []).map((company) => [company.id, company.name]),
  );
  const salesNameById = new Map(
    (sales ?? []).map((sale) => [
      sale.id,
      `${sale.first_name} ${sale.last_name}`.trim(),
    ]),
  );
  const pendingHandoffDeals =
    deals?.filter((deal) => deal.stage === "won" && deal.project_status == null) ??
    [];

  const handleStartOnboarding = (deal: Deal) => {
    const projectedHoursInput = window.prompt(
      "How many projected hours for this project?",
    );
    const trimmedInput = projectedHoursInput?.trim() ?? "";
    const projectedHours =
      trimmedInput === "" ? undefined : Number.parseFloat(trimmedInput);

    if (trimmedInput !== "" && Number.isNaN(projectedHours)) {
      return;
    }

    update(
      "deals",
      {
        id: deal.id,
        data: {
          ...deal,
          project_started_at: new Date().toISOString(),
          project_status: "on_track",
          ...(projectedHours !== undefined
            ? { projected_hours: projectedHours }
            : {}),
        },
        previousData: deal,
      },
      {
        onSuccess: () => refresh(),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Deal Handoff Queue</h2>
          <Badge variant="secondary">{pendingHandoffDeals.length}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Recently closed-won</p>
      </div>
      {pendingHandoffDeals.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">
          No deals pending handoff. All won deals are in delivery.
        </Card>
      ) : (
        pendingHandoffDeals.map((deal) => (
          <Card
            key={deal.id}
            className="flex flex-col gap-4 border-l-4 border-l-amber-500 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-base font-semibold">
                  {companyNameById.get(deal.company_id as number) ??
                    "Unknown company"}
                </p>
                <p className="text-sm text-muted-foreground">{deal.name}</p>
              </div>
              <Button
                size="sm"
                onClick={() => handleStartOnboarding(deal)}
                disabled={isUpdating}
              >
                Start Onboarding
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Deal Value
                </span>
                <p className="text-sm font-semibold">
                  {formatCurrency(deal.amount ?? 0, currency)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Won Date
                </span>
                <p className="text-sm font-semibold">
                  {format(new Date(deal.updated_at), "MMM d")}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sales
                </span>
                <p className="text-sm font-semibold">
                  {salesNameById.get(deal.sales_id as number | string) ??
                    "Unassigned"}
                </p>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
