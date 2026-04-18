import { format } from "date-fns";
import { useGetList } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import type { Deal } from "../../types";

type CompanyRecord = {
  id: number;
  name: string;
};

const ACTIVE_PROJECT_STATUSES = ["on_track", "at_risk", "behind"] as const;

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

export const ActiveProjectsGrid = () => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Active Projects</h2>
        <Badge variant="secondary">{activeProjects.length}</Badge>
      </div>
      {activeProjects.length === 0 ? (
        <Card
          className="p-4 text-sm text-muted-foreground"
          style={{
            background: "#0D1424",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
          }}
        >
          No active projects yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activeProjects.map((deal) => {
            const status = deal.project_status as
              | (typeof ACTIVE_PROJECT_STATUSES)[number]
              | undefined;
            const progress = deal.project_progress_pct ?? 0;

            if (!status) {
              return null;
            }

            return (
              <Card
                key={deal.id}
                className="flex flex-col gap-3 p-4"
                style={{
                  background: "#0D1424",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-base font-semibold">
                      {companyNameById.get(deal.company_id as number) ??
                        "Unknown company"}
                    </p>
                    <p className="text-sm text-muted-foreground">{deal.name}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-full border-0 px-2 py-0.5 text-xs font-semibold ${statusClassName[status]}`}
                  >
                    {statusCopy[status]}
                  </Badge>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>{progress}% complete</span>
                  {deal.project_started_at ? (
                    <span>
                      {`Started ${format(new Date(deal.project_started_at), "MMM d")}`}
                    </span>
                  ) : (
                    <span />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
