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
import { SaveButton } from "@/components/admin/form";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useFormContext } from "react-hook-form";

import {
  HatchField,
  HatchGhostButton,
  HatchSheet,
  HatchTextareaInput,
  HATCH_CLASS,
} from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
import { contactOptionText } from "../misc/ContactOption";
import type { Task } from "../types";
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
    // No redirect, only close the sheet
    onOpenChange(false);
  };

  return (
    <HatchSheet
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="NEW TASK"
      title="What needs to happen?"
      titleId="task-create-title"
      subtitle={
        !selectContact
          ? translate("resources.tasks.dialog.create_for", {
              name: getContactRepresentation(contact!),
            })
          : translate("resources.tasks.dialog.create")
      }
      contentClassName="sm:max-w-xl"
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
          <Form className="flex min-h-0 flex-1 flex-col">{node}</Form>
        </CreateBase>
      )}
    >
      <TaskSheetFormContent selectContact={selectContact} />
    </HatchSheet>
  );
};

export const TaskSheetFormContent = ({
  selectContact,
}: {
  selectContact?: boolean;
}) => {
  const { control, watch, setValue } = useFormContext();
  const selectedType = watch("type") ?? "none";

  return (
    <div className="space-y-5">
      <HatchField label="Type">
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
      </HatchField>

      <HatchField label="Task" htmlFor="task-text">
        <Controller
          name="text"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <HatchTextareaInput
              id="task-text"
              autoFocus
              placeholder="Follow up with Sarah at Acme..."
              className="min-h-36 px-4 py-3 text-base"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
      </HatchField>

      <HatchField label="Due date" htmlFor="task-due-date">
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
              className={`${HATCH_CLASS.field} h-11 px-3 text-sm`}
            />
          )}
        />
      </HatchField>

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
