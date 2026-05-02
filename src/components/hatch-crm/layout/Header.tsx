import { Import, Plus, Settings, User, Users } from "lucide-react";
import {
  CanAccess,
  useGetIdentity,
  useGetList,
  useTranslate,
  useUserMenu,
} from "ra-core";
import { useMemo } from "react";
import { Link } from "react-router";
import { UserMenu } from "@/components/admin/user-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { HatchPrimaryButton, HATCH } from "@/components/hatch-crm/_primitives";
import { useConfigurationContext } from "@/components/hatch-crm/root/ConfigurationContext";
import type { Deal } from "@/components/hatch-crm/types";
import { OPEN_DEALS_LIST_PARAMS } from "../deals/dealFilters";
import {
  formatCompactCurrency,
  getValidDate,
} from "../dashboard/widgets/dashboardUtils";

const USER_MENU_STYLES =
  ".obsidian-user-menu-shell > * { position: absolute; inset: 0; } .obsidian-user-menu-shell button { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; border-radius: 9999px; opacity: 0; } .obsidian-user-menu:focus-within .obsidian-user-menu-visual { box-shadow: 0 0 0 2px rgba(77, 200, 232, 0.45); } @keyframes obsidian-pulse { 0% { opacity: 0.55; } 50% { opacity: 1; } 100% { opacity: 0.55; } }";

const Header = () => {
  const { data: identity } = useGetIdentity();
  const { currency, darkModeLogo, title } = useConfigurationContext();
  const initial = identity?.fullName?.charAt(0) ?? "U";
  const { data: pipelineDeals, isPending: isPipelinePending } =
    useGetList<Deal>("deals", OPEN_DEALS_LIST_PARAMS);

  const pipelineLive = useMemo(() => {
    const deals = pipelineDeals ?? [];
    const value = deals.reduce(
      (sum, deal) => sum + (typeof deal.amount === "number" ? deal.amount : 0),
      0,
    );
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
        (deal): deal is { amount: number; createdAt: Date } =>
          deal.createdAt !== null,
      );

    if (datedDeals.length === 0) {
      return { value, delta: null, count: deals.length };
    }

    const currentValue = datedDeals
      .filter((deal) => deal.createdAt >= currentMonthStart)
      .reduce((sum, deal) => sum + deal.amount, 0);
    const priorValue = datedDeals
      .filter(
        (deal) =>
          deal.createdAt >= priorMonthStart &&
          deal.createdAt < currentMonthStart,
      )
      .reduce((sum, deal) => sum + deal.amount, 0);

    const delta =
      priorValue > 0
        ? Math.round(((currentValue - priorValue) / priorValue) * 100)
        : null;

    return { value, delta, count: deals.length };
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
        background: HATCH.surfaceBg,
        borderBottom: "1px solid rgba(77,200,232,0.18)",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
      }}
    >
      <style>{USER_MENU_STYLES}</style>
      <Link
        to="/"
        style={{
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          minWidth: 0,
        }}
      >
        <img
          src={darkModeLogo}
          alt={title}
          style={{
            display: "block",
            width: "min(230px, 34vw)",
            height: 32,
            objectFit: "contain",
            objectPosition: "left center",
          }}
        />
      </Link>
      <div
        style={{
          width: 1,
          height: 28,
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <div
        id="breadcrumb"
        style={{ flex: 1, display: "flex", alignItems: "center" }}
      />
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
            background: "rgb(52 211 153)",
          }}
        />
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}
        >
          <span
            style={{
              fontSize: 9.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: HATCH.textMuted,
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
              className="font-mono"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: HATCH.textHi,
                marginTop: 2,
              }}
            >
              {Number.isFinite(pipelineLive.value) && pipelineLive.value > 0
                ? formatCompactCurrency(pipelineLive.value, currency)
                : pipelineLive.count > 0
                  ? `${pipelineLive.count} open`
                  : "No open deals"}{" "}
              {Number.isFinite(pipelineLive.value) &&
              pipelineLive.value > 0 &&
              pipelineLive.delta !== null ? (
                <span
                  style={{
                    color:
                      pipelineLive.delta >= 0
                        ? "rgb(52 211 153)"
                        : HATCH.danger,
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
      <HatchPrimaryButton
        asChild
        className="z-[1] h-auto gap-1.5 rounded-[7px] px-3.5 py-2 text-[12.5px] font-bold no-underline"
      >
        <Link to="/deals/create" className="font-heading">
          <Plus size={15} strokeWidth={2.5} />
          New Deal
        </Link>
      </HatchPrimaryButton>
      <div
        className="obsidian-user-menu"
        style={{ position: "relative", zIndex: 1, width: 32, height: 32 }}
      >
        <div
          className="obsidian-user-menu-visual font-heading"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "oklch(0.55 0.13 220)",
            color: HATCH.textHi,
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
        <div
          className="obsidian-user-menu-shell"
          style={{ position: "absolute", inset: 0 }}
        >
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
      <Link to="/import" className="flex items-center gap-2">
        <Import />
        {translate("crm.header.import_data")}
      </Link>
    </DropdownMenuItem>
  );
};

export default Header;
