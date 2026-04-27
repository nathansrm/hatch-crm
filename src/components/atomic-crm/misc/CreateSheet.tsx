import { SaveButton } from "@/components/admin/form";
import {
  CreateBase,
  Form,
  useNotify,
  useRedirect,
  useResourceContext,
  useTranslate,
  type CreateBaseProps,
  type FormProps,
} from "ra-core";
import { type ReactNode } from "react";
import { HatchSheet } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";

export interface CreateSheetProps extends CreateBaseProps {
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
   * The title displayed in the sheet header
   */
  title?: ReactNode;

  /**
   * Optional eyebrow above the title (e.g. "NEW CONTACT", "ADD NOTE").
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
}

/**
 * A Sheet component that contains a create form with externally controlled open state.
 *
 * Renders a HatchSheet (Obsidian dark surface) containing a CreateBase form.
 * The sheet has a fixed footer with a Save button. The open state is
 * controlled externally via the open and onOpenChange props. The sheet will
 * automatically close itself on successful submission (if redirect is false)
 * or when the Save action completes.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * return (
 *   <>
 *     <Button onClick={() => setOpen(true)}>Create Contact</Button>
 *     <CreateSheet
 *       resource="contacts"
 *       title="Create Contact"
 *       open={open}
 *       onOpenChange={setOpen}
 *     >
 *       <TextInput source="first_name" />
 *       <TextInput source="last_name" />
 *       <TextInput source="email" />
 *     </CreateSheet>
 *   </>
 * );
 * ```
 */
export const CreateSheet = ({
  children,
  open,
  onOpenChange,
  title = "Create",
  eyebrow,
  subtitle,
  redirect: redirectTo = "show",
  mutationOptions,
  defaultValues,
  headerActions,
  ...createBaseProps
}: CreateSheetProps) => {
  const resource = useResourceContext(createBaseProps);
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();

  // Handle success - close sheet in addition to default behavior
  const handleSuccess = (...args: any[]) => {
    if (mutationOptions?.onSuccess) {
      return mutationOptions.onSuccess(
        ...(args as Parameters<typeof mutationOptions.onSuccess>),
      );
    }
    const [data] = args;
    notify(`resources.${resource}.notifications.created`, {
      type: "info",
      messageArgs: {
        smart_count: 1,
        _: translate(`ra.notification.created`, {
          smart_count: 1,
        }),
      },
      undoable: createBaseProps.mutationMode === "undoable",
    });
    redirect(redirectTo, resource, data.id, data);
    onOpenChange(false);
  };

  const enhancedMutationOptions = {
    ...mutationOptions,
    onSuccess: handleSuccess,
  };

  // Resolve a sensible eyebrow default from the resource name when not given.
  const resolvedEyebrow =
    eyebrow ??
    (resource ? `NEW ${String(resource).replace(/_/g, " ").toUpperCase()}` : undefined);

  return (
    <HatchSheet
      open={open}
      onOpenChange={onOpenChange}
      eyebrow={resolvedEyebrow}
      title={
        typeof title === "string" ? (
          <span className="block truncate">{title}</span>
        ) : (
          title
        )
      }
      subtitle={subtitle}
      headerActions={headerActions}
      contentClassName="sm:max-w-xl"
      footer={
        <SaveButton className={`h-11 px-5 ${HATCH_PRIMARY_BUTTON_CLASS}`} />
      }
      wrap={(node) => (
        <CreateBase
          {...createBaseProps}
          redirect={redirectTo}
          mutationOptions={enhancedMutationOptions}
        >
          <Form
            defaultValues={defaultValues}
            className="flex min-h-0 flex-1 flex-col"
          >
            {node}
          </Form>
        </CreateBase>
      )}
    >
      {children}
    </HatchSheet>
  );
};
