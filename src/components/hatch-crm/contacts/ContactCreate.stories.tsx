import type { Meta } from "@storybook/react-vite";

import { ContactCreateDialog } from "./ContactCreateDialog";
import { buildContact, StoryWrapper } from "@/test/StoryWrapper";
import type { DataProvider } from "ra-core";

const meta = {
  title: "Hatch CRM/Contacts/Contact Create",
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "responsive", isRotated: false },
  },
} satisfies Meta;

export default meta;

export const ContactCreateBasic = ({
  dataProvider = {},
  silent,
}: {
  dataProvider?: Partial<DataProvider>;
  silent?: boolean;
}) => (
  <StoryWrapper
    initialEntries={["/"]}
    data={{
      contacts: [
        buildContact({
          id: 1,
          email_jsonb: [],
          phone_jsonb: [],
        }),
      ] as any,
    }}
    dataProvider={dataProvider}
    silent={silent}
  >
    <ContactCreateDialog />
  </StoryWrapper>
);

export const ContactCreateBasicWithError = () => (
  <StoryWrapper
    initialEntries={["/"]}
    data={{
      contacts: [
        buildContact({
          id: 1,
          email_jsonb: [],
          phone_jsonb: [],
        }),
      ] as any,
    }}
    dataProvider={{
      create: async (resource, params) => {
        if (resource === "contacts") {
          throw new Error("Failed to create contact");
        }
        return { data: params.data as any };
      },
    }}
  >
    <ContactCreateDialog />
  </StoryWrapper>
);
