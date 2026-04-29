import { EditBase, Form } from "ra-core";

import { HatchCard, HatchPageHeader, HATCH } from "../_primitives";
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
    <div
      style={{
        minHeight: "100%",
        padding: "24px 28px 28px",
        background: HATCH.surfaceDeep,
      }}
    >
      <div className="flex gap-4">
        <Form className="flex flex-1 flex-col gap-4 pb-2">
          <HatchPageHeader eyebrow="COMPANIES" title="Edit company" />
          <HatchCard padding="lg">
            <CompanyInputs />
            <FormToolbar />
          </HatchCard>
        </Form>

        <CompanyAside link="show" />
      </div>
    </div>
  </EditBase>
);
