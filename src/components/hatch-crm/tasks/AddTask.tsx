import { Plus } from "lucide-react";
import {
  CreateBase,
  Form,
  useDataProvider,
  useGetIdentity,
  useGetRecordRepresentation,
  useNotify,
  useRecordContext,
  useTranslate,
  useUpdate,
} from "ra-core";
import { useState } from "react";
import { SaveButton } from "@/components/admin/form";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { HatchDialog } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
import type { Task } from "../types";
import { TaskFormContent } from "./TaskFormContent";

export const AddTask = ({
  selectContact,
  display = "chip",
}: {
  selectContact?: boolean;
  display?: "chip" | "icon";
}) => {
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  const [update] = useUpdate();
  const notify = useNotify();
  const translate = useTranslate();
  const contact = useRecordContext();
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const getContactRepresentation = useGetRecordRepresentation("contacts");

  const handleSuccess = async (data: Task) => {
    setOpen(false);
    const contact = await dataProvider.getOne("contacts", {
      id: data.contact_id,
    });
    if (!contact.data) return;

    await update("contacts", {
      id: contact.data.id,
      data: { last_seen: new Date().toISOString() },
      previousData: contact.data,
    });

    notify("resources.tasks.added");
  };

  if (!identity) return null;

  return (
    <>
      {display === "icon" ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="p-2 cursor-pointer"
                onClick={handleOpen}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {translate("resources.tasks.action.create")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="my-2">
          <Button
            variant="outline"
            className="h-6 cursor-pointer"
            onClick={handleOpen}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            {translate("resources.tasks.action.add")}
          </Button>
        </div>
      )}

      <HatchDialog
        open={open}
        onOpenChange={() => setOpen(false)}
        eyebrow="NEW TASK"
        title={
          !selectContact
            ? translate("resources.tasks.dialog.create_for", {
                name: getContactRepresentation(contact!),
              })
            : translate("resources.tasks.dialog.create")
        }
        size="lg"
        footer={<SaveButton className={HATCH_PRIMARY_BUTTON_CLASS} />}
        wrap={(node) => (
          <CreateBase
            resource="tasks"
            record={{
              type: "none",
              contact_id: contact?.id,
              due_date: new Date().toISOString(),
              sales_id: identity.id,
            }}
            mutationOptions={{ onSuccess: handleSuccess }}
          >
            <Form className="flex flex-col gap-4">{node}</Form>
          </CreateBase>
        )}
      >
        <TaskFormContent selectContact={selectContact} />
      </HatchDialog>
    </>
  );
};
