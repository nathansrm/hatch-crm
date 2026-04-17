import { FolderKanban } from "lucide-react";
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
    at_risk: "border-amber-200 bg-amber-50 text-amber-700",
    behind: "border-red-200 bg-red-50 text-red-700",
    on_track: "border-emerald-200 bg-emerald-50 text-emerald-700",
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <FolderKanban className="text-muted-foreground h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          Active Projects
        </h2>
      </div>
      {activeProjects.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">
          No active projects. Won deals pending handoff will appear here once
          started.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeProjects.map((deal) => {
            const status = deal.project_status as
              | (typeof ACTIVE_PROJECT_STATUSES)[number]
              | undefined;
            const progress = deal.project_progress_pct ?? 0;

            if (!status) {
              return null;
            }

            return (
              <Card key={deal.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {companyNameById.get(deal.company_id as number) ??
                        "Unknown company"}
                    </p>
                    <Badge
                      variant="outline"
                      className={statusClassName[status]}
                    >
                      {statusCopy[status]}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold">{deal.name}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{progress}% complete</span>
                      <span>{deal.projected_hours ?? 0}h projected</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
