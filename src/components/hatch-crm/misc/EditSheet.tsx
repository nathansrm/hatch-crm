import { SaveButton } from "@/components/admin/form";
import {
  EditBase,
  Form,
  useEditContext,
  useNotify,
  useRedirect,
  useResourceContext,
  useTranslate,
  type EditBaseProps,
  type FormProps,
} from "ra-core";
import { type ReactNode } from "react";
import { HatchGhostButton, HatchSheet } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";

export interface EditSheetProps extends EditBaseProps {
  /**
   * The children elements that will be rendered inside the sheet as form inputs
   */
  children: ReactNode;

  /**
   * Controls whether the sheet is open
   */
  open: boolean;

  /**
   * Callback fired when the sheet open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * The title displayed in the sheet header. Pass `false` to suppress.
   * Defaults to `useEditContext().defaultTitle`.
   */
  title?: ReactNode;

  /**
   * Optional eyebrow above the title (e.g. "EDIT NOTE", "EDIT CONTACT").
   * Falls back to a translated default per resource if omitted.
   */
  eyebrow?: ReactNode;

  /**
   * Optional subtitle line under the title.
   */
  subtitle?: ReactNode;

  /**
   * Default values for the form
   */
  defaultValues?: FormProps["defaultValues"];

  /**
   * Optional actions to render in the sheet header, next to the title
   */
  headerActions?: ReactNode;

  /**
   * Optional edit-record normalizer for fields that need form-safe shapes
   * after the record is fetched.
   */
  normalizeRecord?: (record: any) => any;

  /**
   * Translation key or literal text for the primary submit action.
   */
  submitLabel?: string;

  /**
   * Translation key or literal text for the secondary cancel action.
   */
  cancelLabel?: string;
}

/**
 * A Sheet component that contains an edit form with externally controlled open state.
 *
 * Renders a HatchSheet (Obsidian dark surface) containing an EditBase form.
 * The sheet has a fixed footer with a Save button. The open state is
 * controlled externally via the open and onOpenChange props. The sheet will
 * automatically close itself on successful submission (if redirect is false).
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * return (
 *   <>
 *     <Button onClick={() => setOpen(true)}>Edit Contact</Button>
 *     <EditSheet
 *       resource="contacts"
 *       id={contactId}
 *       title="Edit Contact"
 *       open={open}
 *       onOpenChange={setOpen}
 *     >
 *       <TextInput source="first_name" />
 *       <TextInput source="last_name" />
 *       <TextInput source="email" />
 *     </EditSheet>
 *   </>
 * );
 * ```
 */
export const EditSheet = ({
  children,
  open,
  onOpenChange,
  title,
  eyebrow,
  subtitle,
  redirect: redirectTo = "show",
  mutationOptions,
  mutationMode = "undoable",
  defaultValues,
  headerActions,
  normalizeRecord,
  submitLabel = "ra.action.save",
  cancelLabel = "ra.action.cancel",
  ...editBaseProps
}: EditSheetProps) => {
  const resource = useResourceContext(editBaseProps);
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();

  const handleSuccess = (...args: any[]) => {
    if (mutationOptions?.onSuccess) {
      return mutationOptions.onSuccess(
        ...(args as Parameters<typeof mutationOptions.onSuccess>),
      );
    }
    const [data] = args;
    notify(`resources.${resource}.notifications.updated`, {
      type: "info",
      messageArgs: {
        smart_count: 1,
        _: translate(`ra.notification.updated`, {
          smart_count: 1,
        }),
      },
      undoable: mutationMode === "undoable",
    });
    redirect(redirectTo, resource, data.id, data);
    onOpenChange(false);
  };

  const enhancedMutationOptions = {
    ...mutationOptions,
    onSuccess: handleSuccess,
  };

  const resolvedEyebrow =
    eyebrow ??
    (resource
      ? `EDIT ${String(resource).replace(/_/g, " ").toUpperCase()}`
      : undefined);

  return (
    <HatchSheet
      open={open}
      onOpenChange={onOpenChange}
      eyebrow={resolvedEyebrow}
      title={<EditSheetTitle title={title} />}
      subtitle={subtitle}
      headerActions={headerActions}
      contentClassName="sm:max-w-xl"
      footer={
        <>
          <HatchGhostButton type="button" onClick={() => onOpenChange(false)}>
            {translate(cancelLabel, { _: cancelLabel })}
          </HatchGhostButton>
          <SaveButton
            label={submitLabel}
            className={`h-11 px-5 ${HATCH_PRIMARY_BUTTON_CLASS}`}
          />
        </>
      }
      wrap={(node) => (
        <EditBase
          {...editBaseProps}
          redirect={redirectTo}
          mutationOptions={enhancedMutationOptions}
          mutationMode={mutationMode}
        >
          <EditSheetForm
            defaultValues={defaultValues}
            normalizeRecord={normalizeRecord}
          >
            {node}
          </EditSheetForm>
        </EditBase>
      )}
    >
      {children}
    </HatchSheet>
  );
};

const EditSheetForm = ({
  children,
  defaultValues,
  normalizeRecord,
}: {
  children: ReactNode;
  defaultValues?: FormProps["defaultValues"];
  normalizeRecord?: (record: any) => any;
}) => {
  const { isPending, record } = useEditContext();

  if (isPending || !record) {
    return null;
  }

  const formRecord = normalizeRecord ? normalizeRecord(record) : record;

  return (
    <Form
      record={formRecord}
      defaultValues={defaultValues}
      className="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </Form>
  );
};

const EditSheetTitle = ({ title }: { title?: ReactNode | string | false }) => {
  const { defaultTitle } = useEditContext();

  if (title === false) {
    return null;
  }

  const resolvedTitle = title === undefined ? defaultTitle : title;
  if (resolvedTitle == null) {
    return null;
  }

  return typeof resolvedTitle === "string" ? (
    <span className="block truncate">{resolvedTitle}</span>
  ) : (
    <>{resolvedTitle}</>
  );
};
