import type { Task } from "../types";
import {
  isDone,
  isDueLater,
  isDueThisWeek,
  isDueToday,
  isDueTomorrow,
  isOverdue,
  isRecentlyDone,
} from "./tasksPredicate";

export type TaskGroup = "overdue" | "today" | "this_week" | "later";

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
