import { CreateBase, Form, useGetIdentity, type MutationMode } from "ra-core";
import { SaveButton } from "@/components/admin/form";
import { FormToolbar as Toolbar } from "@/components/admin/simple-form";

import { HatchCard, HatchPageHeader } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
import { ContactInputs } from "./ContactInputs";
import {
  cleanupContactForCreate,
  defaultEmailJsonb,
  defaultPhoneJsonb,
} from "./contactModel";

export const ContactCreate = ({
  mutationMode,
}: {
  mutationMode?: MutationMode;
}) => {
  const { identity } = useGetIdentity();

  return (
    <CreateBase
      redirect="show"
      transform={cleanupContactForCreate}
      mutationMode={mutationMode}
    >
      <div className="mt-2 flex lg:mr-72">
        <div className="flex-1">
          <HatchPageHeader eyebrow="CONTACTS" title="New contact" />
          <Form
            defaultValues={{
              sales_id: identity?.id,
              email_jsonb: defaultEmailJsonb,
              phone_jsonb: defaultPhoneJsonb,
            }}
          >
            <HatchCard padding="lg">
              <ContactInputs />
              <Toolbar className="flex flex-row justify-end gap-2">
                <SaveButton
                  label="Create Contact"
                  className={HATCH_PRIMARY_BUTTON_CLASS}
                />
              </Toolbar>
            </HatchCard>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};
