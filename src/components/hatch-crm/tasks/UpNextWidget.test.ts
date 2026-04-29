import { afterEach, describe, expect, it, vi } from "vitest";
import { startOfToday } from "date-fns/startOfToday";
import { AlertCircle } from "lucide-react";

import type { Task } from "../types";
import { FALLBACK_TASK_META, getTaskMeta } from "./taskTypeMeta";
import { getTaskGroup, getVisibleTasks } from "./upNextWidgetUtils";

describe("UpNextWidget task derivation", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("groups a task due exactly at start of today as today", () => {
    vi.setSystemTime(new Date("2026-02-24T12:00:00Z"));

    const task: Task = {
      id: 1,
      contact_id: 1,
      type: "call",
      text: "Call customer",
      due_date: startOfToday().toISOString(),
      done_date: null,
    };

    expect(getTaskGroup(task)).toBe("today");
  });

  it("keeps open and recently done tasks visible", () => {
    vi.setSystemTime(new Date("2026-02-24T12:00:00Z"));

    const tasks: Task[] = [
      {
        id: 1,
        contact_id: 1,
        type: "call",
        text: "Open task",
        due_date: new Date().toISOString(),
        done_date: null,
      },
      {
        id: 2,
        contact_id: 1,
        type: "email",
        text: "Recently done task",
        due_date: new Date().toISOString(),
        done_date: new Date(Date.now() - 60 * 1000).toISOString(),
      },
      {
        id: 3,
        contact_id: 1,
        type: "meeting",
        text: "Long done task",
        due_date: new Date().toISOString(),
        done_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
    ];

    expect(getVisibleTasks(tasks)).toHaveLength(2);
  });

  it("falls back for unknown task types", () => {
    expect(getTaskMeta("xyz")).toBe(FALLBACK_TASK_META);
    expect(getTaskMeta("xyz").icon).toBe(AlertCircle);
  });
});
