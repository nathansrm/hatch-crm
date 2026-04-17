import { ArrowRightLeft } from "lucide-react";
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

const formatCurrency = (value: number, currency: string) =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

const getDaysSinceWon = (deal: Deal) => {
  const wonDate = new Date(deal.updated_at ?? deal.created_at);
  const elapsedMs = Date.now() - wonDate.getTime();
  return Math.max(0, Math.floor(elapsedMs / 86_400_000));
};

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

  if (dealsPending || companiesPending) {
    return null;
  }

  const companyNameById = new Map(
    (companies ?? []).map((company) => [company.id, company.name]),
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <ArrowRightLeft className="text-muted-foreground h-6 w-6" />
        </div>
        <h2 className="flex-1 text-xl font-semibold text-muted-foreground">
          Handoff Queue
        </h2>
        <Badge variant="secondary">{pendingHandoffDeals.length}</Badge>
      </div>
      <Card className="overflow-hidden p-0">
        {pendingHandoffDeals.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No deals pending handoff. All won deals are in delivery.
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {pendingHandoffDeals.map((deal) => (
                <tr key={deal.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">
                      {companyNameById.get(deal.company_id as number) ??
                        "Unknown company"}{" "}
                      &middot; {deal.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(deal.amount ?? 0, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {getDaysSinceWon(deal)} days since won
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      onClick={() => handleStartOnboarding(deal)}
                      disabled={isUpdating}
                    >
                      Start Onboarding
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};
