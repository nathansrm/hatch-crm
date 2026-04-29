import { useGetIdentity, useListContext, useTranslate } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SortButton } from "@/components/admin/sort-button";

import { TopToolbar } from "../layout/TopToolbar";
import { HatchPageHeader, HatchPanel } from "../_primitives";
import { CompanyEmpty } from "./CompanyEmpty";
import { CompanyListFilter } from "./CompanyListFilter";
import { ImageList } from "./GridList";

export const CompanyList = () => {
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
      <CompanyListLayout />
    </List>
  );
};

const CompanyListLayout = () => {
  const { data, isPending, filterValues, total } = useListContext();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return null;
  if (!data?.length && !hasFilters) return <CompanyEmpty />;

  return (
    <>
      <HatchPageHeader
        eyebrow="Accounts"
        title="Companies"
        count={total ?? 0}
        countSuffix="accounts tracked"
        actions={<CompanyListActions />}
      />
      <div className="w-full flex flex-row gap-8">
        <CompanyListFilter />
        <HatchPanel className="flex flex-col flex-1 gap-4 p-4">
          <ImageList />
        </HatchPanel>
      </div>
    </>
  );
};

const CompanyListActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar className="flex-none">
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
