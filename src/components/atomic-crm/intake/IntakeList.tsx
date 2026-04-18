import { useMemo, useState } from "react";
import type { Identifier } from "ra-core";
import {
  RecordContextProvider,
  useGetList,
  useListContext,
  useTranslate,
} from "ra-core";
import { ChevronDown } from "lucide-react";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextField } from "@/components/admin/text-field";
import { TextInput } from "@/components/admin/text-input";

import type { IntakeLead } from "../types";
import { IntakeExpandedRow } from "./IntakeExpandedRow";
import { IntakePromoteButton } from "./IntakePromoteButton";
import { IntakeStatusBadge } from "./IntakeStatusBadge";

const ACTIVE_PIPELINE_STATUSES = [
  "uncontacted",
  "in-sequence",
  "engaged",
  "not-interested",
  "unresponsive",
] as const;

const ACTIVE_PIPELINE_FILTER = `(${ACTIVE_PIPELINE_STATUSES.join(",")})`;
const OUTREACH_STEPS_TOTAL = 7;
const TABLE_GRID_TEMPLATE_COLUMNS =
  "2fr 1fr 1fr 1fr 1fr 180px 180px 48px";
const INTAKE_PROMOTE_BUTTON_STYLES = `
  [data-intake-promote-button] button {
    padding: 6px 14px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
    color: #34D399;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.25);
    cursor: pointer;
  }

  [data-intake-promote-button] button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  const translate = useTranslate();

  return (
    <List
      title={translate("resources.intake_leads.name", {
        smart_count: 2,
        _: "Intake Leads",
      })}
      actions={false}
      filters={intakeFilters}
      filterDefaultValues={{ "status@in": ACTIVE_PIPELINE_FILTER }}
      sort={{ field: "created_at", order: "DESC" }}
      perPage={25}
    >
      <IntakeListLayout />
    </List>
  );
};

const IntakeListLayout = () => {
  const translate = useTranslate();
  const { data, isPending, error, filterValues } = useListContext<IntakeLead>();
  const hasFilters = Boolean(
    filterValues &&
      Object.entries(filterValues).some(([key, value]) => {
        if (key === "status@in" && value === ACTIVE_PIPELINE_FILTER) {
          return false;
        }

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
          background: "#0D1424",
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
              color: "#ECEEF5",
            }}
          >
            {translate("resources.intake_leads.error.title", {
              _: "Error loading intake leads",
            })}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: "#9AA3BE" }}>
            {translate("resources.intake_leads.error.description", {
              _: "Something went wrong. Please try again.",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#060A16", minHeight: "100%", paddingBottom: 28 }}>
      <style>{INTAKE_PROMOTE_BUTTON_STYLES}</style>
      <div
        style={{
          padding: "24px 28px 20px",
          background: "#060A16",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#4DC8E8",
              fontWeight: 700,
            }}
          >
            Lead Triage
          </span>
          <span
            style={{
              height: 1,
              width: 24,
              background: "rgba(77,200,232,0.4)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: '"Manrope Variable", ui-sans-serif',
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#ECEEF5",
              }}
            >
              Intake Queue
            </h1>
            <p style={{ margin: "4px 0 0", color: "#9AA3BE", fontSize: 13 }}>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace',
                  fontWeight: 700,
                  color: "#F5B84A",
                }}
              >
                {data?.filter((lead: IntakeLead) => lead.status === "uncontacted")
                  .length ?? 0}
              </span>
              {" leads awaiting first touch"}
            </p>
          </div>
        </div>
      </div>
      <StatusTabBar />
      <div
        style={{
          padding: "0 28px 20px",
          display: "flex",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {([
          {
            key: "uncontacted",
            label: "Uncontacted",
            color: "#4DC8E8",
            bg: "rgba(77,200,232,0.08)",
          },
          {
            key: "in-sequence",
            label: "In Sequence",
            color: "#A78BFA",
            bg: "rgba(167,139,250,0.08)",
          },
          {
            key: "engaged",
            label: "Engaged",
            color: "#34D399",
            bg: "rgba(52,211,153,0.08)",
          },
          {
            key: "not-interested",
            label: "Not Interested",
            color: "#EF5A6F",
            bg: "rgba(239,90,111,0.08)",
          },
        ] as const).map((tile) => (
          <div
            key={tile.key}
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: 10,
              background: tile.bg,
              border: `1px solid ${tile.color}33`,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 9.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: tile.color,
                fontWeight: 700,
              }}
            >
              {tile.label}
            </span>
            <span
              style={{
                fontFamily: '"Manrope Variable", ui-sans-serif',
                fontSize: 24,
                fontWeight: 700,
                color: "#ECEEF5",
              }}
            >
              {data?.filter((lead: IntakeLead) => lead.status === tile.key).length ??
                0}
            </span>
          </div>
        ))}
      </div>
      {!data?.length ? (
        <IntakeEmpty hasFilters={hasFilters} />
      ) : (
        <div
          style={{
            margin: "0 28px",
            background: "#0D1424",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <DesktopIntakeTable />
        </div>
      )}
    </div>
  );
};

const StatusTabBar = () => {
  const { displayedFilters, filterValues = {}, setFilters } =
    useListContext<IntakeLead>();

  // Single query for all active-pipeline leads, count by status client-side
  const { data: allLeads = [] } = useGetList<IntakeLead>("intake_leads", {
    filter: { "status@in": ACTIVE_PIPELINE_FILTER },
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "id", order: "ASC" },
  });

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const lead of allLeads) {
      map[lead.status] = (map[lead.status] || 0) + 1;
    }
    return map;
  }, [allLeads]);

  const baseFilters = useMemo(() => {
    const next = { ...filterValues };
    delete next.status;
    delete next["status@eq"];
    delete next["status@in"];
    return next;
  }, [filterValues]);

  const tabs = [
    { id: "all", label: "All", count: allLeads.length },
    { id: "uncontacted", label: "Uncontacted", count: counts["uncontacted"] || 0 },
    { id: "in-sequence", label: "In Sequence", count: counts["in-sequence"] || 0 },
    { id: "engaged", label: "Engaged", count: counts["engaged"] || 0 },
    {
      id: "not-interested",
      label: "Not Interested",
      count: counts["not-interested"] || 0,
    },
    { id: "unresponsive", label: "Unresponsive", count: counts["unresponsive"] || 0 },
  ] as const;

  const activeTabId =
    typeof (filterValues["status@eq"] ?? filterValues.status) === "string" &&
    ACTIVE_PIPELINE_STATUSES.includes(
      (filterValues["status@eq"] ??
        filterValues.status) as (typeof ACTIVE_PIPELINE_STATUSES)[number],
    )
      ? (filterValues["status@eq"] ?? filterValues.status)
      : "all";

  const handleTabClick = (tabId: string) => {
    const filter =
      tabId === "all"
        ? { ...baseFilters, "status@in": ACTIVE_PIPELINE_FILTER }
        : { ...baseFilters, "status@eq": tabId };
    setFilters(filter, displayedFilters);
  };

  return (
    <div style={{ padding: "0 28px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
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
              color: isActive ? "#ECEEF5" : "#9AA3BE",
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
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace',
                fontSize: 10.5,
                padding: "1px 6px",
                borderRadius: 4,
                background: isActive
                  ? "rgba(77,200,232,0.08)"
                  : "rgba(255,255,255,0.04)",
                color: isActive ? "#4DC8E8" : "#5C6784",
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
        color: "#5C6784",
        fontSize: 13,
        background: "#0D1424",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#ECEEF5" }}>
          {hasFilters
            ? translate("resources.intake_leads.empty.no_match_title", {
                _: "No intake leads match these filters",
              })
            : translate("resources.intake_leads.empty.title", {
                _: "No intake leads yet",
              })}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "#5C6784" }}>
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
          color: "#5C6784",
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
        <div>{translate("resources.intake_leads.fields.city", { _: "City" })}</div>
        <div>{translate("resources.intake_leads.fields.source", { _: "Source" })}</div>
        <div>{translate("resources.intake_leads.fields.status", { _: "Status" })}</div>
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
            index < data.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none";

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
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#ECEEF5",
                    fontFamily: '"Manrope Variable", ui-sans-serif',
                  }}
                >
                  {record.business_name}
                </div>
                <div style={{ fontSize: 12.5, color: "#9AA3BE" }}>
                  <ReferenceField
                    source="trade_type_id"
                    reference="trade_types"
                    link={false}
                    empty={<span style={{ color: "#5C6784" }}>-</span>}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.07)",
                        background: "rgba(255,255,255,0.04)",
                        color: "#9AA3BE",
                        fontSize: 12,
                      }}
                    >
                      <TextField source="name" />
                    </span>
                  </ReferenceField>
                </div>
                <div style={{ fontSize: 12.5, color: "#9AA3BE" }}>
                  {record.city || "-"}
                </div>
                <div style={{ fontSize: 12.5, color: "#9AA3BE" }}>
                  {record.source || "-"}
                </div>
                <div style={{ fontSize: 12.5, color: "#9AA3BE" }}>
                  <IntakeStatusBadge status={record.status} />
                </div>
                <div style={{ fontSize: 12.5, color: "#9AA3BE" }}>
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
                      color: "#5C6784",
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

const OutreachProgress = ({ record }: { record: IntakeLead }) => {
  const nextDate = formatShortDate(record.next_outreach_date);
  const progressWidth = `${Math.max(
    0,
    Math.min(100, (record.outreach_sequence_step / OUTREACH_STEPS_TOTAL) * 100),
  )}%`;

  if (record.status === "uncontacted") {
    return <div style={{ fontSize: 11.5, color: "#5C6784" }}>Ready for first touch</div>;
  }

  if (record.status === "in-sequence") {
    return (
      <div style={{ display: "grid", gap: 6 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#ECEEF5",
            fontFamily: '"JetBrains Mono", ui-monospace',
          }}
        >
          Touch {record.outreach_sequence_step}/{OUTREACH_STEPS_TOTAL}
        </div>
        <div
          style={{
            height: 4,
            width: 140,
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              height: 4,
              borderRadius: 999,
              background: "#4DC8E8",
              width: progressWidth,
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: "#5C6784", marginTop: 2 }}>
          Next: {nextDate}
        </div>
      </div>
    );
  }

  if (record.status === "engaged") {
    return <div style={{ fontSize: 11.5, color: "#5C6784" }}>Reply received</div>;
  }

  if (record.status === "not-interested") {
    return <div style={{ fontSize: 11.5, color: "#5C6784" }}>Declined</div>;
  }

  if (record.status === "unresponsive") {
    return (
      <div style={{ fontSize: 11.5, color: "#5C6784" }}>
        Touch {record.outreach_sequence_step}/{OUTREACH_STEPS_TOTAL} &middot; Next:{" "}
        {nextDate}
      </div>
    );
  }

  if (record.status === "qualified") {
    return <div style={{ fontSize: 11.5, color: "#5C6784" }}>Promoted</div>;
  }

  if (record.status === "rejected") {
    return <div style={{ fontSize: 11.5, color: "#5C6784" }}>Rejected</div>;
  }

  return <div style={{ fontSize: 11.5, color: "#5C6784" }}>-</div>;
};

const IntakeActionButton = ({
  record,
  onToggleExpanded,
}: {
  record: IntakeLead;
  onToggleExpanded: (id: Identifier) => void;
}) => {
  const handleExpand = () => onToggleExpanded(record.id);
  const primaryButtonStyle = {
    padding: "6px 14px",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    color: "#34D399",
    background: "rgba(52,211,153,0.1)",
    border: "1px solid rgba(52,211,153,0.25)",
    cursor: "pointer",
  } as const;
  const secondaryButtonStyle = {
    padding: "6px 14px",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    color: "#9AA3BE",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    cursor: "pointer",
  } as const;
  const disabledButtonStyle = {
    ...secondaryButtonStyle,
    opacity: 0.5,
    cursor: "not-allowed",
  } as const;

  if (record.status === "engaged") {
    return (
      <div data-intake-promote-button>
        <IntakePromoteButton record={record} />
      </div>
    );
  }

  if (record.status === "qualified") {
    return (
      <button type="button" disabled style={disabledButtonStyle}>
        Promoted
      </button>
    );
  }

  if (record.status === "rejected") {
    return (
      <button type="button" disabled style={disabledButtonStyle}>
        Rejected
      </button>
    );
  }

  if (record.status === "not-interested") {
    return (
      <button type="button" onClick={handleExpand} style={secondaryButtonStyle}>
        Review Notes
      </button>
    );
  }

  if (record.status === "uncontacted") {
    return (
      <button type="button" onClick={handleExpand} style={primaryButtonStyle}>
        Send Outreach
      </button>
    );
  }

  if (record.status === "in-sequence" || record.status === "unresponsive") {
    return (
      <button type="button" onClick={handleExpand} style={secondaryButtonStyle}>
        View Sequence
      </button>
    );
  }

  return null;
};

const formatShortDate = (value: string | null) => {
  if (!value) {
    return "TBD";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};
