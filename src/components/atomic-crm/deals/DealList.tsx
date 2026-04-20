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

import { useConfigurationContext } from "../root/ConfigurationContext";
import { DealArchivedList } from "./DealArchivedList";
import { DealCreate } from "./DealCreate";
import { DealEdit } from "./DealEdit";
import { DealEmpty } from "./DealEmpty";
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
      filter={{ "archived_at@is": null }}
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
        background: "#060A16",
        flex: 1,
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "24px 28px 20px",
          background: "#060A16",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
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
            Pipeline
          </span>
          <span
            style={{
              height: 1,
              width: 24,
              background: "rgba(77,200,232,0.4)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: '"Manrope Variable", ui-sans-serif',
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#ECEEF5",
              }}
            >
              Deals
            </h1>
            <p style={{ margin: "4px 0 0", color: "#9AA3BE", fontSize: 13 }}>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace',
                  color: "#ECEEF5",
                  fontWeight: 600,
                }}
              >
                {activeDealCount}
              </span>
              {" active deals"}
            </p>
          </div>
          <Link
            to="/deals/create"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: "#4DC8E8",
              color: "#061022",
              borderRadius: 7,
              fontFamily: '"Manrope Variable", ui-sans-serif',
              fontWeight: 700,
              fontSize: 12.5,
              textDecoration: "none",
              boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add deal
          </Link>
        </div>
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
      <span style={{ color: "#9AA3BE", fontSize: 14 }}>
        No deals match your filters.
      </span>
      <button
        onClick={onClear}
        style={{
          color: "#4DC8E8",
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
