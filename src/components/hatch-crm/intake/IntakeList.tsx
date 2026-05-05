import { useMemo, useState } from "react";
import type { Identifier } from "ra-core";
import {
  RecordContextProvider,
  useGetList,
  useListContext,
  useTranslate,
} from "ra-core";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ClipboardCheck,
  MessageCircle,
  PlayCircle,
  Send,
} from "lucide-react";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextField } from "@/components/admin/text-field";
import { TextInput } from "@/components/admin/text-input";

import { HatchPageHeader } from "../_primitives";
import type { IntakeLead } from "../types";
import { IntakeExpandedRow } from "./IntakeExpandedRow";
import { IntakeActionButton, OutreachProgress } from "./IntakeListShared";
import { IntakeStatusBadge } from "./IntakeStatusBadge";
import { IntakeMobileList } from "./IntakeMobileList";

const INTAKE_QUEUE_STATUSES = [
  "uncontacted",
  "in-sequence",
  "engaged",
  "not-interested",
  "unresponsive",
  "qualified",
  "rejected",
] as const;

const DISQUALIFIED_STATUSES = [
  "not-interested",
  "unresponsive",
  "rejected",
] as const;
const READY_REVIEW_STATUS = "ai_reviewed";
const DISQUALIFIED_FILTER = `(${DISQUALIFIED_STATUSES.join(",")})`;
const TABLE_GRID_TEMPLATE_COLUMNS = "2fr 1fr 0.9fr 1fr 1fr 1.25fr 170px 42px";
const MOBILE_SAFE_BOTTOM_SPACE = "calc(7rem + env(safe-area-inset-bottom))";
const INTAKE_PROMOTE_BUTTON_STYLES = `
  .intake-mobile-cards {
    display: none;
  }

  @media (max-width: 767px) {
    .intake-list-shell {
      padding-bottom: ${MOBILE_SAFE_BOTTOM_SPACE};
    }

    .intake-page-header {
      padding: 20px 16px 16px !important;
    }

    .intake-status-tabs {
      padding: 0 16px 14px !important;
      flex-wrap: nowrap !important;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .intake-status-tabs::-webkit-scrollbar {
      display: none;
    }

    .intake-summary-grid {
      padding: 0 16px 16px !important;
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px !important;
    }

    .intake-summary-tile {
      grid-template-columns: minmax(0, 1fr) !important;
      align-items: start !important;
      gap: 8px !important;
      min-height: 112px !important;
      padding: 12px !important;
      min-width: 0;
    }

    .intake-summary-tile > div:first-child {
      width: 32px !important;
      height: 32px !important;
      border-radius: 8px !important;
    }

    .intake-summary-tile svg {
      display: none !important;
    }

    .intake-desktop-table {
      display: none;
    }

    .intake-mobile-cards {
      display: grid;
      gap: 10px;
      margin: 0 16px;
    }

    .intake-mobile-cards button,
    .intake-mobile-cards a {
      min-height: 44px;
    }

    .intake-pagination {
      padding: 6px 16px ${MOBILE_SAFE_BOTTOM_SPACE};
      justify-content: center;
      flex-wrap: wrap;
    }
  }
`;

const intakeFilters = [
  <ReferenceInput
    key="trade_type_id"
    source="trade_type_id"
    reference="trade_types"
    perPage={100}
  >
    <SelectInput
      label="Trade Type"
      helperText={false}
      optionText="name"
      emptyText="All trade types"
    />
  </ReferenceInput>,
  <TextInput
    key="source"
    source="source@ilike"
    label="Source"
    helperText={false}
    placeholder="Filter by source"
  />,
];

export const IntakeList = () => {
  return (
    <List
      title={false}
      actions={false}
      filters={intakeFilters}
      filterDefaultValues={{}}
      sort={{ field: "created_at", order: "DESC" }}
      perPage={25}
      pagination={<ListPagination className="intake-pagination" />}
    >
      <IntakeListLayout />
    </List>
  );
};

const IntakeListLayout = () => {
  const translate = useTranslate();
  const { data, isPending, error, filterValues } = useListContext<IntakeLead>();
  const { data: allIntakeLeads = [] } = useGetList<IntakeLead>("intake_leads", {
    filter: {},
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "created_at", order: "DESC" },
  });
  const metricLeads = allIntakeLeads.length ? allIntakeLeads : (data ?? []);
  const intakeMetricLeads = metricLeads.filter((lead) =>
    INTAKE_QUEUE_STATUSES.includes(
      lead.status as (typeof INTAKE_QUEUE_STATUSES)[number],
    ),
  );
  const firstTouchCount = intakeMetricLeads.filter(
    (lead) => lead.status === "uncontacted",
  ).length;
  const reviewReadyCount = intakeMetricLeads.filter(
    (lead) => lead.current_draft_status === READY_REVIEW_STATUS,
  ).length;
  const inSequenceCount = intakeMetricLeads.filter(
    (lead) => lead.status === "in-sequence",
  ).length;
  const engagedCount = intakeMetricLeads.filter(
    (lead) => lead.status === "engaged",
  ).length;
  const hasFilters = Boolean(
    filterValues &&
    Object.entries(filterValues).some(([, value]) => {
      return value !== undefined && value !== null && value !== "";
    }),
  );

  if (isPending) {
    return null;
  }

  if (error) {
    return (
      <div
        style={{
          margin: "0 28px 28px",
          padding: "32px 20px",
          textAlign: "center",
          background: "var(--ink-3)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "var(--fg-1)",
            }}
          >
            {translate("resources.intake_leads.error.title", {
              _: "Error loading intake leads",
            })}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--fg-2)" }}>
            {translate("resources.intake_leads.error.description", {
              _: "Something went wrong. Please try again.",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="intake-list-shell"
      style={{
        background: "var(--ink-1)",
        minHeight: "100%",
        paddingBottom: 28,
      }}
    >
      <style>{INTAKE_PROMOTE_BUTTON_STYLES}</style>
      <div
        className="intake-page-header"
        style={{
          padding: "24px 28px 20px",
          background: "var(--ink-1)",
          flexShrink: 0,
        }}
      >
        <HatchPageHeader
          eyebrow="Lead Triage"
          title="Intake Queue"
          subline={
            <>
              <span
                className="font-mono"
                style={{
                  fontWeight: 700,
                  color: "var(--warn)",
                }}
              >
                {firstTouchCount}
              </span>
              {" leads awaiting first touch"}
            </>
          }
        />
      </div>
      <StatusTabBar allLeads={intakeMetricLeads} />
      <div
        className="intake-summary-grid"
        style={{
          padding: "0 28px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {(
          [
            {
              key: "uncontacted",
              label: "First touch",
              value: firstTouchCount,
              helper: "New leads waiting",
              trend: "+12% vs last 30 days",
              color: "#4DC8E8",
              bg: "rgba(77,200,232,0.08)",
              icon: Send,
              series: [8, 12, 9, 15, 13, 19, 17, 24],
            },
            {
              key: "review",
              label: "Ready review",
              value: reviewReadyCount,
              helper: "Drafts to inspect",
              color: "#A78BFA",
              bg: "rgba(167,139,250,0.08)",
              trend: "+8% vs last 30 days",
              icon: ClipboardCheck,
              series: [4, 7, 6, 9, 8, 12, 10, 18],
            },
            {
              key: "in-sequence",
              label: "In sequence",
              value: inSequenceCount,
              helper: "Active follow-up",
              color: "#34D399",
              bg: "rgba(52,211,153,0.08)",
              trend: "+5% vs last 30 days",
              icon: PlayCircle,
              series: [14, 17, 13, 20, 18, 21, 19, 25],
            },
            {
              key: "engaged",
              label: "Replies",
              value: engagedCount,
              helper: "Needs promotion",
              color: "#EF5A6F",
              bg: "rgba(239,90,111,0.08)",
              trend: "Email replies synced",
              icon: MessageCircle,
              series: [2, 4, 3, 7, 5, 6, 8, 6],
            },
          ] as const
        ).map(({ key, ...tile }) => (
          <IntakeMetricTile key={key} {...tile} />
        ))}
      </div>
      {!data?.length ? (
        <IntakeEmpty hasFilters={hasFilters} />
      ) : (
        <>
          <div
            className="intake-desktop-table"
            style={{
              margin: "0 28px",
              background: "var(--ink-3)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <DesktopIntakeTable />
          </div>
          <IntakeMobileList />
        </>
      )}
    </div>
  );
};

const IntakeMetricTile = ({
  label,
  value,
  helper,
  trend,
  color,
  bg,
  icon: Icon,
  series,
}: {
  label: string;
  value: number;
  helper: string;
  trend: string;
  color: string;
  bg: string;
  icon: LucideIcon;
  series: readonly number[];
}) => (
  <div
    className="intake-summary-tile"
    style={{
      minHeight: 106,
      padding: "15px 16px",
      borderRadius: 10,
      background:
        "linear-gradient(180deg, rgba(13,20,36,0.98) 0%, rgba(8,12,26,0.98) 100%)",
      border: `1px solid ${color}33`,
      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr) 90px",
      alignItems: "center",
      gap: 14,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 9,
        display: "grid",
        placeItems: "center",
        background: bg,
        border: `1px solid ${color}33`,
        color,
      }}
    >
      <Icon style={{ width: 21, height: 21 }} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--fg-2)",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        className="font-heading"
        style={{
          marginTop: 3,
          fontSize: 27,
          lineHeight: 1,
          fontWeight: 800,
          color: "var(--fg-1)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 7,
          color: trend.includes("synced") ? "var(--fg-3)" : "var(--good)",
          fontSize: 11.5,
          fontWeight: 650,
        }}
      >
        {trend}
      </div>
      <div style={{ marginTop: 2, color: "var(--fg-3)", fontSize: 11.5 }}>
        {helper}
      </div>
    </div>
    <Sparkline values={series} color={color} />
  </div>
);

const Sparkline = ({
  values,
  color,
}: {
  values: readonly number[];
  color: string;
}) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 88;
      const y = 34 - ((value - min) / range) * 30;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 88 38"
      role="img"
      aria-label="Intake trend"
      style={{ width: 88, height: 38, overflow: "visible" }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const getActiveIntakeTab = (filterValues: Record<string, unknown>) => {
  if (
    (filterValues["current_draft_status@eq"] ??
      filterValues.current_draft_status) === READY_REVIEW_STATUS
  ) {
    return "ready-review";
  }

  if (filterValues["status@in"] === DISQUALIFIED_FILTER) {
    return "disqualified";
  }

  const status = filterValues["status@eq"] ?? filterValues.status;
  if (typeof status === "string") {
    return status;
  }

  return "all";
};

const getIntakeTabFilter = (
  tabId: string,
  baseFilters: Record<string, unknown>,
) => {
  if (tabId === "all") {
    return { ...baseFilters };
  }

  if (tabId === "ready-review") {
    return {
      ...baseFilters,
      "current_draft_status@eq": READY_REVIEW_STATUS,
    };
  }

  if (tabId === "disqualified") {
    return { ...baseFilters, "status@in": DISQUALIFIED_FILTER };
  }

  return { ...baseFilters, "status@eq": tabId };
};

const StatusTabBar = ({ allLeads }: { allLeads: IntakeLead[] }) => {
  const {
    displayedFilters,
    filterValues = {},
    setFilters,
  } = useListContext<IntakeLead>();

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const lead of allLeads) {
      map[lead.status] = (map[lead.status] || 0) + 1;
    }
    map["ready-review"] = allLeads.filter(
      (lead) => lead.current_draft_status === READY_REVIEW_STATUS,
    ).length;
    map.disqualified = allLeads.filter((lead) =>
      DISQUALIFIED_STATUSES.includes(
        lead.status as (typeof DISQUALIFIED_STATUSES)[number],
      ),
    ).length;
    return map;
  }, [allLeads]);

  const baseFilters = useMemo(() => {
    const next = { ...filterValues };
    delete next.status;
    delete next["status@eq"];
    delete next["status@in"];
    delete next.current_draft_status;
    delete next["current_draft_status@eq"];
    return next;
  }, [filterValues]);

  const tabs = [
    { id: "all", label: "All Leads", count: allLeads.length },
    {
      id: "uncontacted",
      label: "First Touch",
      count: counts["uncontacted"] || 0,
    },
    {
      id: "ready-review",
      label: "Ready Review",
      count: counts["ready-review"] || 0,
    },
    {
      id: "in-sequence",
      label: "In Sequence",
      count: counts["in-sequence"] || 0,
    },
    { id: "engaged", label: "Replies", count: counts["engaged"] || 0 },
    {
      id: "qualified",
      label: "Converted",
      count: counts["qualified"] || 0,
    },
    {
      id: "disqualified",
      label: "Disqualified",
      count: counts.disqualified || 0,
    },
  ] as const;

  const activeTabId = getActiveIntakeTab(filterValues);

  const handleTabClick = (tabId: string) => {
    setFilters(getIntakeTabFilter(tabId, baseFilters), displayedFilters);
  };

  return (
    <div
      className="intake-status-tabs"
      style={{
        padding: "0 28px 16px",
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              color: isActive ? "var(--fg-1)" : "var(--fg-2)",
              background: isActive ? "rgba(77,200,232,0.09)" : "transparent",
              border: isActive
                ? "1px solid rgba(77,200,232,0.22)"
                : "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <span>{tab.label}</span>
            <span
              className="font-mono"
              style={{
                fontSize: 10.5,
                padding: "1px 6px",
                borderRadius: 4,
                background: isActive
                  ? "rgba(77,200,232,0.08)"
                  : "rgba(255,255,255,0.04)",
                color: isActive ? "var(--hatch-cyan)" : "var(--fg-3)",
              }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const IntakeEmpty = ({ hasFilters }: { hasFilters: boolean }) => {
  const translate = useTranslate();

  return (
    <div
      style={{
        margin: "0 28px 28px",
        padding: "40px 20px",
        textAlign: "center",
        color: "var(--fg-3)",
        fontSize: 13,
        background: "var(--ink-3)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "var(--fg-1)",
          }}
        >
          {hasFilters
            ? translate("resources.intake_leads.empty.no_match_title", {
                _: "No intake leads match these filters",
              })
            : translate("resources.intake_leads.empty.title", {
                _: "No intake leads yet",
              })}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--fg-3)" }}>
          {hasFilters
            ? translate("resources.intake_leads.empty.no_match_description", {
                _: "Adjust your filters to widen the search.",
              })
            : translate("resources.intake_leads.empty.description", {
                _: "New leads will appear here as they arrive.",
              })}
        </p>
      </div>
    </div>
  );
};

const DesktopIntakeTable = () => {
  const { data = [] } = useListContext<IntakeLead>();
  const translate = useTranslate();
  const [expandedIds, setExpandedIds] = useState<Identifier[]>([]);
  const [hoveredId, setHoveredId] = useState<Identifier | null>(null);

  const toggleExpanded = (id: Identifier) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((expandedId) => expandedId !== id)
        : [...current, id],
    );
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: TABLE_GRID_TEMPLATE_COLUMNS,
          gap: 16,
          padding: "10px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          fontSize: 9.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--fg-3)",
          fontWeight: 700,
          alignItems: "center",
        }}
      >
        <div>
          {translate("resources.intake_leads.fields.business_name", {
            _: "Business Name",
          })}
        </div>
        <div>
          {translate("resources.intake_leads.fields.trade_type_id", {
            _: "Trade Type",
          })}
        </div>
        <div>
          {translate("resources.intake_leads.fields.city", { _: "City" })}
        </div>
        <div>
          {translate("resources.intake_leads.fields.source", { _: "Source" })}
        </div>
        <div>
          {translate("resources.intake_leads.fields.status", { _: "Status" })}
        </div>
        <div>Outreach Progress</div>
        <div>{translate("ra.action.actions", { _: "Actions" })}</div>
        <div />
      </div>
      <div>
        {data.map((record, index) => {
          const expanded = expandedIds.includes(record.id);
          const rowBackground = expanded
            ? "rgba(77,200,232,0.04)"
            : hoveredId === record.id
              ? "rgba(255,255,255,0.02)"
              : "transparent";
          const borderBottom =
            index < data.length - 1
              ? "1px solid rgba(255,255,255,0.07)"
              : "none";

          return (
            <RecordContextProvider key={record.id} value={record}>
              <div
                onClick={() => toggleExpanded(record.id)}
                onMouseEnter={() => setHoveredId(record.id)}
                onMouseLeave={() =>
                  setHoveredId((current) =>
                    current === record.id ? null : current,
                  )
                }
                style={{
                  display: "grid",
                  gridTemplateColumns: TABLE_GRID_TEMPLATE_COLUMNS,
                  gap: 16,
                  padding: "13px 20px",
                  borderBottom,
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  background: rowBackground,
                }}
              >
                <div
                  className="font-heading"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--fg-1)",
                  }}
                >
                  {record.business_name}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--fg-2)" }}>
                  <ReferenceField
                    source="trade_type_id"
                    reference="trade_types"
                    link={false}
                    empty={<span style={{ color: "var(--fg-3)" }}>-</span>}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.07)",
                        background: "rgba(255,255,255,0.04)",
                        color: "var(--fg-2)",
                        fontSize: 12,
                      }}
                    >
                      <TextField source="name" />
                    </span>
                  </ReferenceField>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--fg-2)" }}>
                  {record.city || "-"}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--fg-2)" }}>
                  {record.source || "-"}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--fg-2)" }}>
                  <IntakeStatusBadge status={record.status} />
                </div>
                <div style={{ fontSize: 12.5, color: "var(--fg-2)" }}>
                  <OutreachProgress record={record} />
                </div>
                <div
                  onClick={(event) => event.stopPropagation()}
                  style={{ display: "flex", gap: 8 }}
                >
                  <IntakeActionButton
                    record={record}
                    onToggleExpanded={toggleExpanded}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <ChevronDown
                    style={{
                      color: "var(--fg-3)",
                      width: 16,
                      height: 16,
                      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s",
                    }}
                  />
                </div>
              </div>
              {expanded ? (
                <div
                  style={{
                    padding: "0 20px",
                    borderBottom,
                    background: "rgba(255,255,255,0.01)",
                  }}
                >
                  <IntakeExpandedRow record={record} />
                </div>
              ) : null}
            </RecordContextProvider>
          );
        })}
      </div>
    </div>
  );
};
