import { SaveButton } from "@/components/admin/form";
import type { Identifier } from "ra-core";
import { EditBase, Form, useEditContext, useTranslate } from "ra-core";

import { HatchDialog, HatchGhostButton } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
import type { Task } from "../types";
import { TaskSheetFormContent } from "./TaskCreateSheet";

export interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: Identifier;
}

export const TaskEditDialog = ({
  open,
  onOpenChange,
  taskId,
}: TaskEditDialogProps) => {
  return (
    <EditBase
      resource="tasks"
      id={taskId}
      redirect={false}
      mutationMode="undoable"
    >
      <TaskEditDialogInner open={open} onOpenChange={onOpenChange} />
    </EditBase>
  );
};

const TaskEditDialogInner = ({
  open,
  onOpenChange,
}: Pick<TaskEditDialogProps, "open" | "onOpenChange">) => {
  const translate = useTranslate();
  const { record, isPending } = useEditContext<Task>();

  return (
    <HatchDialog
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="EDIT TASK"
      title="What needs to happen?"
      subtitle={translate("resources.tasks.sheet.edit")}
      size="lg"
      contentClassName="max-h-[calc(100vh-48px)]"
      className="hatch-scrollbar-none max-h-[calc(100vh-190px)] overflow-y-auto"
      footer={
        <>
          <HatchGhostButton type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </HatchGhostButton>
          <SaveButton className={HATCH_PRIMARY_BUTTON_CLASS} />
        </>
      }
      wrap={(node) => (
        <Form
          key={record?.id == null ? "loading" : String(record.id)}
          defaultValues={record}
        >
          {node}
        </Form>
      )}
    >
      {isPending || record == null ? (
        <div className="h-72 animate-pulse rounded-lg bg-[rgba(255,255,255,0.04)]" />
      ) : (
        <TaskSheetFormContent />
      )}
    </HatchDialog>
  );
};
