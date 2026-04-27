import { SaveButton } from "@/components/admin/form";
import { ReferenceField } from "@/components/admin";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import type { Identifier } from "ra-core";
import {
  EditBase,
  Form,
  useGetRecordRepresentation,
  useTranslate,
} from "ra-core";
import { TaskSheetFormContent, TaskSheetHeader } from "./TaskCreateSheet";

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
  const getContactRepresentation = useGetRecordRepresentation("contacts");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-edit-title"
        aria-describedby={undefined}
        className="flex h-dvh w-full flex-col border-l border-[rgba(255,255,255,0.07)] p-0 text-[#ECEEF5] sm:max-w-xl"
        style={{
          background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <EditBase
          resource="tasks"
          id={taskId}
          redirect={false}
          mutationMode="undoable"
        >
          <Form className="flex min-h-0 flex-1 flex-col">
            <ReferenceField
              source="contact_id"
              reference="contacts"
              render={({ referenceRecord }) => (
                <TaskSheetHeader
                  eyebrow="EDIT TASK"
                  titleId="task-edit-title"
                  subtitle={
                    referenceRecord
                      ? translate("resources.tasks.sheet.edit_for", {
                          name: getContactRepresentation(referenceRecord),
                        })
                      : translate("resources.tasks.sheet.edit")
                  }
                />
              )}
            />
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <TaskSheetFormContent />
            </div>
            <SheetFooter className="flex-row justify-end gap-3 border-t border-[rgba(255,255,255,0.07)] px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                className="text-[#B8C0D6] hover:text-[#ECEEF5]"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <SaveButton className="bg-[#4DC8E8] text-[#06111F] hover:bg-[#7DDCF0]" />
            </SheetFooter>
          </Form>
        </EditBase>
      </SheetContent>
    </Sheet>
  );
};
