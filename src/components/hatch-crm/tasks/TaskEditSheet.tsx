import { SaveButton } from "@/components/admin/form";
import type { Identifier } from "ra-core";
import { EditBase, Form, useTranslate } from "ra-core";
import { HatchGhostButton, HatchSheet } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
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
        >
          <Form className="flex min-h-0 flex-1 flex-col">
            {node}
          </Form>
        </EditBase>
      )}
    >
      <TaskSheetFormContent />
    </HatchSheet>
  );
};
