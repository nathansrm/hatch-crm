import { render } from "vitest-browser-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Task } from "../types";
import { UpNextWidget } from "./UpNextWidget";

const testState = vi.hoisted(() => ({
  tasks: [] as Task[],
  update: vi.fn(),
  deleteHandler: vi.fn(),
  listeners: [] as Array<() => void>,
}));

vi.mock("ra-core", async () => {
  const React = await import("react");
  return {
    useGetIdentity: () => ({ identity: { id: 0 } }),
    useGetList: () => {
      const [, setVersion] = React.useState(0);
      React.useEffect(() => {
        const listener = () => setVersion((version) => version + 1);
        testState.listeners.push(listener);
        return () => {
          testState.listeners = testState.listeners.filter(
            (current) => current !== listener,
          );
        };
      }, []);
      return { data: testState.tasks, isPending: false };
    },
    useGetMany: (resource: string) => ({
      data:
        resource === "contacts"
          ? [{ id: 1, first_name: "Ada", last_name: "Lovelace" }]
          : [],
    }),
    useUpdate: () => [
      (resource: string, params: any, options: any) => {
        testState.update(resource, params, options);
        testState.tasks = testState.tasks.map((task) =>
          task.id === params.id ? { ...task, ...params.data } : task,
        );
        testState.listeners.forEach((listener) => listener());
      },
    ],
    useDeleteWithUndoController: () => ({
      handleDelete: testState.deleteHandler,
    }),
    useNotify: () => vi.fn(),
  };
});

vi.mock("./TaskEditSheet", () => ({
  TaskEditSheet: ({ taskId }: { taskId: string | number }) => (
    <div data-testid="task-edit-sheet">Editing {taskId}</div>
  ),
}));

vi.mock("./TaskCreateSheet", () => ({
  TaskCreateSheet: () => null,
}));

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  contact_id: 1,
  type: "call",
  text: "Call Ada",
  due_date: "2026-04-27T12:00:00.000Z",
  done_date: null,
  ...overrides,
});

describe("UpNextWidget interactions", () => {
  beforeEach(() => {
    testState.tasks = [buildTask()];
    testState.update.mockClear();
    testState.deleteHandler.mockClear();
    testState.listeners = [];
  });

  it("optimistically strikes through a completed row", async () => {
    const screen = await render(<UpNextWidget />);

    await screen.getByLabelText(/mark "call ada" complete/i).click();

    await expect
      .element(screen.getByText("Call Ada"))
      .toHaveClass(/line-through/);
  });

  it("sends an ISO done_date when completing a task", async () => {
    const screen = await render(<UpNextWidget />);

    await screen.getByLabelText(/mark "call ada" complete/i).click();

    expect(testState.update).toHaveBeenCalledWith(
      "tasks",
      expect.objectContaining({
        data: { done_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/) },
      }),
      { mutationMode: "undoable" },
    );
  });

  it("sends done_date null when reopening a completed task", async () => {
    testState.tasks = [buildTask({ done_date: "2026-04-27T12:00:00.000Z" })];
    const screen = await render(<UpNextWidget />);

    await screen.getByLabelText(/mark "call ada" incomplete/i).click();

    expect(testState.update).toHaveBeenCalledWith(
      "tasks",
      expect.objectContaining({ data: { done_date: null } }),
      { mutationMode: "undoable" },
    );
  });

  it("opens TaskEditSheet for the clicked task text", async () => {
    const screen = await render(<UpNextWidget />);

    await screen.getByText("Call Ada").click();

    await expect.element(screen.getByText("Editing 1")).toBeInTheDocument();
  });

  it("routes delete through the undo controller", async () => {
    const screen = await render(<UpNextWidget />);

    await screen.getByLabelText(/task actions for "call ada"/i).click();
    await screen.getByText("Delete").click();

    expect(testState.deleteHandler).toHaveBeenCalled();
  });
});
