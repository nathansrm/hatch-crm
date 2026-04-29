import {
  CreateBase,
  Form,
  useGetIdentity,
  useRedirect,
  useTranslate,
  type MutationMode,
} from "ra-core";
import { useLocation } from "react-router";
import { SaveButton } from "@/components/admin/form";

import { HatchDialog } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
import { ContactInputs } from "./ContactInputs";
import {
  cleanupContactForCreate,
  defaultEmailJsonb,
  defaultPhoneJsonb,
} from "./contactModel";

export const ContactCreateDialog = ({
  mutationMode,
  open = true,
}: {
  mutationMode?: MutationMode;
  open?: boolean;
}) => {
  const { identity } = useGetIdentity();
  const redirect = useRedirect();
  const translate = useTranslate();
  const location = useLocation();
  const routeDefaults =
    typeof location.state === "object" &&
    location.state !== null &&
    "record" in location.state
      ? (location.state.record as Record<string, unknown>)
      : {};

  const handleClose = () => {
    redirect("/contacts");
  };

  return (
    <HatchDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      eyebrow="NEW CONTACT"
      title={translate("resources.contacts.action.new", {
        _: "Create a contact",
      })}
      size="xl"
      contentClassName="max-h-[calc(100vh-48px)]"
      className="max-h-[calc(100vh-190px)] overflow-y-auto"
      wrap={(node) => (
        <CreateBase
          resource="contacts"
          redirect="show"
          transform={cleanupContactForCreate}
          mutationMode={mutationMode}
        >
          <Form
            defaultValues={{
              ...routeDefaults,
              sales_id: identity?.id,
              email_jsonb: defaultEmailJsonb,
              phone_jsonb: defaultPhoneJsonb,
            }}
          >
            {node}
          </Form>
        </CreateBase>
      )}
      footer={
        <SaveButton
          label="Create Contact"
          className={HATCH_PRIMARY_BUTTON_CLASS}
        />
      }
    >
      <ContactInputs />
    </HatchDialog>
  );
};
