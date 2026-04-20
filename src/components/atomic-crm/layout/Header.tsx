import { Bell, Import, Plus, Search, Settings, User, Users } from "lucide-react";
import { CanAccess, useGetIdentity, useGetList, useTranslate, useUserMenu } from "ra-core";
import { useMemo } from "react";
import { Link } from "react-router";
import { UserMenu } from "@/components/admin/user-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useConfigurationContext } from "@/components/atomic-crm/root/ConfigurationContext";
import type { Deal } from "@/components/atomic-crm/types";
import { ImportPage } from "../misc/ImportPage";
import {
  DASHBOARD_COLLECTION_PAGINATION,
  formatCompactCurrency,
  getNonTerminalDealStageValues,
  getValidDate,
} from "../dashboard/widgets/dashboardUtils";

const Header = () => {
  const { data: identity } = useGetIdentity();
  const { currency, darkModeLogo, title, dealStages } = useConfigurationContext();
  const initial = identity?.fullName?.charAt(0) ?? "U";
  const pipelineStages = useMemo(
    () => getNonTerminalDealStageValues(dealStages),
    [dealStages],
  );
  const { data: pipelineDeals, isPending: isPipelinePending } = useGetList<Deal>(
    "deals",
    {
      pagination: DASHBOARD_COLLECTION_PAGINATION,
      filter: {
        "archived_at@is": null,
        "stage@in": pipelineStages,
      },
    },
    { enabled: pipelineStages.length > 0 },
  );

  const pipelineLive = useMemo(() => {
    const deals = pipelineDeals ?? [];
    const value = deals.reduce((sum, deal) => sum + (typeof deal.amount === 'number' ? deal.amount : 0), 0);
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const priorMonthStart = new Date(currentMonthStart);
    priorMonthStart.setMonth(priorMonthStart.getMonth() - 1);

    const datedDeals = deals
      .map((deal) => ({
        amount: deal.amount ?? 0,
        createdAt: getValidDate(deal.created_at),
      }))
      .filter(
        (deal): deal is { amount: number; createdAt: Date } => deal.createdAt !== null,
      );

    if (datedDeals.length === 0) {
      return { value, delta: null };
    }

    const currentValue = datedDeals
      .filter((deal) => deal.createdAt >= currentMonthStart)
      .reduce((sum, deal) => sum + deal.amount, 0);
    const priorValue = datedDeals
      .filter(
        (deal) => deal.createdAt >= priorMonthStart && deal.createdAt < currentMonthStart,
      )
      .reduce((sum, deal) => sum + deal.amount, 0);

    const delta =
      priorValue > 0
        ? Math.round(((currentValue - priorValue) / priorValue) * 100)
        : null;

    return { value, delta };
  }, [pipelineDeals]);

  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: "20px",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        background: "linear-gradient(180deg, #0C1224 0%, #060A16 100%)",
        borderBottom: "1px solid rgba(77,200,232,0.18)",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
      }}
    >
      <style>
        {`
          .obsidian-user-menu-shell > * {
            position: absolute;
            inset: 0;
          }

          .obsidian-user-menu-shell button {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            border-radius: 9999px;
            opacity: 0;
          }

          .obsidian-user-menu:focus-within .obsidian-user-menu-visual {
            box-shadow: 0 0 0 2px rgba(77, 200, 232, 0.45);
          }

          @keyframes obsidian-pulse {
            0% { opacity: 0.55; }
            50% { opacity: 1; }
            100% { opacity: 0.55; }
          }
        `}
      </style>
      <div
        style={{
          position: "absolute",
          left: "-8%",
          top: "50%",
          transform: "translateY(-50%)",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(77,200,232,0.1) 0%, transparent 60%)",
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />
      <Link
        to="/"
        style={{
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 12,
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "linear-gradient(180deg, #132446 0%, #091227 100%)",
            border: "1px solid rgba(77,200,232,0.25)",
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <img
            src={darkModeLogo}
            alt={title}
            style={{
              width: "130%",
              height: "130%",
              objectFit: "cover",
              objectPosition: "center 34%",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <div
            style={{
              fontFamily: '"Manrope Variable", ui-sans-serif, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 15,
              color: "#ECEEF5",
              letterSpacing: "-0.01em",
            }}
          >
            HATCH
            <span style={{ color: "#4DC8E8", margin: "0 3px" }}>{"\u00B7"}</span>
            CRM
          </div>
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#5C6784",
              marginTop: 4,
              fontWeight: 600,
            }}
          >
            Operations Console
          </div>
        </div>
      </Link>
      <div
        style={{
          width: 1,
          height: 28,
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <div
        style={{
          flex: 1,
          maxWidth: "400px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 1,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 8,
          padding: "8px 12px",
          color: "#5C6784",
        }}
      >
        <Search size={14} />
        <span style={{ fontSize: 12.5 }}>Search...</span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 10,
            padding: "2px 5px",
            background: "#0D1424",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 4,
            color: "#9AA3BE",
          }}
        >
          {"\u2318K"}
        </span>
      </div>
      <div id="breadcrumb" style={{ flex: 1, display: "flex", alignItems: "center" }} />
      <div
        style={{
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 14px",
          background: "rgba(52,211,153,0.06)",
          border: "1px solid rgba(52,211,153,0.18)",
          borderRadius: 8,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: "#34D399",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span
            style={{
              fontSize: 9.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#5C6784",
              fontWeight: 600,
            }}
          >
            Pipeline Live
          </span>
          {isPipelinePending ? (
            <span
              aria-hidden="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <span
                style={{
                  width: 74,
                  height: 13,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.12)",
                  animation: "obsidian-pulse 1.2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  width: 48,
                  height: 13,
                  borderRadius: 999,
                  background: "rgba(52,211,153,0.15)",
                  animation: "obsidian-pulse 1.2s ease-in-out infinite",
                }}
              />
            </span>
          ) : (
            <span
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 13,
                fontWeight: 600,
                color: "#ECEEF5",
                marginTop: 2,
              }}
            >
              {Number.isFinite(pipelineLive.value) && pipelineLive.value > 0
                ? formatCompactCurrency(pipelineLive.value, currency)
                : "—"}{" "}
              {Number.isFinite(pipelineLive.value) && pipelineLive.value > 0 && pipelineLive.delta !== null ? (
                <span
                  style={{
                    color: pipelineLive.delta >= 0 ? "#34D399" : "#EF5A6F",
                  }}
                >
                  {pipelineLive.delta >= 0 ? "+" : ""}
                  {pipelineLive.delta}%
                </span>
              ) : null}
            </span>
          )}
        </div>
      </div>
      <Link
        to="/deals/create"
        style={{
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          background: "#4DC8E8",
          color: "#061022",
          borderRadius: 7,
          fontFamily: '"Manrope Variable", ui-sans-serif, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 12.5,
          textDecoration: "none",
          boxShadow: "0 2px 0 rgba(0,0,0,0.3), 0 0 20px rgba(77,200,232,0.25)",
        }}
      >
        <Plus size={15} strokeWidth={2.5} />
        New Deal
      </Link>
      <button
        type="button"
        style={{
          zIndex: 1,
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.03)",
          color: "#9AA3BE",
          position: "relative",
        }}
      >
        <Bell size={15} />
        <span
          style={{
            position: "absolute",
            top: 7,
            right: 7,
            width: 7,
            height: 7,
            borderRadius: 999,
            background: "#F5B84A",
            boxShadow: "0 0 0 2px #060A16",
          }}
        />
      </button>
      <div
        className="obsidian-user-menu"
        style={{ position: "relative", zIndex: 1, width: 32, height: 32 }}
      >
        <div
          className="obsidian-user-menu-visual"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "oklch(0.55 0.13 220)",
            color: "#FFFFFF",
            fontFamily: '"Manrope Variable", ui-sans-serif, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            pointerEvents: "none",
          }}
        >
          {initial}
        </div>
        <div className="obsidian-user-menu-shell" style={{ position: "absolute", inset: 0 }}>
          <UserMenu>
            <ProfileMenu />
            <CanAccess resource="sales" action="list">
              <UsersMenu />
            </CanAccess>
            <CanAccess resource="configuration" action="edit">
              <SettingsMenu />
            </CanAccess>
            <ImportFromJsonMenuItem />
          </UserMenu>
        </div>
      </div>
    </header>
  );
};

const UsersMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<UsersMenu> must be used inside <UserMenu?");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/sales" className="flex items-center gap-2">
        <Users />
        {translate("resources.sales.name", { smart_count: 2 })}
      </Link>
    </DropdownMenuItem>
  );
};

const ProfileMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<ProfileMenu> must be used inside <UserMenu?");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/profile" className="flex items-center gap-2">
        <User />
        {translate("crm.profile.title")}
      </Link>
    </DropdownMenuItem>
  );
};

const SettingsMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<SettingsMenu> must be used inside <UserMenu>");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/settings" className="flex items-center gap-2">
        <Settings />
        {translate("crm.settings.title")}
      </Link>
    </DropdownMenuItem>
  );
};

const ImportFromJsonMenuItem = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<ImportFromJsonMenuItem> must be used inside <UserMenu>");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to={ImportPage.path} className="flex items-center gap-2">
        <Import />
        {translate("crm.header.import_data")}
      </Link>
    </DropdownMenuItem>
  );
};

export default Header;
