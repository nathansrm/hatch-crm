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
import type React from "react";
import { SaveButton } from "@/components/admin/form";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { foreignKeyMapping } from "../notes/foreignKeyMapping";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useFormContext } from "react-hook-form";

import { contactOptionText } from "../misc/ContactOption";
import { TASK_TYPE_META } from "./taskTypeMeta";

export interface TaskCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact_id?: Identifier;
}

export const TaskCreateSheet = ({
  open,
  onOpenChange,
  contact_id,
}: TaskCreateSheetProps) => {
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

  const handleSuccess = async (data: any) => {
    const referenceRecordId = data[foreignKeyMapping["contacts"]];
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
    // No redirect, only close the sheet
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-create-title"
        aria-describedby={undefined}
        className="flex h-dvh w-full flex-col border-l border-[rgba(255,255,255,0.07)] p-0 text-[#ECEEF5] sm:max-w-xl"
        style={{
          background: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
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
          <Form className="flex min-h-0 flex-1 flex-col">
            <TaskSheetHeader
              eyebrow="NEW TASK"
              titleId="task-create-title"
              subtitle={
                !selectContact
                  ? translate("resources.tasks.dialog.create_for", {
                      name: getContactRepresentation(contact!),
                    })
                  : translate("resources.tasks.dialog.create")
              }
            />
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <TaskSheetFormContent selectContact={selectContact} />
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
        </CreateBase>
      </SheetContent>
    </Sheet>
  );
};

export const TaskSheetHeader = ({
  eyebrow,
  titleId,
  subtitle,
}: {
  eyebrow: string;
  titleId: string;
  subtitle?: React.ReactNode;
}) => (
  <SheetHeader className="border-b border-[rgba(255,255,255,0.07)] px-6 py-5 text-left">
    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5C6784]">
      {eyebrow}
    </div>
    <SheetTitle
      id={titleId}
      className="font-heading text-xl font-bold text-[#ECEEF5]"
    >
      What needs to happen?
    </SheetTitle>
    {subtitle ? <p className="text-sm text-[#B8C0D6]">{subtitle}</p> : null}
  </SheetHeader>
);

export const TaskSheetFormContent = ({
  selectContact,
}: {
  selectContact?: boolean;
}) => {
  const { control, register, watch, setValue } = useFormContext();
  const selectedType = watch("type") ?? "none";

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#9AA3BE]">
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TASK_TYPE_META).map(([type, meta]) => {
            const Icon = meta.icon;
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  setValue("type", type, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? `${meta.bgClass} ${meta.accentClass} border-current`
                    : "border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] text-[#B8C0D6] hover:text-[#ECEEF5]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="task-text"
          className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#9AA3BE]"
        >
          Task
        </label>
        <textarea
          id="task-text"
          autoFocus
          placeholder="Follow up with Sarah at Acme..."
          className="min-h-36 w-full resize-none rounded-lg border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-base text-[#ECEEF5] outline-none placeholder:text-[#5C6784] focus:border-[#4DC8E8]"
          {...register("text", { required: true })}
        />
      </div>

      <div>
        <label
          htmlFor="task-due-date"
          className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#9AA3BE]"
        >
          Due date
        </label>
        <Controller
          name="due_date"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <input
              id="task-due-date"
              type="date"
              value={String(field.value ?? "").slice(0, 10)}
              onChange={(event) => field.onChange(event.target.value)}
              className="h-11 w-full rounded-lg border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] px-3 text-sm text-[#ECEEF5] outline-none focus:border-[#4DC8E8]"
            />
          )}
        />
      </div>

      {selectContact ? (
        <div className="rounded-lg border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] p-3">
          <ReferenceInput source="contact_id" reference="contacts_summary">
            <AutocompleteInput
              label="resources.tasks.fields.contact_id"
              optionText={contactOptionText}
              helperText={false}
              validate={(value) => (value == null ? "Required" : undefined)}
              modal
            />
          </ReferenceInput>
        </div>
      ) : null}
    </div>
  );
};
