import type { MutationMode } from "ra-core";

import { ContactList } from "./ContactList";
import { ContactCreateDialog } from "./ContactCreateDialog";

export const ContactCreate = ({
  mutationMode,
}: {
  mutationMode?: MutationMode;
}) => (
  <>
    <ContactList showCreateDialog={false} />
    <ContactCreateDialog mutationMode={mutationMode} />
  </>
);
