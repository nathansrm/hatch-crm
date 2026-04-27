import { CreateBase, Form, useGetIdentity, type MutationMode } from "ra-core";
import { SaveButton } from "@/components/admin/form";
import { FormToolbar as Toolbar } from "@/components/admin/simple-form";

import { HatchCard, HatchPageHeader } from "../_primitives";
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
                  className="bg-[#4DC8E8] font-semibold text-[#06111F] shadow-[0_0_20px_rgba(77,200,232,0.25)] hover:bg-[#7DDCF0]"
                />
              </Toolbar>
            </HatchCard>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};
