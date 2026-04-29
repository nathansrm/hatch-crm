import { useGetIdentity, useListContext, useTranslate } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SortButton } from "@/components/admin/sort-button";
import { matchPath, useLocation } from "react-router";

import { TopToolbar } from "../layout/TopToolbar";
import { HatchPageHeader, HatchPanel, HATCH } from "../_primitives";
import { CompanyCreateDialog } from "./CompanyCreateDialog";
import { CompanyEmpty } from "./CompanyEmpty";
import { CompanyListFilter } from "./CompanyListFilter";
import { ImageList } from "./GridList";

export const CompanyList = ({
  showCreateDialog = true,
}: {
  showCreateDialog?: boolean;
}) => {
  const { identity } = useGetIdentity();
  if (!identity) return null;
  return (
    <List
      title={false}
      perPage={25}
      sort={{ field: "name", order: "ASC" }}
      actions={false}
      pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
    >
      <CompanyListLayout showCreateDialog={showCreateDialog} />
    </List>
  );
};

const CompanyListLayout = ({
  showCreateDialog,
}: {
  showCreateDialog: boolean;
}) => {
  const { data, isPending, filterValues, total } = useListContext();
  const location = useLocation();
  const matchCreate = matchPath("/companies/create", location.pathname);
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return null;
  if (!data?.length && !hasFilters)
    return (
      <>
        <CompanyEmpty />
        {showCreateDialog ? <CompanyCreateDialog open={!!matchCreate} /> : null}
      </>
    );

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "24px 28px 28px",
        background: HATCH.surfaceDeep,
      }}
    >
      <HatchPageHeader
        eyebrow="Accounts"
        title="Companies"
        count={total ?? 0}
        countSuffix="accounts tracked"
        actions={<CompanyListActions />}
      />
      <div className="w-full flex flex-row gap-4">
        <CompanyListFilter />
        <HatchPanel className="flex flex-col flex-1 gap-4 p-4">
          <ImageList />
        </HatchPanel>
      </div>
      {showCreateDialog ? <CompanyCreateDialog open={!!matchCreate} /> : null}
    </div>
  );
};

const CompanyListActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar className="company-action-toolbar flex-none">
      <style>{COMPANY_ACTION_STYLES}</style>
      <SortButton fields={["name", "created_at", "nb_contacts"]} />
      <ExportButton />
      <CreateButton
        label={translate("resources.companies.action.new", {
          _: "New Company",
        })}
      />
    </TopToolbar>
  );
};

const COMPANY_ACTION_STYLES = `
  .company-action-toolbar a,
  .company-action-toolbar button {
    height: 36px;
    border-radius: 8px;
    border-color: rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    color: #B8C0D6;
    font-size: 12.5px;
    font-weight: 650;
  }

  .company-action-toolbar a:last-child {
    border-color: rgba(77,200,232,0.45);
    background: #4DC8E8;
    color: #06111F;
    box-shadow: 0 0 20px rgba(77,200,232,0.22);
  }

  .company-action-toolbar a:hover,
  .company-action-toolbar button:hover {
    background: rgba(255,255,255,0.06);
    color: #ECEEF5;
  }

  .company-action-toolbar a:last-child:hover {
    background: #7DDCF0;
    color: #06111F;
  }
`;
