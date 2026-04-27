import { CreateBase, Form, useGetIdentity, useTranslate } from "ra-core";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";

import { HatchCard, HatchPageHeader } from "../_primitives";
import {
  HATCH_GHOST_BUTTON_CLASS,
  HATCH_PRIMARY_BUTTON_CLASS,
} from "../layout/FormToolbar";
import { CompanyInputs } from "./CompanyInputs";

export const CompanyCreate = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  return (
    <CreateBase
      redirect="show"
      transform={(values) => {
        // add https:// before website if not present
        if (values.website && !values.website.startsWith("http")) {
          values.website = `https://${values.website}`;
        }
        return values;
      }}
    >
      <div className="mt-2 flex lg:mr-72">
        <div className="flex-1">
          <HatchPageHeader eyebrow="COMPANIES" title="New company" />
          <Form defaultValues={{ sales_id: identity?.id }}>
            <HatchCard padding="lg">
              <CompanyInputs />
              <div
                role="toolbar"
                className="sticky bottom-0 mt-4 flex flex-row justify-end gap-2 border-t border-[rgba(255,255,255,0.07)] bg-[#0D1424] pt-4"
              >
                <CancelButton className={HATCH_GHOST_BUTTON_CLASS} />
                <SaveButton
                  label={translate("resources.companies.action.create", {
                    _: "Create Company",
                  })}
                  className={HATCH_PRIMARY_BUTTON_CLASS}
                />
              </div>
            </HatchCard>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};
