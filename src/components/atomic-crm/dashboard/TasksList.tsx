import { CheckSquare } from "lucide-react";
import { useGetIdentity, useGetList, useTranslate } from "ra-core";
import { Card } from "@/components/ui/card";

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
  const translate = useTranslate();
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
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <div className="mr-3 flex">
            <CheckSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="flex-1 text-xl font-semibold text-muted-foreground">
            {translate("crm.dashboard.upcoming_tasks", {
              _: "Upcoming Tasks",
            })}
          </h2>
          <AddTask display="icon" selectContact />
        </div>
        <Card className="mb-2 p-4">
          <TasksListContent />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <CheckSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="flex-1 text-xl font-semibold text-muted-foreground">
          Tasks
        </h2>
        <AddTask display="icon" selectContact />
      </div>
      <Card className="mb-2 p-4">
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
      </Card>
    </div>
  );
};
