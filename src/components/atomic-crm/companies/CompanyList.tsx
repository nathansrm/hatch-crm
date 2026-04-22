import { useGetIdentity, useListContext, useTranslate } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SortButton } from "@/components/admin/sort-button";

import { TopToolbar } from "../layout/TopToolbar";
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
      actions={<CompanyListActions />}
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
      <div style={{ padding: "0 0 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#4DC8E8",
              fontWeight: 700,
            }}
          >
            Accounts
          </span>
          <span
            style={{
              height: 1,
              width: 24,
              background: "rgba(77,200,232,0.4)",
            }}
          />
        </div>
        <h1
          className="font-heading"
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#ECEEF5",
            marginBottom: 4,
          }}
        >
          Companies
        </h1>
        <p style={{ margin: 0, color: "#9AA3BE", fontSize: 13 }}>
          <span
            className="font-mono"
            style={{
              fontWeight: 600,
              color: "#ECEEF5",
            }}
          >
            {total ?? 0}
          </span>
          {" accounts tracked"}
        </p>
      </div>
      <div className="w-full flex flex-row gap-8">
        <CompanyListFilter />
        <div className="flex flex-col flex-1 gap-4">
          <ImageList />
        </div>
      </div>
    </>
  );
};

const CompanyListActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar>
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
