import { MemoryRouter } from "react-router";
import { render } from "vitest-browser-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Task } from "../types";
import { TasksPage } from "./TasksPage";

const testState = vi.hoisted(() => ({
  tasks: [] as Task[],
  update: vi.fn(),
  deleteHandler: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("ra-core", () => ({
  useGetIdentity: () => ({ identity: { id: 0 } }),
  useGetList: () => ({ data: testState.tasks, isPending: false }),
  useGetMany: (resource: string) => ({
    data:
      resource === "contacts"
        ? [{ id: 1, first_name: "Ada", last_name: "Lovelace" }]
        : [],
  }),
  useTranslate: () => (key: string, options?: { _: string }) =>
    options?._ ?? key,
  useUpdate: () => [testState.update],
  useRedirect: () => testState.redirect,
  useDeleteWithUndoController: () => ({
    handleDelete: testState.deleteHandler,
  }),
  useNotify: () => vi.fn(),
}));

vi.mock("./TaskEditDialog", () => ({
  TaskEditDialog: ({ taskId }: { taskId: string | number }) => (
    <div data-testid="task-edit-dialog">Editing {taskId}</div>
  ),
}));

vi.mock("./TaskCreateDialog", () => ({
  TaskCreateDialog: () => null,
}));

const buildTask = (id: number, done: boolean): Task => ({
  id,
  contact_id: 1,
  type: "call",
  text: `${done ? "Done" : "Open"} task ${id}`,
  due_date: "2026-04-27T12:00:00.000Z",
  done_date: done ? "2026-04-27T13:00:00.000Z" : null,
});

describe("TasksPage", () => {
  beforeEach(() => {
    testState.update.mockClear();
    testState.deleteHandler.mockClear();
    testState.redirect.mockClear();
    testState.tasks = [
      buildTask(1, true),
      buildTask(2, true),
      buildTask(3, true),
      buildTask(4, false),
      buildTask(5, false),
    ];
  });

  it("filters view=completed to done tasks only", async () => {
    const { container } = await render(
      <MemoryRouter initialEntries={["/tasks?view=completed"]}>
        <TasksPage />
      </MemoryRouter>,
    );

    expect(container.textContent?.match(/Done task \d/g) ?? []).toHaveLength(3);
    expect(container.textContent).not.toContain("Open task 4");
    expect(container.textContent).not.toContain("Open task 5");
  });
});
