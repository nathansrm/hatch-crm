import { format } from "date-fns";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  ListTodo,
  MessageSquarePlus,
  NotebookText,
  Plus,
  Save,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import {
  useCreate,
  useGetIdentity,
  useGetList,
  useRedirect,
  useRefresh,
  useUpdate,
  type Identifier,
} from "ra-core";
import { useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  HatchGhostButton,
  HatchPrimaryButton,
  HatchTabs,
  HatchTabsContent,
  HatchTabsList,
  HatchTabsTrigger,
} from "../../_primitives";
import type { AttachmentNote, Deal, DealNote, Task } from "../../types";

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
  on_track: "On track",
  at_risk: "At risk",
  behind: "Behind",
};

const NOTE_TAGS = [
  { value: "client-call", label: "Client call", color: "#4DC8E8" },
  { value: "internal", label: "Internal", color: "#B8C0D6" },
  { value: "decision", label: "Decision", color: "#34D399" },
  { value: "blocker", label: "Blocker", color: "#EF5A6F" },
  { value: "next-step", label: "Next step", color: "#F5B84A" },
] as const;

type NoteTagValue = (typeof NOTE_TAGS)[number]["value"];

type ProjectDraft = {
  phase: string;
  nextMilestone: string;
  eta: string;
  weeklyHours: string;
  progress: string;
  status: ActiveStatus;
};

const compactDate = (value?: string | null) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return format(date, "MMM d");
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 7,
  border: "1px solid rgba(255,255,255,0.09)",
  background: "rgba(255,255,255,0.035)",
  color: "var(--fg-1)",
  fontSize: 13,
  lineHeight: 1.4,
  padding: "8px 10px",
  outline: "none",
};

const panelStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: "var(--ink-3)",
  minWidth: 0,
};

const labelStyle: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--fg-3)",
};

const readMetadata = (deal: Deal | null, key: string, fallback = "") => {
  if (!deal) return fallback;
  const value = deal.metadata?.[key];
  return typeof value === "string" ? value : fallback;
};

const getInitialDraft = (deal: Deal | null): ProjectDraft => ({
  phase: readMetadata(deal, "project_phase"),
  nextMilestone: readMetadata(deal, "project_next_milestone"),
  eta: readMetadata(deal, "project_eta"),
  weeklyHours:
    typeof deal?.metadata?.project_weekly_hours === "number"
      ? String(deal.metadata.project_weekly_hours)
      : readMetadata(deal, "project_weekly_hours"),
  progress: String(deal?.project_progress_pct ?? 0),
  status: ((deal?.project_status ?? "on_track") as ActiveStatus) ?? "on_track",
});

const InitialsAvatar = ({
  name,
  size = 28,
}: {
  name: string;
  size?: number;
}) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return (
    <div
      className="font-mono"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue % 360}, 50%, 32%)`,
        border: `1px solid hsl(${hue % 360}, 50%, 44%)`,
        display: "grid",
        placeItems: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        color: "var(--white)",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
};

const HealthBadge = ({ status }: { status: ActiveStatus }) => {
  const color = healthColors[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        border: `1px solid ${color}33`,
        background: `${color}14`,
        color,
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: "0.05em",
        padding: "4px 8px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {healthLabels[status]}
    </span>
  );
};

const ProjectProgress = ({
  value,
  status,
}: {
  value: number;
  status: ActiveStatus;
}) => {
  const color = healthColors[status];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div
        style={{
          height: 6,
          flex: 1,
          borderRadius: 999,
          overflow: "hidden",
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            height: "100%",
            borderRadius: 999,
            background: color,
          }}
        />
      </div>
      <span
        className="font-mono"
        style={{
          width: 38,
          color,
          fontSize: 12,
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {value}%
      </span>
    </div>
  );
};

const getProjectTasks = (tasks: Task[], deal: Deal | null) => {
  if (!deal?.contact_ids?.length) return [];
  const contacts = new Set(deal.contact_ids.map(String));
  return tasks.filter((task) => contacts.has(String(task.contact_id)));
};

const getAttachments = (notes: DealNote[]): AttachmentNote[] =>
  notes.flatMap((note) => note.attachments ?? []);

const getNoteTag = (value?: string | null) =>
  NOTE_TAGS.find((tag) => tag.value === value) ?? {
    value: "general",
    label: "General",
    color: "#8EA0C8",
  };

export const ActiveProjectsGrid = () => {
  const isMobile = useIsMobile();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  const [update, { isPending: isUpdating }] = useUpdate<Deal>();
  const [createNote, { isPending: isCreatingNote }] = useCreate<DealNote>();
  const [selectedProjectId, setSelectedProjectId] = useState<Identifier | null>(
    null,
  );
  const [draft, setDraft] = useState<ProjectDraft>(getInitialDraft(null));
  const [noteText, setNoteText] = useState("");
  const [noteTag, setNoteTag] = useState<NoteTagValue>("client-call");

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

  const { data: dealNotes, refetch: refetchNotes } = useGetList<DealNote>(
    "deal_notes",
    {
      pagination: { page: 1, perPage: 10000 },
      sort: { field: "date", order: "DESC" },
    },
  );

  const { data: tasks } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: "due_date", order: "ASC" },
  });

  const companyNameById = useMemo(
    () =>
      new Map((companies ?? []).map((company) => [company.id, company.name])),
    [companies],
  );
  const salesNameById = useMemo(
    () =>
      new Map(
        (sales ?? []).map((person) => [
          person.id,
          `${person.first_name} ${person.last_name}`.trim(),
        ]),
      ),
    [sales],
  );

  const activeProjects = useMemo(
    () =>
      (deals ?? []).filter((deal) =>
        ACTIVE_PROJECT_STATUSES.includes(
          (deal.project_status ?? "") as ActiveStatus,
        ),
      ),
    [deals],
  );

  useEffect(() => {
    if (selectedProjectId != null) return;
    setSelectedProjectId(activeProjects[0]?.id ?? null);
  }, [activeProjects, selectedProjectId]);

  const selectedDeal =
    activeProjects.find((deal) => deal.id === selectedProjectId) ??
    activeProjects[0] ??
    null;

  useEffect(() => {
    setDraft(getInitialDraft(selectedDeal));
    setNoteText("");
    setNoteTag("client-call");
  }, [selectedDeal]);

  if (dealsPending || companiesPending) {
    return null;
  }

  const selectedStatus =
    ((selectedDeal?.project_status ?? "on_track") as ActiveStatus) ??
    "on_track";
  const selectedProgress = selectedDeal?.project_progress_pct ?? 0;
  const selectedNotes = (dealNotes ?? []).filter(
    (note) => String(note.deal_id) === String(selectedDeal?.id),
  );
  const selectedAttachments = getAttachments(selectedNotes);
  const selectedTasks = getProjectTasks(tasks ?? [], selectedDeal);
  const ownerName =
    selectedDeal?.sales_id != null
      ? (salesNameById.get(selectedDeal.sales_id as number | string) ??
        "Unassigned")
      : "Unassigned";
  const selectedCompany =
    selectedDeal?.company_id != null
      ? (companyNameById.get(selectedDeal.company_id as number) ?? "Unknown")
      : "Unknown";
  const selectedPhase = readMetadata(selectedDeal, "project_phase", "Not set");
  const selectedMilestone = readMetadata(
    selectedDeal,
    "project_next_milestone",
    "No milestone set",
  );
  const selectedEta = readMetadata(selectedDeal, "project_eta");

  const saveProjectDraft = () => {
    if (!selectedDeal) return;
    const progress = Math.max(
      0,
      Math.min(100, Number.parseInt(draft.progress, 10) || 0),
    );
    const weeklyHours = Number.parseFloat(draft.weeklyHours);
    const projectedHours =
      Number.isFinite(weeklyHours) && weeklyHours >= 0
        ? weeklyHours
        : selectedDeal.projected_hours;

    update(
      "deals",
      {
        id: selectedDeal.id,
        data: {
          ...selectedDeal,
          project_progress_pct: progress,
          project_status: draft.status,
          projected_hours: projectedHours,
          metadata: {
            ...(selectedDeal.metadata ?? {}),
            project_eta: draft.eta.trim(),
            project_next_milestone: draft.nextMilestone.trim(),
            project_phase: draft.phase.trim(),
            project_weekly_hours:
              Number.isFinite(weeklyHours) && weeklyHours >= 0
                ? weeklyHours
                : draft.weeklyHours.trim(),
          },
        },
        previousData: selectedDeal,
      },
      { onSuccess: () => refresh() },
    );
  };

  const markProjectComplete = () => {
    if (!selectedDeal) return;
    update(
      "deals",
      {
        id: selectedDeal.id,
        data: {
          ...selectedDeal,
          project_status: "complete",
          project_progress_pct: 100,
        },
        previousData: selectedDeal,
      },
      { onSuccess: () => refresh() },
    );
  };

  const submitNote = () => {
    if (!selectedDeal || !noteText.trim()) return;
    createNote(
      "deal_notes",
      {
        data: {
          deal_id: selectedDeal.id,
          type: noteTag,
          sales_id: identity?.id ?? selectedDeal.sales_id,
          date: new Date().toISOString(),
          text: noteText.trim(),
        },
      },
      {
        onSuccess: () => {
          setNoteText("");
          refetchNotes();
          refresh();
        },
      },
    );
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <style>
        {`
          .delivery-project-scroll,
          .delivery-panel-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .delivery-project-scroll::-webkit-scrollbar,
          .delivery-panel-scroll::-webkit-scrollbar {
            display: none;
          }

          .delivery-native-select option {
            background: #111827;
            color: #ECEEF5;
          }
        `}
      </style>
      {activeProjects.length === 0 ? (
        <div
          style={{
            ...panelStyle,
            padding: "34px 22px",
            textAlign: "center",
            color: "var(--fg-3)",
            fontSize: 13,
          }}
        >
          No active projects yet. Start onboarding a closed-won deal to create
          your first delivery project.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "minmax(0, 1fr)"
              : "300px minmax(430px, 1fr) minmax(360px, 0.9fr)",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          <aside style={{ ...panelStyle, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div style={labelStyle}>Queue</div>
                <h3
                  className="font-heading"
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 750,
                    color: "var(--fg-1)",
                  }}
                >
                  Active Projects
                </h3>
              </div>
              <HatchGhostButton
                size="icon"
                type="button"
                title="New project"
                onClick={() => redirect("/deals/create")}
                className="h-8 w-8 border border-[rgba(77,200,232,0.18)] bg-[rgba(77,200,232,0.06)] text-[#4DC8E8]"
              >
                <Plus className="h-4 w-4" />
              </HatchGhostButton>
            </div>

            <div
              className="delivery-project-scroll"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: 10,
                maxHeight: 640,
                overflowY: "auto",
              }}
            >
              {activeProjects.map((deal) => {
                const status = deal.project_status as ActiveStatus;
                const selected = deal.id === selectedDeal?.id;
                const companyName =
                  companyNameById.get(deal.company_id as number) ?? "Unknown";
                const phase = readMetadata(deal, "project_phase", "No phase");
                const milestone = readMetadata(
                  deal,
                  "project_next_milestone",
                  "No milestone set",
                );

                return (
                  <button
                    key={deal.id}
                    type="button"
                    onClick={() => setSelectedProjectId(deal.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderRadius: 10,
                      border: selected
                        ? "1px solid rgba(77,200,232,0.32)"
                        : "1px solid transparent",
                      background: selected
                        ? "rgba(77,200,232,0.08)"
                        : "rgba(255,255,255,0.025)",
                      padding: "12px 12px 11px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          className="font-heading"
                          style={{
                            color: "var(--fg-1)",
                            fontSize: 14,
                            fontWeight: 750,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {companyName}
                        </div>
                        <div
                          style={{
                            color: "var(--fg-3)",
                            fontSize: 12,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {deal.name}
                        </div>
                      </div>
                      <HealthBadge status={status} />
                    </div>
                    <ProjectProgress
                      value={deal.project_progress_pct ?? 0}
                      status={status}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginTop: 10,
                        color: "var(--fg-3)",
                        fontSize: 11.5,
                      }}
                    >
                      <span>{phase}</span>
                      <span style={{ textAlign: "right" }}>
                        {compactDate(readMetadata(deal, "project_eta"))}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 7,
                        color: "var(--fg-2)",
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {milestone}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <article style={{ ...panelStyle, padding: 18 }}>
            {selectedDeal ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  minHeight: isMobile ? "auto" : 640,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 18,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 7,
                      }}
                    >
                      <HealthBadge status={selectedStatus} />
                      <span
                        className="font-mono"
                        style={{ color: "var(--fg-3)", fontSize: 12 }}
                      >
                        Started {compactDate(selectedDeal.project_started_at)}
                      </span>
                    </div>
                    <h2
                      className="font-heading"
                      style={{
                        margin: 0,
                        color: "var(--fg-1)",
                        fontSize: 26,
                        fontWeight: 800,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {selectedCompany}
                    </h2>
                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "var(--fg-3)",
                        fontSize: 13,
                      }}
                    >
                      {selectedDeal.name}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      flexShrink: 0,
                    }}
                  >
                    <InitialsAvatar name={ownerName} />
                    <div>
                      <div style={labelStyle}>Owner</div>
                      <div
                        style={{
                          color: "var(--fg-1)",
                          fontSize: 13,
                          fontWeight: 650,
                        }}
                      >
                        {ownerName}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(77,200,232,0.2)",
                    background:
                      "linear-gradient(180deg, rgba(77,200,232,0.07), rgba(255,255,255,0.018))",
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div style={labelStyle}>Command center</div>
                      <div
                        className="font-heading"
                        style={{
                          color: "var(--fg-1)",
                          fontSize: 19,
                          fontWeight: 800,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {selectedPhase}
                      </div>
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        borderRadius: 8,
                        border: `1px solid ${healthColors[selectedStatus]}33`,
                        background: `${healthColors[selectedStatus]}12`,
                        color: healthColors[selectedStatus],
                        fontSize: 22,
                        fontWeight: 800,
                        padding: "7px 11px",
                      }}
                    >
                      {selectedProgress}%
                    </div>
                  </div>

                  <ProjectProgress
                    value={selectedProgress}
                    status={selectedStatus}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                      marginTop: 16,
                    }}
                  >
                    <MetricBlock
                      icon={<CalendarClock className="h-4 w-4" />}
                      label="ETA"
                      value={compactDate(selectedEta)}
                    />
                    <MetricBlock
                      icon={<Clock3 className="h-4 w-4" />}
                      label="Weekly hours"
                      value={`${selectedDeal.projected_hours ?? "0"}h`}
                    />
                    <MetricBlock
                      icon={<SlidersHorizontal className="h-4 w-4" />}
                      label="Health"
                      value={healthLabels[selectedStatus]}
                    />
                    <MetricBlock
                      icon={<NotebookText className="h-4 w-4" />}
                      label="Next milestone"
                      value={selectedMilestone}
                    />
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid var(--line)",
                    background: "rgba(255,255,255,0.02)",
                    padding: 14,
                  }}
                >
                  <div style={{ ...labelStyle, marginBottom: 10 }}>
                    Update project
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "minmax(0, 1fr)"
                        : "repeat(2, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    <label>
                      <div style={labelStyle}>Phase</div>
                      <input
                        value={draft.phase}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            phase: event.target.value,
                          }))
                        }
                        placeholder="Discovery, build, launch..."
                        style={inputStyle}
                      />
                    </label>
                    <label>
                      <div style={labelStyle}>Next milestone</div>
                      <input
                        value={draft.nextMilestone}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            nextMilestone: event.target.value,
                          }))
                        }
                        placeholder="Client review, kickoff, migration..."
                        style={inputStyle}
                      />
                    </label>
                    <label>
                      <div style={labelStyle}>ETA</div>
                      <input
                        type="date"
                        value={draft.eta}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            eta: event.target.value,
                          }))
                        }
                        style={inputStyle}
                      />
                    </label>
                    <label>
                      <div style={labelStyle}>Weekly hours</div>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={draft.weeklyHours}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            weeklyHours: event.target.value,
                          }))
                        }
                        placeholder="20"
                        style={inputStyle}
                      />
                    </label>
                    <label>
                      <div style={labelStyle}>Progress</div>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={draft.progress}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            progress: event.target.value,
                          }))
                        }
                        style={inputStyle}
                      />
                    </label>
                    <label>
                      <div style={labelStyle}>Health</div>
                      <select
                        className="delivery-native-select"
                        value={draft.status}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            status: event.target.value as ActiveStatus,
                          }))
                        }
                        style={inputStyle}
                      >
                        <option value="on_track">On track</option>
                        <option value="at_risk">At risk</option>
                        <option value="behind">Behind</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: isMobile ? "wrap" : "nowrap",
                    gap: 8,
                    marginTop: "auto",
                    paddingTop: 2,
                  }}
                >
                  <HatchPrimaryButton
                    type="button"
                    size="sm"
                    onClick={saveProjectDraft}
                    disabled={isUpdating}
                  >
                    <Save className="h-4 w-4" />
                    Update project
                  </HatchPrimaryButton>
                  <HatchGhostButton
                    type="button"
                    size="sm"
                    onClick={() => redirect("/tasks")}
                    className="border border-[rgba(255,255,255,0.08)]"
                  >
                    <ListTodo className="h-4 w-4" />
                    Add task
                  </HatchGhostButton>
                  <HatchGhostButton
                    type="button"
                    size="sm"
                    onClick={() => redirect("show", "deals", selectedDeal.id)}
                    className="border border-[rgba(255,255,255,0.08)]"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Open deal
                  </HatchGhostButton>
                  <HatchGhostButton
                    type="button"
                    size="sm"
                    onClick={markProjectComplete}
                    disabled={isUpdating}
                    className="ml-auto border border-[rgba(52,211,153,0.22)] text-[#34D399]"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark complete
                  </HatchGhostButton>
                </div>
              </div>
            ) : null}
          </article>

          <aside style={{ ...panelStyle, padding: 16 }}>
            <HatchTabs defaultValue="notes" className="flex h-full flex-col">
              <HatchTabsList>
                <HatchTabsTrigger value="notes">Notes</HatchTabsTrigger>
                <HatchTabsTrigger value="files">Files</HatchTabsTrigger>
                <HatchTabsTrigger value="tasks">Tasks</HatchTabsTrigger>
                <HatchTabsTrigger value="timeline">Timeline</HatchTabsTrigger>
              </HatchTabsList>

              <HatchTabsContent value="notes" className="mt-4 flex-1">
                <div
                  className="delivery-panel-scroll"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    maxHeight: 590,
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      borderRadius: 10,
                      border: "1px solid rgba(77,200,232,0.22)",
                      background: "rgba(77,200,232,0.045)",
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--fg-1)",
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 9,
                      }}
                    >
                      <MessageSquarePlus className="h-4 w-4 text-[#4DC8E8]" />
                      Add note
                    </div>
                    <textarea
                      value={noteText}
                      onChange={(event) => setNoteText(event.target.value)}
                      placeholder="Drop a client update, decision, blocker, or internal note..."
                      rows={4}
                      style={{
                        ...inputStyle,
                        minHeight: 92,
                        resize: "vertical",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 10,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          color: "var(--fg-3)",
                          fontSize: 11.5,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        <Tag className="h-3.5 w-3.5" />
                        Tag
                      </span>
                      {NOTE_TAGS.map((tag) => {
                        const selected = noteTag === tag.value;

                        return (
                          <button
                            key={tag.value}
                            type="button"
                            onClick={() => setNoteTag(tag.value)}
                            style={{
                              borderRadius: 999,
                              border: `1px solid ${tag.color}${selected ? "66" : "24"}`,
                              background: selected
                                ? `${tag.color}18`
                                : "rgba(255,255,255,0.025)",
                              color: selected ? tag.color : "var(--fg-2)",
                              cursor: "pointer",
                              fontSize: 11.5,
                              fontWeight: 750,
                              padding: "4px 8px",
                            }}
                          >
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 10,
                      }}
                    >
                      <HatchPrimaryButton
                        type="button"
                        size="sm"
                        onClick={submitNote}
                        disabled={!noteText.trim() || isCreatingNote}
                      >
                        Add note
                      </HatchPrimaryButton>
                    </div>
                  </div>

                  {selectedNotes.length > 0 ? (
                    selectedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        author={
                          note.sales_id != null
                            ? (salesNameById.get(
                                note.sales_id as number | string,
                              ) ?? "Team")
                            : "Team"
                        }
                      />
                    ))
                  ) : (
                    <EmptyPanel
                      icon={<NotebookText className="h-4 w-4" />}
                      text="No project notes yet."
                    />
                  )}
                </div>
              </HatchTabsContent>

              <HatchTabsContent value="files" className="mt-4">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <HatchGhostButton
                    type="button"
                    size="sm"
                    onClick={() =>
                      selectedDeal && redirect("show", "deals", selectedDeal.id)
                    }
                    className="w-fit border border-[rgba(77,200,232,0.18)] bg-[rgba(77,200,232,0.05)] text-[#4DC8E8]"
                  >
                    <Plus className="h-4 w-4" />
                    Attach file
                  </HatchGhostButton>
                  {selectedAttachments.length > 0 ? (
                    selectedAttachments.map((attachment, index) => (
                      <FileRow
                        key={`${attachment.title}-${index}`}
                        file={attachment}
                      />
                    ))
                  ) : (
                    <EmptyPanel
                      icon={<FileText className="h-4 w-4" />}
                      text="No files attached to this project."
                    />
                  )}
                </div>
              </HatchTabsContent>

              <HatchTabsContent value="tasks" className="mt-4">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {selectedTasks.length > 0 ? (
                    selectedTasks.map((task) => (
                      <div
                        key={task.id}
                        style={{
                          borderRadius: 10,
                          border: "1px solid var(--line)",
                          background: "rgba(255,255,255,0.025)",
                          padding: "11px 12px",
                        }}
                      >
                        <div
                          style={{
                            color: "var(--fg-1)",
                            fontSize: 13,
                            fontWeight: 650,
                            lineHeight: 1.35,
                          }}
                        >
                          {task.text}
                        </div>
                        <div
                          className="font-mono"
                          style={{
                            color: task.done_date
                              ? "var(--good)"
                              : "var(--fg-3)",
                            fontSize: 11.5,
                            marginTop: 7,
                          }}
                        >
                          {task.done_date
                            ? `Done ${compactDate(task.done_date)}`
                            : `Due ${compactDate(task.due_date)}`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyPanel
                      icon={<ListTodo className="h-4 w-4" />}
                      text="No linked tasks for this project's contacts."
                    />
                  )}
                </div>
              </HatchTabsContent>

              <HatchTabsContent value="timeline" className="mt-4">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <TimelineRow
                    label="Project started"
                    value={compactDate(selectedDeal?.project_started_at)}
                  />
                  <TimelineRow
                    label="Last deal update"
                    value={compactDate(selectedDeal?.updated_at)}
                  />
                  <TimelineRow
                    label="Latest note"
                    value={compactDate(selectedNotes[0]?.date)}
                  />
                  <TimelineRow
                    label="Expected close"
                    value={compactDate(selectedDeal?.expected_closing_date)}
                  />
                </div>
              </HatchTabsContent>
            </HatchTabs>
          </aside>
        </div>
      )}
    </section>
  );
};

const MetricBlock = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div
    style={{
      borderRadius: 10,
      border: "1px solid var(--line)",
      background: "rgba(255,255,255,0.02)",
      padding: "12px 13px",
      minWidth: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        color: "var(--fg-3)",
        marginBottom: 8,
      }}
    >
      {icon}
      <span style={{ ...labelStyle, marginBottom: 0 }}>{label}</span>
    </div>
    <div
      className="font-mono"
      style={{
        color: "var(--fg-1)",
        fontSize: 17,
        fontWeight: 750,
      }}
    >
      {value}
    </div>
  </div>
);

const NoteCard = ({ note, author }: { note: DealNote; author: string }) => (
  <NoteCardInner note={note} author={author} tag={getNoteTag(note.type)} />
);

const NoteCardInner = ({
  note,
  author,
  tag,
}: {
  note: DealNote;
  author: string;
  tag: ReturnType<typeof getNoteTag>;
}) => (
  <div
    style={{
      borderRadius: 10,
      border: "1px solid var(--line)",
      background: "rgba(255,255,255,0.025)",
      padding: "12px 13px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <InitialsAvatar name={author} size={24} />
        <div>
          <div
            style={{
              color: "var(--fg-1)",
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            {author}
          </div>
          <div
            className="font-mono"
            style={{ color: "var(--fg-3)", fontSize: 11 }}
          >
            {compactDate(note.date)}
          </div>
        </div>
      </div>
      <span
        style={{
          borderRadius: 5,
          border: `1px solid ${tag.color}40`,
          background: `${tag.color}14`,
          color: tag.color,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.06em",
          padding: "3px 7px",
          textTransform: "uppercase",
        }}
      >
        {tag.label}
      </span>
    </div>
    <div
      style={{
        color: "var(--fg-2)",
        fontSize: 13,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
      }}
    >
      {note.text}
    </div>
    {note.attachments?.length ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginTop: 10,
        }}
      >
        {note.attachments.map((attachment, index) => (
          <FileRow
            key={`${attachment.title}-${index}`}
            file={attachment}
            compact
          />
        ))}
      </div>
    ) : null}
  </div>
);

const FileRow = ({
  file,
  compact = false,
}: {
  file: AttachmentNote;
  compact?: boolean;
}) => (
  <a
    href={file.src}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      borderRadius: 8,
      border: "1px solid var(--line)",
      background: "rgba(255,255,255,0.025)",
      padding: compact ? "7px 9px" : "10px 11px",
      color: "var(--fg-1)",
      fontSize: compact ? 12 : 13,
      textDecoration: "none",
    }}
  >
    <FileText className="h-4 w-4 text-[#4DC8E8]" />
    <span
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {file.title}
    </span>
  </a>
);

const EmptyPanel = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div
    style={{
      borderRadius: 10,
      border: "1px dashed rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.018)",
      color: "var(--fg-3)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 13,
      padding: "18px 14px",
    }}
  >
    {icon}
    <span>{text}</span>
  </div>
);

const TimelineRow = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      borderRadius: 10,
      border: "1px solid var(--line)",
      background: "rgba(255,255,255,0.025)",
      padding: "11px 12px",
    }}
  >
    <span style={{ color: "var(--fg-2)", fontSize: 13 }}>{label}</span>
    <span className="font-mono" style={{ color: "var(--fg-1)", fontSize: 12 }}>
      {value}
    </span>
  </div>
);
