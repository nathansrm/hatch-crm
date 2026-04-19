import {
  BarChart3,
  Briefcase,
  Building2,
  CheckSquare,
  Inbox,
  Layers,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useGetIdentity } from "ra-core";
import { Link, useMatch } from "react-router";
type NavItemConfig = {
  key: string;
  label: string;
  icon: LucideIcon;
  to: string;
  count?: number;
  badge?: string;
  end?: boolean;
};

const NAV_ITEMS: NavItemConfig[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/", end: true },
  { key: "deals", label: "Deals", icon: Briefcase, to: "/deals", count: 24 },
  { key: "intake", label: "Intake", icon: Inbox, to: "/intake_leads", count: 7, badge: "new" },
  { key: "contacts", label: "Contacts", icon: Users, to: "/contacts" },
  { key: "companies", label: "Companies", icon: Building2, to: "/companies" },
  { key: "tasks", label: "Tasks", icon: CheckSquare, to: "/tasks", count: 12 },
  { key: "reports", label: "Reports", icon: BarChart3, to: "/reports" },
  { key: "resources", label: "Resources", icon: Layers, to: "/resources" },
];

const TRADE_FILTERS = [
  { label: "All trades", dot: "#4DC8E8" },
  { label: "HVAC", dot: "#F5B84A" },
  { label: "Roofing", dot: "#EF5A6F" },
  { label: "Plumbing", dot: "#5EEAD4" },
];

const NavItem = ({
  icon: Icon,
  label,
  to,
  count,
  badge,
  end = false,
}: {
  icon: LucideIcon;
  label: string;
  to: string;
  count?: number;
  badge?: string;
  end?: boolean;
}) => {
  const match = useMatch({ path: to, end });
  const active = Boolean(match);

  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 7,
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        background: active ? "rgba(77,200,232,0.09)" : "transparent",
        border: active
          ? "1px solid rgba(77,200,232,0.22)"
          : "1px solid transparent",
        color: active ? "#ECEEF5" : "#9AA3BE",
      }}
    >
      <Icon
        size={16}
        color={active ? "#4DC8E8" : "currentColor"}
        strokeWidth={active ? 2.25 : 1.8}
      />
      <span style={{ flex: 1 }}>{label}</span>
      {typeof count === "number" ? (
        <span
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 10.5,
            padding: "1px 6px",
            borderRadius: 4,
            fontWeight: 600,
            background: active ? "rgba(77,200,232,0.08)" : "rgba(255,255,255,0.04)",
            color: active ? "#4DC8E8" : "#5C6784",
          }}
        >
          {count}
        </span>
      ) : null}
      {badge ? (
        <span
          style={{
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            fontWeight: 700,
            padding: "1px 5px",
            borderRadius: 3,
            background: "#F5B84A",
            color: "#1a1a1a",
          }}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
};

export function AppSidebar() {
  const { data: identity } = useGetIdentity();
  const settingsMatch = useMatch({ path: "/settings", end: false });
  const settingsActive = Boolean(settingsMatch);

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "#060A16",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: "20px 16px 8px",
          fontSize: 9.5,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#3A4362",
          fontWeight: 700,
        }}
      >
        WORKSPACE
      </div>
      <nav
        style={{
          padding: "0 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.key} {...item} />
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div
        style={{
          padding: "20px 16px 8px",
          fontSize: 9.5,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#3A4362",
          fontWeight: 700,
          marginTop: 24,
        }}
      >
        TRADE FOCUS
      </div>
      <div
        style={{
          padding: "0 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginBottom: 14,
        }}
      >
        {TRADE_FILTERS.map((filter, index) => (
          <button
            key={filter.label}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              color: index === 0 ? "#ECEEF5" : "#9AA3BE",
              background: index === 0 ? "rgba(255,255,255,0.04)" : "transparent",
              border: "none",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: filter.dot,
              }}
            />
            <span style={{ flex: 1 }}>{filter.label}</span>
          </button>
        ))}
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "12px 10px 0",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Link
          to="/settings"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            background: settingsActive ? "rgba(77,200,232,0.09)" : "transparent",
            border: settingsActive
              ? "1px solid rgba(77,200,232,0.22)"
              : "1px solid transparent",
            color: settingsActive ? "#ECEEF5" : "#9AA3BE",
          }}
        >
          <Settings
            size={16}
            color={settingsActive ? "#4DC8E8" : "currentColor"}
            strokeWidth={settingsActive ? 2.25 : 1.8}
          />
          <span>Settings</span>
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "oklch(0.55 0.13 220)",
              color: "#FFFFFF",
              display: "grid",
              placeItems: "center",
              fontFamily: '"Manrope Variable", ui-sans-serif, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 11,
              flexShrink: 0,
            }}
          >
            {identity?.fullName?.charAt(0) ?? "N"}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.2,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#ECEEF5",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {identity?.fullName ?? "User"}
            </span>
            <span style={{ fontSize: 10.5, color: "#5C6784" }}>
              {"Owner \u00B7 Hatch Theory"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
