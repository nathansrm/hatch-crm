import { format } from "date-fns";
import { useGetList, useRedirect, useRefresh, useUpdate } from "ra-core";
import { useState } from "react";

import type { Deal, DealNote } from "../../types";
import { calcUtilization } from "./DeliveryKPIs";
import { useAgencySettings } from "@/hooks/useAgencySettings";

type CompanyRecord = {
  id: number;
  name: string;
};

type SalesRecord = {
  id: number | string;
  first_name: string;
  last_name: string;
};

const ACTIVE_PROJECT_STATUSES = ["on_track", "at_risk", "behind"] as const;
type ActiveStatus = (typeof ACTIVE_PROJECT_STATUSES)[number];

const healthColors: Record<ActiveStatus, string> = {
  on_track: "#34D399",
  at_risk: "#F5B84A",
  behind: "#EF5A6F",
};

const healthLabels: Record<ActiveStatus, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  behind: "Behind",
};

const InitialsAvatar = ({
  name,
  size = 28,
}: {
  name: string;
  size?: number;
}) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue}, 50%, 32%)`,
        border: `1px solid hsl(${hue}, 50%, 44%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        color: "#fff",
        fontFamily: "JetBrains Mono, monospace",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
};

// Lazy-loaded when a card is expanded — only fires one query per expanded project
const ProjectAttachments = ({ dealId }: { dealId: string | number }) => {
  const { data: notes } = useGetList<DealNote>("deal_notes", {
    filter: { deal_id: dealId },
    pagination: { page: 1, perPage: 20 },
    sort: { field: "date", order: "DESC" },
  });

  const allAttachments = (notes ?? []).flatMap((n) => n.attachments ?? []);

  if (allAttachments.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "var(--fg-3)" }}>
        No files attached.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {allAttachments.map((att, i) => (
        <a
          key={i}
          href={att.src}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: 12,
            color: "var(--hatch-cyan)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span style={{ fontSize: 11 }}>⎘</span>
          {att.title}
        </a>
      ))}
    </div>
  );
};

type EditMode =
  | { type: "note"; dealId: string | number }
  | { type: "progress"; dealId: string | number }
  | null;

export const ActiveProjectsGrid = () => {
  const { weekly_capacity_hours: WEEKLY_CAPACITY_HOURS } = useAgencySettings();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const [update, { isPending: isUpdating }] = useUpdate<Deal>();
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editValue, setEditValue] = useState("");

  const { data: deals, isPending: dealsPending } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 10000 },
  });

  const { data: companies, isPending: companiesPending } =
    useGetList<CompanyRecord>("companies", {
      pagination: { page: 1, perPage: 10000 },
    });

  const { data: sales } = useGetList<SalesRecord>("sales", {
    pagination: { page: 1, perPage: 100 },
  });

  if (dealsPending || companiesPending) {
    return null;
  }

  const companyNameById = new Map(
    (companies ?? []).map((c) => [c.id, c.name]),
  );
  const salesNameById = new Map(
    (sales ?? []).map((s) => [s.id, `${s.first_name} ${s.last_name}`.trim()]),
  );

  const activeProjects =
    deals?.filter((deal) =>
      ACTIVE_PROJECT_STATUSES.includes(
        (deal.project_status ?? "") as ActiveStatus,
      ),
    ) ?? [];

  const totalProjectedHours = activeProjects.reduce(
    (sum, deal) => sum + (deal.projected_hours ?? 0),
    0,
  );
  const utilization = calcUtilization(activeProjects, WEEKLY_CAPACITY_HOURS);
  const overCapacity = totalProjectedHours > WEEKLY_CAPACITY_HOURS;
  const nearCapacity = !overCapacity && utilization >= 85;
  const capacityColor = overCapacity
    ? "#F87171"
    : nearCapacity
      ? "#F5B84A"
      : "#34D399";
  const capacityLabel = overCapacity
    ? "Over capacity"
    : nearCapacity
      ? "Near capacity"
      : "On track";

  const handleToggle = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
    setEditMode(null);
    setEditValue("");
  };

  const handleMarkComplete = (deal: Deal) => {
    update(
      "deals",
      {
        id: deal.id,
        data: { ...deal, project_status: "complete", project_progress_pct: 100 },
        previousData: deal,
      },
      { onSuccess: () => refresh() },
    );
  };

  const startEdit = (type: "note" | "progress", deal: Deal) => {
    setEditMode({ type, dealId: deal.id });
    if (type === "note") {
      setEditValue(
        (deal.metadata?.project_notes as string | undefined) ??
          deal.description ??
          "",
      );
    } else {
      setEditValue(String(deal.project_progress_pct ?? 0));
    }
  };

  const saveEdit = (deal: Deal) => {
    if (!editMode) return;
    if (editMode.type === "note") {
      update(
        "deals",
        {
          id: deal.id,
          data: {
            ...deal,
            metadata: { ...(deal.metadata ?? {}), project_notes: editValue },
          },
          previousData: deal,
        },
        {
          onSuccess: () => {
            setEditMode(null);
            refresh();
          },
        },
      );
    } else {
      const pct = Math.min(100, Math.max(0, Number.parseInt(editValue, 10) || 0));
      update(
        "deals",
        {
          id: deal.id,
          data: { ...deal, project_progress_pct: pct },
          previousData: deal,
        },
        {
          onSuccess: () => {
            setEditMode(null);
            refresh();
          },
        },
      );
    }
  };

  const subLabelStyle: React.CSSProperties = {
    fontSize: 9.5,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--fg-3)",
    fontWeight: 700,
    marginBottom: 6,
  };

  const detailPanelStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid var(--line)",
  };

  return (
    <section>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--hatch-cyan)",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            In delivery
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily:
                "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#ECEEF5",
              letterSpacing: "-0.01em",
            }}
          >
            Active Projects
          </h3>
        </div>
        <button
          type="button"
          onClick={() => redirect("/deals/create")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            background: "rgba(77,200,232,0.06)",
            border: "1px solid rgba(77,200,232,0.2)",
            borderRadius: 7,
            color: "var(--hatch-cyan)",
            fontWeight: 600,
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          + New project
        </button>
      </div>

      {/* Capacity meter */}
      {activeProjects.length > 0 && (
        <div
          style={{
            borderRadius: 12,
            background: "#0D1424",
            border: `1px solid ${overCapacity ? "rgba(248,113,113,0.25)" : "var(--line)"}`,
            padding: "14px 18px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--fg-3)",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Capacity
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 15,
                fontWeight: 700,
                color: "#ECEEF5",
                letterSpacing: "-0.01em",
              }}
            >
              {totalProjectedHours}h
              <span style={{ color: "var(--fg-3)", fontWeight: 500 }}>
                {" "}
                / {WEEKLY_CAPACITY_HOURS}h weekly
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${Math.min(100, utilization)}%`,
                  background: `linear-gradient(90deg, ${capacityColor}aa, ${capacityColor})`,
                  borderRadius: 3,
                  transition: "width 0.5s",
                }}
              />
              {overCapacity && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: "100%",
                    transform: "translateX(-2px)",
                    width: 2,
                    background: "#ECEEF5",
                    opacity: 0.5,
                  }}
                />
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 13,
                fontWeight: 700,
                color: capacityColor,
              }}
            >
              {utilization}%
            </span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: capacityColor,
                background: `${capacityColor}14`,
                border: `1px solid ${capacityColor}33`,
                padding: "4px 10px",
                borderRadius: 5,
              }}
            >
              {capacityLabel}
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeProjects.length === 0 && (
        <div
          style={{
            padding: "32px 22px",
            textAlign: "center",
            color: "var(--fg-3)",
            fontSize: 13,
            borderRadius: 12,
            background: "#0D1424",
            border: "1px solid var(--line)",
          }}
        >
          No active projects yet.
        </div>
      )}

      {/* Project rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {activeProjects.map((deal) => {
          const status = deal.project_status as ActiveStatus;
          const color = healthColors[status];
          const progress = deal.project_progress_pct ?? 0;
          const expanded = expandedId === deal.id;
          const ownerName =
            salesNameById.get(deal.sales_id as number | string) ?? "—";
          const projectNotes =
            (deal.metadata?.project_notes as string | undefined) ??
            deal.description ??
            "";
          const taskCount =
            (deal.metadata?.project_task_count as number | undefined) ?? 0;
          const phase =
            (deal.metadata?.project_phase as string | undefined) ?? "—";
          const isEditingNote =
            editMode?.type === "note" && editMode.dealId === deal.id;
          const isEditingProgress =
            editMode?.type === "progress" && editMode.dealId === deal.id;

          return (
            <div
              key={deal.id}
              style={{
                borderRadius: 12,
                background: "#0D1424",
                border: expanded
                  ? "1px solid rgba(77,200,232,0.25)"
                  : "1px solid var(--line)",
                overflow: "hidden",
                transition: "border 0.2s",
              }}
            >
              {/* Row header — clickable */}
              <div className="obs-interactive-row"
                role="button"
                tabIndex={0}
                onClick={() => handleToggle(deal.id)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleToggle(deal.id)
                }
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr auto",
                  gap: 20,
                  padding: "16px 22px",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                {/* Company + deal */}
                <div>
                  <div
                    style={{
                      fontFamily:
                        "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                      fontSize: 14.5,
                      fontWeight: 700,
                      color: "#ECEEF5",
                      marginBottom: 3,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {companyNameById.get(deal.company_id as number) ??
                      "Unknown"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-3)" }}>
                    {deal.name}
                  </div>
                </div>

                {/* Health badge */}
                <div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color,
                      background: `${color}14`,
                      border: `1px solid ${color}33`,
                      padding: "4px 10px",
                      borderRadius: 5,
                    }}
                  >
                    {healthLabels[status]}
                  </span>
                </div>

                {/* Phase */}
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--fg-3)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    Phase
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--fg-1)",
                      fontWeight: 500,
                    }}
                  >
                    {phase}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--fg-3)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    Progress
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 5,
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 3,
                        overflow: "hidden",
                        minWidth: 60,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${color}aa, ${color})`,
                          borderRadius: 3,
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 11,
                        fontWeight: 600,
                        color,
                        minWidth: 30,
                      }}
                    >
                      {progress}%
                    </span>
                  </div>
                </div>

                {/* Started */}
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--fg-3)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    Started
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--fg-1)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {deal.project_started_at
                      ? format(new Date(deal.project_started_at), "MMM d")
                      : "—"}
                  </div>
                </div>

                {/* Chevron */}
                <div
                  style={{
                    fontSize: 16,
                    color: "var(--fg-3)",
                    userSelect: "none",
                  }}
                >
                  {expanded ? "▲" : "▼"}
                </div>
              </div>

              {/* Expanded detail panel */}
              {expanded && (
                <div
                  style={{
                    padding: "0 22px 18px",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  {/* 3-col detail grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 14,
                      paddingTop: 16,
                    }}
                  >
                    {/* Notes */}
                    <div style={detailPanelStyle}>
                      <div style={subLabelStyle}>Notes</div>
                      {isEditingNote ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <textarea className="obs-action-btn"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={4}
                            autoFocus
                            style={{
                              width: "100%",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(77,200,232,0.3)",
                              borderRadius: 6,
                              color: "#ECEEF5",
                              fontSize: 12.5,
                              lineHeight: 1.5,
                              padding: "8px 10px",
                              resize: "vertical",
                              fontFamily: "inherit",
                            }}
                          />
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveEdit(deal);
                              }}
                              disabled={isUpdating}
                              style={{
                                padding: "5px 12px",
                                borderRadius: 6,
                                border: "none",
                                background: "var(--hatch-cyan)",
                                color: "#061022",
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditMode(null);
                              }}
                              style={{
                                padding: "5px 12px",
                                borderRadius: 6,
                                border: "1px solid var(--line)",
                                background: "transparent",
                                color: "var(--fg-2)",
                                fontSize: 11.5,
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "var(--fg-2)",
                            lineHeight: 1.5,
                          }}
                        >
                          {projectNotes || (
                            <span style={{ color: "var(--fg-4)", fontStyle: "italic" }}>
                              No notes yet.
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Owner */}
                    <div style={detailPanelStyle}>
                      <div style={subLabelStyle}>Owner</div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <InitialsAvatar name={ownerName} size={28} />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#ECEEF5",
                          }}
                        >
                          {ownerName}
                        </span>
                      </div>
                    </div>

                    {/* Open tasks */}
                    <div style={detailPanelStyle}>
                      <div style={subLabelStyle}>Open tasks</div>
                      <div
                        style={{
                          fontFamily:
                            "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
                          fontSize: 28,
                          fontWeight: 700,
                          color:
                            taskCount > 0 ? "var(--warn)" : "var(--good)",
                        }}
                      >
                        {taskCount}
                      </div>
                    </div>
                  </div>

                  {/* Attachments row */}
                  <div
                    style={{
                      marginTop: 12,
                      padding: "12px 14px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div style={subLabelStyle}>Files</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          redirect("show", "deals", deal.id);
                        }}
                        style={{
                          fontSize: 11,
                          color: "var(--hatch-cyan)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          fontWeight: 600,
                        }}
                      >
                        + Attach file →
                      </button>
                    </div>
                    <ProjectAttachments dealId={deal.id} />
                  </div>

                  {/* Inline progress edit */}
                  {isEditingProgress && (
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <input className="obs-action-btn"
                        type="number"
                        min={0}
                        max={100}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        style={{
                          width: 72,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(77,200,232,0.3)",
                          borderRadius: 6,
                          color: "#ECEEF5",
                          fontSize: 14,
                          fontFamily: "JetBrains Mono, monospace",
                          padding: "6px 10px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--fg-3)",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        %
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEdit(deal);
                        }}
                        disabled={isUpdating}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 6,
                          border: "none",
                          background: "var(--hatch-cyan)",
                          color: "#061022",
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditMode(null);
                        }}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                          background: "transparent",
                          color: "var(--fg-2)",
                          fontSize: 11.5,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div
                    style={{ display: "flex", gap: 8, marginTop: 12 }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit("progress", deal);
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 7,
                        border: "1px solid var(--line)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--fg-2)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Update progress
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit("note", deal);
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 7,
                        border: "1px solid var(--line)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--fg-2)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Add note
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkComplete(deal);
                      }}
                      disabled={isUpdating}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 7,
                        border: "1px solid rgba(77,200,232,0.25)",
                        background: "rgba(77,200,232,0.06)",
                        color: "var(--hatch-cyan)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: isUpdating ? "not-allowed" : "pointer",
                        opacity: isUpdating ? 0.6 : 1,
                      }}
                    >
                      Mark complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
