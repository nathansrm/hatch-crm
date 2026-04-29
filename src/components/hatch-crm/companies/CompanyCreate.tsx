import { CompanyList } from "./CompanyList";
import { CompanyCreateDialog } from "./CompanyCreateDialog";

export const CompanyCreate = () => (
  <>
    <CompanyList showCreateDialog={false} />
    <CompanyCreateDialog />
  </>
);
