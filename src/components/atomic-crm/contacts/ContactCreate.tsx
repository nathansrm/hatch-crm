import { CreateBase, Form, useGetIdentity, type MutationMode } from "ra-core";
import { SaveButton } from "@/components/admin/form";
import { FormToolbar as Toolbar } from "@/components/admin/simple-form";
import { Card, CardContent } from "@/components/ui/card";

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
          <h1
            className="font-heading"
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#ECEEF5",
              marginBottom: 24,
              letterSpacing: "-0.02em",
            }}
          >
            New Contact
          </h1>
          <Form
            defaultValues={{
              sales_id: identity?.id,
              email_jsonb: defaultEmailJsonb,
              phone_jsonb: defaultPhoneJsonb,
            }}
          >
            <Card>
              <CardContent>
                <ContactInputs />
                <Toolbar className="flex flex-row justify-end gap-2">
                  <SaveButton label="Create Contact" />
                </Toolbar>
              </CardContent>
            </Card>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};
