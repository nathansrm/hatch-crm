import {
  EditBase,
  Form,
  useNotify,
  useTranslate,
  type Identifier,
} from "ra-core";
import { DeleteButton } from "@/components/admin/delete-button";
import { SaveButton } from "@/components/admin/form";

import { HatchDialog } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
import { TaskFormContent } from "./TaskFormContent";

export const TaskEdit = ({
  open,
  close,
  taskId,
}: {
  taskId: Identifier;
  open: boolean;
  close: () => void;
}) => {
  const notify = useNotify();
  const translate = useTranslate();
  if (!open || !taskId) return null;

  return (
    <HatchDialog
      open={open}
      onOpenChange={close}
      eyebrow="EDIT TASK"
      title={translate("resources.tasks.action.edit")}
      size="lg"
      contentClassName="max-h-[90vh]"
      wrap={(node) => (
        <EditBase
          id={taskId}
          resource="tasks"
          className="mt-0"
          mutationOptions={{
            onSuccess: () => {
              close();
              notify("resources.tasks.updated", {
                type: "info",
                undoable: true,
              });
            },
          }}
          redirect={false}
        >
          <Form className="flex flex-col gap-4">{node}</Form>
        </EditBase>
      )}
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          <DeleteButton
            mutationOptions={{
              onSuccess: () => {
                close();
                notify("resources.tasks.deleted", {
                  type: "info",
                  undoable: true,
                });
              },
            }}
            redirect={false}
          />
          <SaveButton
            label="ra.action.save"
            className={HATCH_PRIMARY_BUTTON_CLASS}
          />
        </div>
      }
    >
      <TaskFormContent />
    </HatchDialog>
  );
};
