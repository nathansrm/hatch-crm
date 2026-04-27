import { EditBase, Form } from "ra-core";

import { HatchCard, HatchPageHeader } from "../_primitives";
import { CompanyInputs } from "./CompanyInputs";
import { CompanyAside } from "./CompanyAside";
import { FormToolbar } from "../layout/FormToolbar";

export const CompanyEdit = () => (
  <EditBase
    actions={false}
    redirect="show"
    transform={(values) => {
      // add https:// before website if not present
      if (values.website && !values.website.startsWith("http")) {
        values.website = `https://${values.website}`;
      }
      return values;
    }}
  >
    <div className="mt-2 flex gap-8">
      <Form className="flex flex-1 flex-col gap-4 pb-2">
        <HatchPageHeader eyebrow="COMPANIES" title="Edit company" />
        <HatchCard padding="lg">
          <CompanyInputs />
          <FormToolbar />
        </HatchCard>
      </Form>

      <CompanyAside link="show" />
    </div>
  </EditBase>
);
