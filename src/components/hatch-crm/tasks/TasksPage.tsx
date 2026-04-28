import { useMemo, useState } from "react";
import {
  type Identifier,
  useGetIdentity,
  useGetList,
  useGetMany,
  useDeleteWithUndoController,
  useNotify,
  useTranslate,
  useUpdate,
} from "ra-core";
import { Check, Clock, MoreHorizontal, Plus } from "lucide-react";
import { useSearchParams } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  HatchCard,
  HatchPageHeader,
  HatchPanel,
  HatchPrimaryButton,
  HATCH,
} from "../_primitives";
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

type TaskView = "all" | "open" | "completed";
type TaskGroup = "overdue" | "today" | "this_week" | "later";

type ContactDisplay = {
  name: string;
  companyName: string | null;
};

const VIEW_LABELS: Record<TaskView, string> = {
  all: "All",
  open: "Open",
  completed: "Completed",
};

const VIEW_ORDER: TaskView[] = ["all", "open", "completed"];

const GROUP_ORDER: TaskGroup[] = ["overdue", "today", "this_week", "later"];

const GROUP_LABELS: Record<TaskGroup, string> = {
  overdue: "Overdue",
  today: "Today",
  this_week: "This week",
  later: "Later",
};

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

const buildTaskGroups = (tasks: Task[], includeCompleted = false) => {
  const groups: Record<TaskGroup, Task[]> = {
    overdue: [],
    today: [],
    this_week: [],
    later: [],
  };

  (includeCompleted ? tasks : getVisibleTasks(tasks)).forEach((task) => {
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
  onToggle,
  onEdit,
}: {
  task: Task;
  contact: ContactDisplay | undefined;
  selected: boolean;
  onSelect: () => void;
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
    <div
      className={`grid w-full grid-cols-[44px_minmax(220px,1.8fr)_150px_130px_120px_44px] items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
        selected
          ? "border-[#4DC8E8]/40 bg-[#4DC8E8]/10"
          : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]"
      } ${taskDone ? "opacity-50" : ""}`}
      onClick={onSelect}
    >
      <button
        type="button"
        aria-label={`Mark "${task.text}" ${taskDone ? "incomplete" : "complete"}`}
        aria-pressed={taskDone}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(task);
        }}
        className="grid h-5 w-5 place-items-center rounded border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.03)]"
      >
        {taskDone ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : null}
      </button>
      <span className="min-w-0">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(task);
          }}
          className={`block max-w-full truncate text-left text-sm font-semibold text-[#ECEEF5] hover:text-[#4DC8E8] ${
            taskDone ? "line-through" : ""
          }`}
        >
          {task.text}
        </button>
        <span className="mt-1 block truncate text-xs text-[#9AA3BE]">
          {contact?.name ?? "Unknown contact"}
          {contact?.companyName ? ` - ${contact.companyName}` : ""}
        </span>
      </span>
      <span className="flex items-center gap-2 text-xs font-medium text-[#9AA3BE]">
        <Clock className="h-3.5 w-3.5" />
        {formatDueDate(task.due_date)}
      </span>
      <span className="inline-flex w-fit items-center gap-2 rounded-md bg-[rgba(255,255,255,0.04)] px-2 py-1 text-xs font-medium text-[#9AA3BE]">
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Task actions for "${task.text}"`}
            onClick={(event) => event.stopPropagation()}
            className="grid h-8 w-8 place-items-center rounded-md text-[#9AA3BE] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ECEEF5]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={handleDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const TasksPage = () => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view");
  const activeView: TaskView =
    viewParam === "all" || viewParam === "completed" ? viewParam : "open";
  const [selectedTaskId, setSelectedTaskId] = useState<Identifier | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<Identifier | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
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

  const taskList = useMemo(() => tasks ?? [], [tasks]);
  const contactDisplayMap = useContactDisplayMap(taskList);
  const filteredTasks = useMemo(() => {
    if (activeView === "completed") {
      return taskList.filter((task) => isDone(task));
    }
    if (activeView === "open") {
      return taskList.filter((task) => !isDone(task));
    }
    return taskList;
  }, [activeView, taskList]);
  const groups = useMemo(
    () => buildTaskGroups(filteredTasks, activeView === "completed"),
    [activeView, filteredTasks],
  );
  const visibleTasks = useMemo(
    () =>
      activeView === "completed"
        ? filteredTasks
        : getVisibleTasks(filteredTasks),
    [activeView, filteredTasks],
  );
  const selectedTask =
    visibleTasks.find((task) => task.id === selectedTaskId) ?? null;
  const selectedContact =
    selectedTask != null
      ? contactDisplayMap.get(selectedTask.contact_id)
      : undefined;

  const viewCounts: Record<TaskView, number> = {
    all: taskList.length,
    open: taskList.filter((task) => !isDone(task)).length,
    completed: taskList.filter((task) => isDone(task)).length,
  };

  const handleViewChange = (view: string) => {
    const nextView: TaskView =
      view === "all" || view === "completed" ? view : "open";
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("view", nextView);
    setSearchParams(nextParams, { replace: true });
  };
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
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto p-7"
      style={{ background: HATCH.surface }}
    >
      <header className="pb-5">
        <HatchPageHeader
          eyebrow="WORK QUEUE"
          title={translate("resources.tasks.name", {
            smart_count: 2,
            _: "Tasks",
          })}
          count={visibleTasks.length}
          countSuffix="visible tasks"
          actions={
            <HatchPrimaryButton
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {translate("resources.tasks.action.add", { _: "Add task" })}
            </HatchPrimaryButton>
          }
        />
        <Tabs
          value={activeView}
          onValueChange={handleViewChange}
          className="mt-5"
        >
          <TabsList className="bg-[rgba(255,255,255,0.04)]">
            {VIEW_ORDER.map((view) => (
              <TabsTrigger
                key={view}
                value={view}
                className="data-[state=active]:bg-[#4DC8E8] data-[state=active]:text-[#06111F]"
              >
                {VIEW_LABELS[view]}
                <span className="ml-2 font-mono text-xs">
                  {viewCounts[view]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_300px] gap-5">
        <HatchPanel className="p-4">
          <nav className="space-y-1">
            {VIEW_ORDER.map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => handleViewChange(view)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeView === view
                    ? "bg-[#4DC8E8]/10 text-[#ECEEF5]"
                    : "text-[#9AA3BE] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#ECEEF5]"
                }`}
              >
                <span>{VIEW_LABELS[view]}</span>
                <span className="font-mono text-xs">{viewCounts[view]}</span>
              </button>
            ))}
          </nav>
        </HatchPanel>

        <HatchPanel className="min-w-0 overflow-y-auto p-5">
          <div className="mb-3 grid grid-cols-[44px_minmax(220px,1.8fr)_150px_130px_120px_44px] gap-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5C6784]">
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
                  className="h-16 animate-pulse rounded-lg bg-[rgba(255,255,255,0.04)]"
                />
              ))}
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] p-8 text-center">
              <div>
                <p className="text-sm font-semibold text-[#ECEEF5]">
                  No tasks
                </p>
                <p className="mt-1 text-sm text-[#9AA3BE]">
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
                        {GROUP_LABELS[group]}
                      </h2>
                      <span className="font-mono text-xs text-[#9AA3BE]">
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
                          onToggle={handleToggle}
                          onEdit={(task) => setEditingTaskId(task.id)}
                        />
                      ))}
                    </div>
                  </section>
                ),
              )}
            </div>
          )}
        </HatchPanel>

        <HatchCard padding="md" className="min-h-0 overflow-y-auto">
          {selectedTask == null ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <p className="text-sm font-semibold text-[#ECEEF5]">
                  Select a task
                </p>
                <p className="mt-1 text-xs text-[#9AA3BE]">
                  Details appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="mb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#5C6784]">
                  Task details
                </p>
                <h2 className="font-heading text-lg font-bold text-[#ECEEF5]">
                  {selectedTask.text}
                </h2>
                <p className="mt-2 text-sm text-[#9AA3BE]">
                  {selectedContact?.name ?? "Unknown contact"}
                  {selectedContact?.companyName
                    ? ` - ${selectedContact.companyName}`
                    : ""}
                </p>
              </div>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C6784]">
                    Due
                  </dt>
                  <dd className="mt-1 text-[#ECEEF5]">
                    {formatDueDate(selectedTask.due_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C6784]">
                    Type
                  </dt>
                  <dd className="mt-1 text-[#ECEEF5]">
                    {getTaskMeta(selectedTask.type).label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C6784]">
                    Done
                  </dt>
                  <dd className="mt-1 text-[#ECEEF5]">
                    {isDone(selectedTask) ? "Done" : "Open"}
                  </dd>
                </div>
              </dl>

              <div className="mt-auto space-y-2">
                <button
                  type="button"
                  onClick={() => handleToggle(selectedTask)}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.07)] px-3 py-2 text-sm font-semibold text-[#ECEEF5] hover:bg-[rgba(255,255,255,0.04)]"
                >
                  {isDone(selectedTask) ? "Mark incomplete" : "Mark complete"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTaskId(selectedTask.id)}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.07)] px-3 py-2 text-sm font-semibold text-[#ECEEF5] hover:bg-[rgba(255,255,255,0.04)]"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </HatchCard>
      </main>
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
    </div>
  );
};
