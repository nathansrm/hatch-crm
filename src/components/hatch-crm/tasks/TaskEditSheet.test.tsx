import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { buildContact, StoryWrapper } from "@/test/StoryWrapper";
import { TaskEditSheet } from "./TaskEditSheet";

describe("TaskEditSheet", () => {
  it("closes after a successful save", async () => {
    const onOpenChange = vi.fn();

    const screen = await render(
      <StoryWrapper
        data={{
          contacts: [
            buildContact({
              id: 1,
            }),
          ],
          tasks: [
            {
              contact_id: 1,
              due_date: "2026-03-06T12:00:00.000Z",
              id: 1,
              sales_id: 0,
              text: "Follow up on intake",
              type: "email",
            },
          ],
        }}
      >
        <TaskEditSheet open onOpenChange={onOpenChange} taskId={1} />
      </StoryWrapper>,
    );

    await screen.getByLabelText(/^task$/i).fill("Send proposal recap");
    await screen.getByRole("button", { name: /^save$/i }).click();

    await expect.poll(() => onOpenChange).toHaveBeenCalledWith(false);
    await expect.element(screen.getByText("Task updated")).toBeInTheDocument();
  });
});
