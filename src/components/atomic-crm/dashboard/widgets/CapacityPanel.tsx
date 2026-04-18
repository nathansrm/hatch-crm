import { AlertTriangle } from "lucide-react";
import { useGetList } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal } from "../../types";
import { calcUtilization } from "./DeliveryKPIs";

type CompanyRecord = {
  id: number;
  name: string;
};

const ACTIVE_PROJECT_STATUSES = ["on_track", "at_risk", "behind"] as const;

const formatCurrency = (value: number, currency: string) =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

const statusCopy: Record<(typeof ACTIVE_PROJECT_STATUSES)[number], string> = {
  at_risk: "At Risk",
  behind: "Behind",
  on_track: "On Track",
};

const statusClassName: Record<(typeof ACTIVE_PROJECT_STATUSES)[number], string> =
  {
    at_risk: "bg-amber-100 text-amber-700",
    behind: "bg-red-100 text-red-700",
    on_track: "bg-emerald-100 text-emerald-700",
  };

export const CapacityPanel = () => {
  const { currency } = useConfigurationContext();
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
  const summaryClassName =
    totalHours > weeklyCapacity
      ? "bg-red-50 text-red-700 font-semibold"
      : "bg-emerald-50 text-emerald-700 font-semibold";

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        padding: "20px 22px",
        background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          marginBottom: 12,
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Capacity
            </div>
            <h2
              style={{
                margin: 0,
                fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#ECEEF5",
              }}
            >
              Capacity warning
            </h2>
          </div>
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Deal</th>
              <th className="px-4 py-3 text-right font-semibold">Value</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">
                Projected Hours
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((deal) => {
              const status = deal.project_status as
                | (typeof ACTIVE_PROJECT_STATUSES)[number]
                | undefined;

              if (!status) {
                return null;
              }

              return (
                <tr key={deal.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-medium">
                        {companyNameById.get(deal.company_id as number) ??
                          "Unknown company"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(deal.amount ?? 0, currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`rounded-full border-0 px-2 py-0.5 text-xs font-semibold ${statusClassName[status]}`}
                    >
                      {statusCopy[status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deal.projected_hours ?? 0}h
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2">
              <td colSpan={4} className={`px-4 py-3 ${summaryClassName}`}>
                Total: {totalHours}h projected / {weeklyCapacity}h weekly
                capacity
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </section>
  );
};
