import { useGetList } from "ra-core";

import type { Deal } from "../../types";
import { useAgencySettings } from "@/hooks/useAgencySettings";

const ACTIVE_PROJECT_STATUSES = ["on_track", "at_risk", "behind"] as const;

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

const obsCardStyle = {
  position: "relative" as const,
  overflow: "hidden" as const,
  borderRadius: 12,
  padding: "18px 18px 16px",
  background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
};

export const DeliveryKPIs = () => {
  const { weekly_capacity_hours: weeklyCapacityFromSettings } = useAgencySettings();
  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[12px]"
            style={{
              background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
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
  const weeklyCapacity = weeklyCapacityFromSettings;
  const capacityUtilization = calcUtilization(activeProjects, weeklyCapacity);
  const capacityColor =
    capacityUtilization < 85
      ? "#34D399"
      : capacityUtilization <= 100
        ? "#F5B84A"
        : "#EF5A6F";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <section style={obsCardStyle}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, #F5B84A 0%, #F5B84A44 60%, transparent 100%)",
          }}
        />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Deals Pending Handoff
          </p>
          <p className="text-3xl font-bold text-white">{pendingHandoffDeals.length}</p>
          <p className="text-sm text-muted-foreground">ready for onboarding</p>
        </div>
      </section>
      <section style={obsCardStyle}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, #4DC8E8 0%, #4DC8E844 60%, transparent 100%)",
          }}
        />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Active Projects
          </p>
          <p className="text-3xl font-bold text-white">{activeProjects.length}</p>
          <p className="text-sm text-muted-foreground">in delivery</p>
        </div>
      </section>
      <section style={obsCardStyle}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, ${capacityColor} 0%, ${capacityColor}44 60%, transparent 100%)`,
          }}
        />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Capacity Utilization
          </p>
          <p className="text-3xl font-bold text-white">{capacityUtilization}%</p>
          <p className="text-sm text-muted-foreground">of weekly capacity</p>
        </div>
      </section>
    </div>
  );
};
