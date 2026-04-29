import type { Deal } from "../../types";

export const calcUtilization = (
  deals: Deal[],
  weeklyCapacity: number,
): number =>
  weeklyCapacity <= 0
    ? 0
    : Math.round(
        (deals.reduce((sum, deal) => sum + (deal.projected_hours ?? 0), 0) /
          weeklyCapacity) *
          100,
      );
