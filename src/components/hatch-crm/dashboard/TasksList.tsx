import { useGetIdentity, useGetList } from "ra-core";

import type { Task } from "../types";
import { AddTask } from "../tasks/AddTask";
import { TasksListContent } from "../tasks/TasksListContent";

const getTodayDateKey = () => {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const getDateKey = (value?: string | null) => value?.slice(0, 10) ?? null;

const formatDueDate = (value: string) => {
  const dateKey = getDateKey(value);
  if (!dateKey) {
    return value;
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

type TasksListProps = {
  variant?: "default" | "sales";
};

export const TasksList = ({ variant = "default" }: TasksListProps) => {
  const { identity, isPending: identityPending } = useGetIdentity();
  const { data: tasks, isPending: tasksPending } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "due_date", order: "ASC" },
      filter: { "done_date@is": null, sales_id: identity?.id },
    },
    { enabled: variant === "sales" && identity?.id != null },
  );

  const todayKey = getTodayDateKey();
  const todayTasks =
    tasks?.filter((task) => getDateKey(task.due_date) === todayKey) ?? [];
  const overdueTasks =
    tasks?.filter((task) => {
      const dueDateKey = getDateKey(task.due_date);
      return dueDateKey != null && dueDateKey < todayKey;
    }) ?? [];

  if (variant === "default") {
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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            marginBottom: 12,
          }}
        >
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
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "#ECEEF5",
              }}
            >
              Up next
            </h3>
          </div>
          <AddTask display="icon" selectContact />
        </div>
        <TasksListContent />
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <h2 className="flex-1 text-xl font-semibold text-muted-foreground">
          Tasks
        </h2>
        <AddTask display="icon" selectContact />
      </div>
      <div className="mb-2 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        {identityPending || tasksPending ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : todayTasks.length === 0 && overdueTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks are due today or overdue.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
                TODAY
              </p>
              {todayTasks.length > 0 ? (
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border px-3 py-2.5"
                    >
                      <span className="mt-0.5 h-4 w-4 rounded-sm border border-muted-foreground/40 bg-background" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{task.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDueDate(task.due_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No follow-ups due today.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.2em] text-destructive">
                OVERDUE
              </p>
              {overdueTasks.length > 0 ? (
                <div className="space-y-2">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border border-destructive/20 px-3 py-2.5"
                    >
                      <span className="mt-0.5 h-4 w-4 rounded-sm border border-destructive/40 bg-background" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{task.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDueDate(task.due_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No overdue tasks.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
