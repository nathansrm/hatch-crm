import { SaveButton } from "@/components/admin/form";
import type { Identifier } from "ra-core";
import {
  EditBase,
  Form,
  useEditContext,
  useNotify,
  useTranslate,
} from "ra-core";
import type { ReactNode } from "react";
import { HatchGhostButton, HatchSheet } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
import type { Task } from "../types";
import { TaskSheetFormContent } from "./TaskCreateSheet";

export interface TaskEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: Identifier;
}

export const TaskEditSheet = ({
  open,
  onOpenChange,
  taskId,
}: TaskEditSheetProps) => {
  const translate = useTranslate();
  const notify = useNotify();
  return (
    <HatchSheet
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="EDIT TASK"
      title="What needs to happen?"
      titleId="task-edit-title"
      contentClassName="sm:max-w-xl"
      subtitle={translate("resources.tasks.sheet.edit")}
      footer={
        <>
          <HatchGhostButton type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </HatchGhostButton>
          <SaveButton className={HATCH_PRIMARY_BUTTON_CLASS} />
        </>
      }
      wrap={(node) => (
        <EditBase
          resource="tasks"
          id={taskId}
          redirect={false}
          mutationMode="undoable"
          mutationOptions={{
            onSuccess: () => {
              onOpenChange(false);
              notify("resources.tasks.updated", {
                type: "info",
                undoable: true,
              });
            },
          }}
        >
          <TaskEditSheetForm>{node}</TaskEditSheetForm>
        </EditBase>
      )}
    >
      <TaskSheetFormContent />
    </HatchSheet>
  );
};

const TaskEditSheetForm = ({ children }: { children: ReactNode }) => {
  const { isPending, record } = useEditContext<Task>();

  if (isPending || record == null) {
    return null;
  }

  return (
    <Form
      key={String(record.id)}
      defaultValues={record}
      className="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </Form>
  );
};
