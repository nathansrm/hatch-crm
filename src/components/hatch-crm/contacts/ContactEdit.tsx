import { EditBase, Form, useEditContext, type MutationMode } from "ra-core";

import { HatchCard, HatchPageHeader } from "../_primitives";
import type { Contact } from "../types";
import { ContactAside } from "./ContactAside";
import { ContactInputs } from "./ContactInputs";
import { FormToolbar } from "../layout/FormToolbar";
import {
  cleanupContactForEdit,
  normalizeContactArrayFields,
} from "./contactModel";

export const ContactEdit = ({
  mutationMode,
}: {
  mutationMode?: MutationMode;
}) => (
  <EditBase
    redirect="show"
    transform={cleanupContactForEdit}
    mutationMode={mutationMode}
  >
    <ContactEditContent />
  </EditBase>
);

const ContactEditContent = () => {
  const { isPending, record } = useEditContext<Contact>();
  if (isPending || !record) return null;
  return (
    <div className="mt-2 flex gap-8">
      <Form
        className="flex flex-1 flex-col gap-4"
        record={normalizeContactArrayFields(record)}
      >
        <HatchPageHeader eyebrow="CONTACTS" title="Edit contact" />
        <HatchCard padding="lg">
          <ContactInputs />
          <FormToolbar />
        </HatchCard>
      </Form>

      <ContactAside link="show" />
    </div>
  );
};
