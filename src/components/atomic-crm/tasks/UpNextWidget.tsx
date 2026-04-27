import { useMemo, useState } from "react";
import {
  type Identifier,
  useGetIdentity,
  useGetList,
  useGetMany,
  useDeleteWithUndoController,
  useNotify,
  useUpdate,
} from "ra-core";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Company, Contact } from "../types";
import type { Task } from "../types";
import { TaskCreateSheet } from "./TaskCreateSheet";
import { TaskEditSheet } from "./TaskEditSheet";
import { getTaskMeta } from "./taskTypeMeta";
import {
  isDone,
  isDueLater,
  isDueThisWeek,
  isDueToday,
  isDueTomorrow,
  isOverdue,
  isRecentlyDone,
} from "./tasksPredicate";

type TaskGroup = "overdue" | "today" | "this_week" | "later";

type ContactDisplay = {
  name: string;
  companyName: string | null;
};

const GROUP_LABELS: Record<TaskGroup, string> = {
  overdue: "Overdue",
  today: "Today",
  this_week: "This week",
  later: "Later",
};

const GROUP_COLORS: Record<TaskGroup, string> = {
  overdue: "#F87171",
  today: "#4DC8E8",
  this_week: "#A78BFA",
  later: "#9AA3BE",
};

const GROUP_ORDER: TaskGroup[] = ["overdue", "today", "this_week", "later"];

const formatDueDate = (value: string) => {
  const dateKey = value.slice(0, 10);
  const [year, month, day] = dateKey.split("-").map(Number);

  if (year == null || month == null || day == null) {
    return value;
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const getTaskGroup = (task: Task): TaskGroup => {
  if (isOverdue(task.due_date)) {
    return "overdue";
  }

  if (isDueToday(task.due_date)) {
    return "today";
  }

  if (isDueTomorrow(task.due_date) || isDueThisWeek(task.due_date)) {
    return "this_week";
  }

  if (isDueLater(task.due_date)) {
    return "later";
  }

  return "later";
};

export const getVisibleTasks = (tasks: Task[]) =>
  tasks.filter((task) => !isDone(task) || isRecentlyDone(task));

const buildTaskGroups = (tasks: Task[]) => {
  const groups: Record<TaskGroup, Task[]> = {
    overdue: [],
    today: [],
    this_week: [],
    later: [],
  };

  getVisibleTasks(tasks).forEach((task) => {
    groups[getTaskGroup(task)].push(task);
  });

  return groups;
};

const formatContactName = (contact: Contact) =>
  `${contact.first_name} ${contact.last_name}`.trim() || "Unknown contact";

const useContactDisplayMap = (tasks: Task[]) => {
  const contactIds = useMemo(
    () => Array.from(new Set<Identifier>(tasks.map((task) => task.contact_id))),
    [tasks],
  );

  const { data: contacts } = useGetMany<Contact>(
    "contacts",
    { ids: contactIds },
    { enabled: contactIds.length > 0 },
  );

  const companyIds = useMemo(
    () =>
      Array.from(
        new Set<Identifier>(
          (contacts ?? [])
            .map((contact) => contact.company_id)
            .filter((companyId) => companyId != null),
        ),
      ),
    [contacts],
  );

  const { data: companies } = useGetMany<Company>(
    "companies",
    { ids: companyIds },
    { enabled: companyIds.length > 0 },
  );

  return useMemo(() => {
    const companyMap = new Map<Identifier, Company>(
      (companies ?? []).map((company) => [company.id, company]),
    );

    return new Map<Identifier, ContactDisplay>(
      (contacts ?? []).map((contact) => [
        contact.id,
        {
          name: formatContactName(contact),
          companyName:
            contact.company_name ??
            (contact.company_id != null
              ? (companyMap.get(contact.company_id)?.name ?? null)
              : null),
        },
      ]),
    );
  }, [companies, contacts]);
};

const TaskRow = ({
  task,
  contact,
  onToggle,
  onEdit,
}: {
  task: Task;
  contact: ContactDisplay | undefined;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
}) => {
  const meta = getTaskMeta(task.type);
  const Icon = meta.icon;
  const taskDone = isDone(task);
  const notify = useNotify();
  const { handleDelete } = useDeleteWithUndoController({
    record: task,
    resource: "tasks",
    redirect: false,
    mutationOptions: {
      onSuccess() {
        notify("resources.tasks.deleted", { undoable: true });
      },
    },
  });

  return (
    <li
      className={`group flex items-start gap-3 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-3 py-3 transition-colors hover:bg-[rgba(255,255,255,0.06)] ${
        taskDone ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        aria-label={`Mark "${task.text}" ${taskDone ? "incomplete" : "complete"}`}
        aria-pressed={taskDone}
        onClick={() => onToggle(task)}
        className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.03)] text-white transition-colors hover:border-[#4DC8E8]"
      >
        {taskDone ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : null}
      </button>
      <span
        className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md ${meta.bgClass}`}
      >
        <Icon className={`h-4 w-4 ${meta.accentClass}`} />
      </span>
      <span className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className={`block max-w-full truncate text-left text-sm font-semibold text-[#ECEEF5] hover:text-[#4DC8E8] ${
            taskDone ? "line-through" : ""
          }`}
        >
          {task.text}
        </button>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9AA3BE]">
          <span>{contact?.name ?? "Unknown contact"}</span>
          {contact?.companyName ? <span>{contact.companyName}</span> : null}
        </span>
      </span>
      <span className="shrink-0 text-xs font-medium text-[#9AA3BE]">
        {formatDueDate(task.due_date)}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Task actions for "${task.text}"`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#9AA3BE] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ECEEF5]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          style={{
            background: "#0D1424",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#ECEEF5",
          }}
        >
          <DropdownMenuItem
            className="cursor-pointer"
            style={{ color: "#ECEEF5" }}
            onClick={handleDelete}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
};

export const UpNextWidget = () => {
  const { identity } = useGetIdentity();
  const [expanded, setExpanded] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<Identifier | null>(null);
  const [update] = useUpdate();

  const { data: tasks, isPending } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "due_date", order: "ASC" },
      filter: { sales_id: identity?.id },
    },
    { enabled: !!identity },
  );

  const taskList = tasks ?? [];
  const contactDisplayMap = useContactDisplayMap(taskList);
  const groups = useMemo(() => buildTaskGroups(taskList), [taskList]);
  const visibleCount = GROUP_ORDER.reduce(
    (count, group) => count + groups[group].length,
    0,
  );

  const visibleGroups = GROUP_ORDER.filter((group) => groups[group].length > 0);
  const renderedGroups = expanded ? visibleGroups : visibleGroups.slice(0, 3);
  const handleToggle = (task: Task) => {
    update(
      "tasks",
      {
        id: task.id,
        data: { done_date: task.done_date ? null : new Date().toISOString() },
        previousData: task,
      },
      { mutationMode: "undoable" },
    );
  };

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        padding: "20px 22px",
        background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        minHeight: 320,
      }}
    >
      <header className="mb-4 flex items-start justify-between border-b border-[rgba(255,255,255,0.07)] pb-4">
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#5C6784",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Today
          </div>
          <h3
            className="font-heading"
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "#ECEEF5",
              margin: 0,
            }}
          >
            Up next
          </h3>
          <p style={{ color: "#9AA3BE", fontSize: 12, marginTop: 4 }}>
            {visibleCount} open or recently completed
          </p>
        </div>
        <button
          type="button"
          aria-label="Create task"
          onClick={() => setCreateOpen(true)}
          className="grid h-8 w-8 place-items-center rounded-md text-[#9AA3BE] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ECEEF5]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : visibleCount === 0 ? (
        <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-border/70 p-6 text-center">
          <div>
            <p className="text-sm font-semibold text-card-foreground">No tasks</p>
            <p className="mt-1 text-xs text-muted-foreground">
              New follow-ups will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4">
          {renderedGroups.map((group) => (
            <section key={group} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: GROUP_COLORS[group] }}
                >
                  {GROUP_LABELS[group]}
                </h4>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {groups[group].length}
                </span>
              </div>
              <ul className="space-y-2">
                {groups[group].slice(0, expanded ? undefined : 3).map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    contact={contactDisplayMap.get(task.contact_id)}
                    onToggle={handleToggle}
                    onEdit={(task) => setEditingTaskId(task.id)}
                  />
                ))}
              </ul>
            </section>
          ))}
          {visibleGroups.length > 3 || visibleCount > 9 ? (
            <button
              type="button"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-md border border-border/70 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? (
                <>
                  Collapse <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          ) : null}
        </div>
      )}
      {editingTaskId != null ? (
        <TaskEditSheet
          taskId={editingTaskId}
          open={editingTaskId != null}
          onOpenChange={(open) => {
            if (!open) setEditingTaskId(null);
          }}
        />
      ) : null}
      <TaskCreateSheet open={createOpen} onOpenChange={setCreateOpen} />
    </section>
  );
};
