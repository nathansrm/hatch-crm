import { useEffect, useRef } from "react";
import { Paperclip } from "lucide-react";
import {
  required,
  useInput,
  useTranslate,
  ValidationError,
  RecordContextProvider,
} from "ra-core";
import {
  AutocompleteInput,
  DateTimeInput,
  ReferenceInput,
  SelectInput,
} from "@/components/admin";
import { FileInputPreview } from "@/components/admin/file-input";
import { useFormContext, useWatch } from "react-hook-form";

import { contactOptionText } from "../misc/ContactOption";
import { Status } from "../misc/Status";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { AttachmentField } from "./AttachmentField";
import { foreignKeyMapping } from "./foreignKeyMapping";
import { validateNoteOrAttachmentRequired } from "./noteModel";
import type { ContactNote } from "../types";
import { getCurrentDate } from "./utils";

export const NoteInputsMobile = ({
  selectContact,
}: {
  selectContact?: boolean;
}) => {
  const translate = useTranslate();
  const { noteStatuses } = useConfigurationContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { field, fieldState } = useInput({
    source: "text",
    validate: validateNoteOrAttachmentRequired,
  });

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.focus();
      // move cursor to end of text
      node.setSelectionRange(node.value.length, node.value.length);
    });
  }, []);

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <textarea
          {...field}
          ref={(node) => {
            field.ref(node);
            textareaRef.current = node;
          }}
          placeholder={translate("resources.notes.inputs.add_note")}
          className="min-h-[220px] resize-y rounded-lg border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.035)] p-4 text-base leading-6 text-[var(--fg-1)] outline-none transition focus:border-[rgba(77,200,232,0.45)] focus:ring-2 focus:ring-[rgba(77,200,232,0.16)]"
        />
        {fieldState.error && (
          <p className="text-sm text-destructive">
            <ValidationError error={fieldState.error.message ?? ""} />
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectInput
          source="status"
          label="resources.notes.fields.status"
          choices={noteStatuses.map((status) => ({
            id: status.value,
            name: status.label,
            value: status.value,
          }))}
          optionText={optionRenderer}
          helperText={false}
        />
        <DateTimeInput
          source="date"
          label="resources.notes.fields.date"
          helperText={false}
          defaultValue={getCurrentDate()}
        />
      </div>
      {selectContact && (
        <div>
          <ReferenceInput
            source={foreignKeyMapping["contacts"]}
            reference="contacts"
          >
            <AutocompleteInput
              label="resources.notes.fields.contact_id"
              optionText={contactOptionText}
              helperText={false}
              validate={required()}
              modal
            />
          </ReferenceInput>
        </div>
      )}
      <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-3">
        <AttachmentPreviewsMobile />
        <AttachButton />
      </div>
    </div>
  );
};

const AttachButton = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { getValues, setValue } = useFormContext();
  const translate = useTranslate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const newFiles = Array.from(fileList).map((file) => ({
      rawFile: file,
      src: URL.createObjectURL(file),
      title: file.name,
    }));

    const existing = getValues("attachments") || [];
    const currentFiles = Array.isArray(existing) ? existing : [existing];
    setValue("attachments", [...currentFiles, ...newFiles], {
      shouldDirty: true,
    });

    e.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--fg-mid)] transition hover:bg-[rgba(255,255,255,0.055)] hover:text-[var(--fg-1)]"
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip className="size-4" />
        {translate("resources.notes.actions.attach_document", {
          _: "Attach document",
        })}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

const AttachmentPreviewsMobile = () => {
  const { control, setValue } = useFormContext();
  const attachments = useWatch({ control, name: "attachments" }) as
    | ContactNote["attachments"]
    | undefined;

  if (!Array.isArray(attachments) || attachments.length === 0) return null;

  const onRemove = (index: number) => {
    const updated = attachments.filter((_: unknown, i: number) => i !== index);
    setValue("attachments", updated, { shouldDirty: true });
  };

  return (
    <div className="mb-3 flex flex-col gap-2">
      {attachments.map((file, index: number) => (
        <FileInputPreview
          key={file.src}
          file={file}
          onRemove={() => onRemove(index)}
        >
          <RecordContextProvider value={file}>
            <AttachmentField source="src" title="title" target="_blank" />
          </RecordContextProvider>
        </FileInputPreview>
      ))}
    </div>
  );
};

const optionRenderer = (choice: any) => (
  <div>
    <Status status={choice.value} /> {choice.name}
  </div>
);
