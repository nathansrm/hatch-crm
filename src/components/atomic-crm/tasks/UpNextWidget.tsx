import { useMemo, useState } from "react";
import {
  type Identifier,
  useGetIdentity,
  useGetList,
  useGetMany,
} from "ra-core";
import { ChevronDown, ChevronUp } from "lucide-react";

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

const GROUP_CLASSES: Record<TaskGroup, string> = {
  overdue: "text-destructive",
  today: "text-cyan-400",
  this_week: "text-violet-400",
  later: "text-muted-foreground",
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
}: {
  task: Task;
  contact: ContactDisplay | undefined;
}) => {
  const meta = getTaskMeta(task.type);
  const Icon = meta.icon;

  return (
    <li className="group flex items-start gap-3 rounded-lg border border-border/70 bg-card/70 px-3 py-3 transition-colors hover:bg-muted/40">
      <span
        className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md ${meta.bgClass}`}
      >
        <Icon className={`h-4 w-4 ${meta.accentClass}`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-card-foreground">
          {task.text}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{contact?.name ?? "Unknown contact"}</span>
          {contact?.companyName ? <span>{contact.companyName}</span> : null}
        </span>
      </span>
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {formatDueDate(task.due_date)}
      </span>
    </li>
  );
};

export const UpNextWidget = () => {
  const { identity } = useGetIdentity();
  const [expanded, setExpanded] = useState(false);

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

  return (
    <section className="relative flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-border/70 bg-card p-5 text-card-foreground shadow-sm">
      <header className="mb-4 flex items-start justify-between border-b border-border/70 pb-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Today
          </div>
          <h3 className="font-heading m-0 text-base font-bold">Up next</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {visibleCount} open or recently completed
          </p>
        </div>
        <AddTask display="icon" selectContact />
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
                  className={`text-[11px] font-bold uppercase tracking-[0.18em] ${GROUP_CLASSES[group]}`}
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
    </section>
  );
};
