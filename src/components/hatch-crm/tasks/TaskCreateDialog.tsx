import {
  CreateBase,
  Form,
  type Identifier,
  useDataProvider,
  useGetIdentity,
  useGetOne,
  useGetRecordRepresentation,
  useNotify,
  useTranslate,
  useUpdate,
} from "ra-core";
import { useQueryClient } from "@tanstack/react-query";
import { SaveButton } from "@/components/admin/form";

import { HatchDialog, HatchGhostButton } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
import type { Task } from "../types";
import { TaskSheetFormContent } from "./TaskCreateSheet";

export interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact_id?: Identifier;
}

export const TaskCreateDialog = ({
  open,
  onOpenChange,
  contact_id,
}: TaskCreateDialogProps) => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const getContactRepresentation = useGetRecordRepresentation("contacts");

  const selectContact = contact_id == null;
  const { data: contact } = useGetOne(
    "contacts",
    { id: contact_id! },
    { enabled: !selectContact },
  );
  const [update] = useUpdate();
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();
  const notify = useNotify();

  if (!identity) return null;

  const handleSuccess = async (data: Task) => {
    const referenceRecordId = data.contact_id;
    if (!referenceRecordId) return;
    const { data: contact } = await dataProvider.getOne("contacts", {
      id: referenceRecordId,
    });
    if (!contact) return;
    await update("contacts", {
      id: referenceRecordId as unknown as Identifier,
      data: { last_seen: new Date().toISOString() },
      previousData: contact,
    });
    queryClient.invalidateQueries({
      queryKey: ["contacts", "getOne"],
    });

    notify("resources.tasks.added");
    onOpenChange(false);
  };

  return (
    <HatchDialog
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="NEW TASK"
      title="What needs to happen?"
      subtitle={
        !selectContact
          ? translate("resources.tasks.dialog.create_for", {
              name: getContactRepresentation(contact!),
            })
          : translate("resources.tasks.dialog.create")
      }
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
        <CreateBase
          resource="tasks"
          redirect={false}
          record={{
            type: "none",
            contact_id,
            due_date: new Date().toISOString(),
            sales_id: identity.id,
          }}
          mutationOptions={{
            onSuccess: handleSuccess,
          }}
        >
          <Form>{node}</Form>
        </CreateBase>
      )}
    >
      <TaskSheetFormContent selectContact={selectContact} />
    </HatchDialog>
  );
};
