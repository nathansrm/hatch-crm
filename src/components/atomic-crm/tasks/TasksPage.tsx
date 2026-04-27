import { useMemo, useState } from "react";
import {
  type Identifier,
  useGetIdentity,
  useGetList,
  useGetMany,
  useTranslate,
} from "ra-core";
import { CheckCircle2, Clock, MoreHorizontal } from "lucide-react";

import type { Company, Contact } from "../types";
import type { Task } from "../types";
import { AddTask } from "./AddTask";
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

type TaskView = "all" | "overdue" | "today" | "this_week" | "later";
type TaskGroup = Exclude<TaskView, "all">;

type ContactDisplay = {
  name: string;
  companyName: string | null;
};

const VIEW_LABELS: Record<TaskView, string> = {
  all: "All tasks",
  overdue: "Overdue",
  today: "Today",
  this_week: "This week",
  later: "Later",
};

const VIEW_ORDER: TaskView[] = [
  "all",
  "overdue",
  "today",
  "this_week",
  "later",
];

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

const formatContactName = (contact: Contact) =>
  `${contact.first_name} ${contact.last_name}`.trim() || "Unknown contact";

const getTaskGroup = (task: Task): TaskGroup => {
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

const getVisibleTasks = (tasks: Task[]) =>
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
  selected,
  onSelect,
}: {
  task: Task;
  contact: ContactDisplay | undefined;
  selected: boolean;
  onSelect: () => void;
}) => {
  const meta = getTaskMeta(task.type);
  const Icon = meta.icon;
  const taskDone = isDone(task);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid w-full grid-cols-[44px_minmax(220px,1.8fr)_150px_130px_120px_44px] items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
        selected
          ? "border-cyan-500/40 bg-cyan-500/10"
          : "border-border/70 bg-card hover:bg-muted/40"
      }`}
    >
      <span className="grid h-5 w-5 place-items-center rounded border border-muted-foreground/40 bg-background">
        {taskDone ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-card-foreground">
          {task.text}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {contact?.name ?? "Unknown contact"}
          {contact?.companyName ? ` · ${contact.companyName}` : ""}
        </span>
      </span>
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {formatDueDate(task.due_date)}
      </span>
      <span className="inline-flex w-fit items-center gap-2 rounded-md bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${meta.accentClass}`} />
        {meta.label}
      </span>
      <span
        className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${
          taskDone
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-cyan-500/10 text-cyan-400"
        }`}
      >
        {taskDone ? "Done" : "Open"}
      </span>
      <span className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground">
        <MoreHorizontal className="h-4 w-4" />
      </span>
    </button>
  );
};

export const TasksPage = () => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  const [activeView, setActiveView] = useState<TaskView>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<Identifier | null>(null);

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
  const visibleTasks = useMemo(() => getVisibleTasks(taskList), [taskList]);
  const selectedTask =
    visibleTasks.find((task) => task.id === selectedTaskId) ?? null;
  const selectedContact =
    selectedTask != null
      ? contactDisplayMap.get(selectedTask.contact_id)
      : undefined;

  const viewCounts: Record<TaskView, number> = {
    all: visibleTasks.length,
    overdue: groups.overdue.length,
    today: groups.today.length,
    this_week: groups.this_week.length,
    later: groups.later.length,
  };

  // Wave 2: wire activeView into the visible task list filter (BRIEF-021)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <header className="border-b border-border bg-card px-7 py-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Work queue
            </div>
            <h1 className="font-heading m-0 text-2xl font-bold text-card-foreground">
              {translate("resources.tasks.name", {
                smart_count: 2,
                _: "Tasks",
              })}
            </h1>
          </div>
          <AddTask display="chip" selectContact />
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_300px] gap-0">
        <aside className="border-r border-border bg-card/60 p-4">
          <nav className="space-y-1">
            {VIEW_ORDER.map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeView === view
                    ? "bg-cyan-500/10 text-card-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span>{VIEW_LABELS[view]}</span>
                <span className="font-mono text-xs">{viewCounts[view]}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 overflow-y-auto p-5">
          <div className="mb-3 grid grid-cols-[44px_minmax(220px,1.8fr)_150px_130px_120px_44px] gap-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            <span />
            <span>Task</span>
            <span>Due</span>
            <span>Type</span>
            <span>Done</span>
            <span />
          </div>

          {isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-border bg-card p-8 text-center">
              <div>
                <p className="text-sm font-semibold text-card-foreground">
                  No tasks
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a task to start filling the queue.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {GROUP_ORDER.filter((group) => groups[group].length > 0).map(
                (group) => (
                  <section key={group} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {VIEW_LABELS[group]}
                      </h2>
                      <span className="font-mono text-xs text-muted-foreground">
                        {groups[group].length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groups[group].map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          contact={contactDisplayMap.get(task.contact_id)}
                          selected={selectedTaskId === task.id}
                          onSelect={() => setSelectedTaskId(task.id)}
                        />
                      ))}
                    </div>
                  </section>
                ),
              )}
            </div>
          )}
        </section>

        <aside className="border-l border-border bg-card p-5">
          {selectedTask == null ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <p className="text-sm font-semibold text-card-foreground">
                  Select a task
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Details appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="mb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Task details
                </p>
                <h2 className="font-heading text-lg font-bold text-card-foreground">
                  {selectedTask.text}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedContact?.name ?? "Unknown contact"}
                  {selectedContact?.companyName
                    ? ` · ${selectedContact.companyName}`
                    : ""}
                </p>
              </div>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Due
                  </dt>
                  <dd className="mt-1 text-card-foreground">
                    {formatDueDate(selectedTask.due_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Type
                  </dt>
                  <dd className="mt-1 text-card-foreground">
                    {getTaskMeta(selectedTask.type).label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Done
                  </dt>
                  <dd className="mt-1 text-card-foreground">
                    {isDone(selectedTask) ? "Done" : "Open"}
                  </dd>
                </div>
              </dl>

              <div className="mt-auto space-y-2">
                {["Mark complete", "Edit", "Delete"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled
                    title="Wired in Wave 2"
                    className="w-full rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};
