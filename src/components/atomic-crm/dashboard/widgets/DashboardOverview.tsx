import { useGetIdentity, useGetList } from "ra-core";

import type { Task } from "../../types";
import { DashboardActivityLog } from "../DashboardActivityLog";
import { StaleDeals } from "../StaleDeals";
import { UpNextWidget } from "../../tasks/UpNextWidget";
import { ObsAttentionRow } from "./ObsAttentionRow";
import { ObsHeroPipeline } from "./ObsHeroPipeline";
import { ObsHotDealsPanel } from "./ObsHotDealsPanel";
import { ObsKPIWinRate } from "./ObsKPIWinRate";
import { ObsKPIWon } from "./ObsKPIWon";
import {
  DASHBOARD_COLLECTION_PAGINATION,
  getDateKey,
  getTodayDateKey,
} from "./dashboardUtils";

export const DashboardOverview = ({ totalDeal }: { totalDeal?: number }) => {
  void totalDeal;

  const { identity } = useGetIdentity();
  const todayKey = getTodayDateKey();

  const { data: tasks } = useGetList<Task>(
    "tasks",
    {
      pagination: DASHBOARD_COLLECTION_PAGINATION,
      sort: { field: "due_date", order: "ASC" },
      filter: { "done_date@is": null, sales_id: identity?.id },
    },
    { enabled: identity?.id != null },
  );

  const overdueTasksCount =
    tasks?.filter((task) => {
      const dueDateKey = getDateKey(task.due_date);
      return dueDateKey != null && dueDateKey < todayKey;
    }).length ?? 0;

  return (
    <main
      style={{
        padding: "28px 32px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: "#060A16",
        overflowY: "auto",
        minHeight: 0,
        flex: 1,
      }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}
      >
        <ObsHeroPipeline />
        <ObsKPIWon />
        <ObsKPIWinRate />
      </div>
      <ObsAttentionRow overdueTasksCount={overdueTasksCount} />
      <ObsHotDealsPanel />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1.3fr 1fr",
          gap: 14,
        }}
      >
        <UpNextWidget />
        <DashboardActivityLog />
        <StaleDeals />
      </div>
    </main>
  );
};
