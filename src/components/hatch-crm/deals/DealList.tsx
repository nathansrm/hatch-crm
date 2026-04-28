import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import type { InputProps } from "ra-core";
import { useGetIdentity, useListContext, useTranslate } from "ra-core";
import { Link, matchPath, useLocation } from "react-router";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { List } from "@/components/admin/list";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SearchInput } from "@/components/admin/search-input";
import { SelectInput } from "@/components/admin/select-input";

import { HatchPageHeader, HatchPrimaryButton, HATCH } from "../_primitives";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { DealArchivedList } from "./DealArchivedList";
import { DealCreate } from "./DealCreate";
import { DealEdit } from "./DealEdit";
import { DealEmpty } from "./DealEmpty";
import { OPEN_DEALS_FILTER } from "./dealFilters";
import { DealListContent } from "./DealListContent";
import { DealShow } from "./DealShow";
import { OnlyMineInput } from "./OnlyMineInput";
import type { Deal } from "../types";

const DealList = () => {
  const { identity } = useGetIdentity();
  const { dealCategories } = useConfigurationContext();
  const translate = useTranslate();

  if (!identity) return null;

  const dealFilters = [
    <SearchInput source="q" alwaysOn />,
    <ReferenceInput source="company_id" reference="companies">
      <AutocompleteInput
        label={false}
        placeholder={translate("resources.deals.fields.company_id")}
      />
    </ReferenceInput>,
    <WrapperField source="category" label="resources.deals.fields.category">
      <SelectInput
        source="category"
        label={false}
        emptyText="resources.deals.fields.category"
        choices={dealCategories}
        optionText="label"
        optionValue="value"
      />
    </WrapperField>,
    <OnlyMineInput source="sales_id" alwaysOn />,
  ];

  return (
    <List
      perPage={100}
      filter={OPEN_DEALS_FILTER}
      title={false}
      sort={{ field: "index", order: "DESC" }}
      filters={dealFilters}
      actions={false}
      pagination={null}
    >
      <DealLayout />
    </List>
  );
};

const DealLayout = () => {
  const location = useLocation();
  const matchCreate = matchPath("/deals/create", location.pathname);
  const matchShow = matchPath("/deals/:id/show", location.pathname);
  const matchEdit = matchPath("/deals/:id", location.pathname);

  const { data, total, isPending, filterValues, setFilters } =
    useListContext<Deal>();
  const dealData = Array.isArray(data) ? data : [];
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;
  const activeDealCount = total ?? dealData.length;

  if (isPending) return null;
  if (dealData.length === 0 && !hasFilters)
    return (
      <>
        <DealEmpty>
          <DealShow open={!!matchShow} id={matchShow?.params.id} />
          <DealArchivedList />
        </DealEmpty>
      </>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: HATCH.surfaceDeep,
        flex: 1,
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "24px 28px 20px",
          background: HATCH.surfaceDeep,
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <HatchPageHeader
          eyebrow="Pipeline"
          title="Deals"
          count={activeDealCount}
          countSuffix="active deals"
          actions={
          <Link
            to="/deals/create"
            className="font-heading"
          >
            <HatchPrimaryButton asChild>
              <span className="inline-flex items-center gap-2">
                <Plus size={14} strokeWidth={2.5} />
                Add deal
              </span>
            </HatchPrimaryButton>
          </Link>
          }
        />
      </div>
      {dealData.length === 0 ? (
        <DealsFilteredEmptyState onClear={() => setFilters({}, [])} />
      ) : (
        <DealListContent />
      )}
      <DealArchivedList />
      <DealCreate open={!!matchCreate} />
      <DealEdit open={!!matchEdit && !matchCreate} id={matchEdit?.params.id} />
      <DealShow open={!!matchShow} id={matchShow?.params.id} />
    </div>
  );
};

const DealsFilteredEmptyState = ({ onClear }: { onClear: () => void }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ color: HATCH.textLo, fontSize: 14 }}>
        No deals match your filters.
      </span>
      <button
        onClick={onClear}
        style={{
          color: HATCH.cyan,
          fontSize: 13,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Clear filters
      </button>
    </div>
  </div>
);

/**
 *
 * Used so that label of filters can be inferred for the select display,
 * but not be displayed when showing the input.
 */
const WrapperField = ({ children }: InputProps & { children: ReactNode }) =>
  children;

export default DealList;
