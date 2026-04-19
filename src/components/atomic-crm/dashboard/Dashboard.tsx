import { useEffect, useState } from "react";
import { useGetList } from "ra-core";
import { useSearchParams } from "react-router";

import type { Contact, ContactNote, Deal } from "../types";
import { DeliveryDashboard } from "./DeliveryDashboard";
import { DashboardStepper } from "./DashboardStepper";
import { DashboardOverview } from "./widgets/DashboardOverview";

const DASHBOARD_VIEW_STORAGE_KEY = "crm_dashboard_tab";

type DashboardView = "dashboard" | "delivery";

const normalizeDashboardView = (value: string | null): DashboardView | null => {
  if (value === "dashboard" || value === "delivery") {
    return value;
  }

  if (value === "pipeline") {
    return "dashboard";
  }

  return null;
};

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashboardView>("dashboard");
  const {
    data: dataContact,
    total: totalContact,
    isPending: isPendingContact,
  } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 1 },
  });

  const { total: totalContactNotes, isPending: isPendingContactNotes } =
    useGetList<ContactNote>("contact_notes", {
      pagination: { page: 1, perPage: 1 },
    });

  const { total: totalDeal, isPending: isPendingDeal } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: 1 },
    },
  );

  const isPending = isPendingContact || isPendingContactNotes || isPendingDeal;

  useEffect(() => {
    const urlView = normalizeDashboardView(searchParams.get("view"));
    const storedView =
      typeof window === "undefined"
        ? null
        : normalizeDashboardView(
            window.localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY),
          );
    const nextView = urlView ?? storedView ?? "dashboard";

    setActiveTab((currentTab) =>
      currentTab === nextView ? currentTab : nextView,
    );

    if (searchParams.get("view") === nextView) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("view", nextView);
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const handleTabChange = (nextValue: string) => {
    const nextView = normalizeDashboardView(nextValue) ?? "dashboard";
    setActiveTab(nextView);

    if (searchParams.get("view") === nextView) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("view", nextView);
    setSearchParams(nextSearchParams, { replace: true });
  };

  if (isPending) {
    return null;
  }

  if (!totalContact) {
    return <DashboardStepper step={1} />;
  }

  if (!totalContactNotes) {
    return <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        background: "#060A16",
      }}
    >
      <div
        style={{
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "#060A16",
          position: "sticky" as const,
          top: 0,
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {(["dashboard", "delivery"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            style={{
              padding: "12px 18px",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "capitalize",
              color: activeTab === tab ? "#ECEEF5" : "#5C6784",
              borderBottom:
                activeTab === tab
                  ? "2px solid #4DC8E8"
                  : "2px solid transparent",
              marginBottom: -1,
              background: "transparent",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              borderBottomColor:
                activeTab === tab ? "#4DC8E8" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "dashboard" && <DashboardOverview totalDeal={totalDeal} />}
      {activeTab === "delivery" && <DeliveryDashboard />}
    </div>
  );
};
