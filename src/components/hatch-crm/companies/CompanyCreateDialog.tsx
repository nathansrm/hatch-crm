import {
  CreateBase,
  Form,
  useGetIdentity,
  useRedirect,
  useTranslate,
} from "ra-core";
import { SaveButton } from "@/components/admin/form";

import { HatchDialog } from "../_primitives";
import { HATCH_PRIMARY_BUTTON_CLASS } from "../layout/FormToolbar";
import { CompanyInputs } from "./CompanyInputs";

const normalizeCompanyCreateValues = (values: Record<string, unknown>) => {
  if (
    typeof values.website === "string" &&
    !values.website.startsWith("http")
  ) {
    values.website = `https://${values.website}`;
  }
  return values;
};

export const CompanyCreateDialog = ({ open = true }: { open?: boolean }) => {
  const { identity } = useGetIdentity();
  const redirect = useRedirect();
  const translate = useTranslate();

  const handleClose = () => {
    redirect("/companies");
  };

  return (
    <HatchDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      eyebrow="NEW COMPANY"
      title={translate("resources.companies.action.new", {
        _: "Create a company",
      })}
      size="xl"
      contentClassName="max-h-[calc(100vh-48px)]"
      className="max-h-[calc(100vh-190px)] overflow-y-auto"
      wrap={(node) => (
        <CreateBase
          resource="companies"
          redirect="show"
          transform={normalizeCompanyCreateValues}
        >
          <Form defaultValues={{ sales_id: identity?.id }}>{node}</Form>
        </CreateBase>
      )}
      footer={
        <SaveButton
          label="Create Company"
          className={HATCH_PRIMARY_BUTTON_CLASS}
        />
      }
    >
      <CompanyInputs />
    </HatchDialog>
  );
};
