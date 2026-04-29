import { Building, Truck, Users } from "lucide-react";
import { FilterLiveForm, useGetIdentity, useTranslate } from "ra-core";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { SearchInput } from "@/components/admin/search-input";

import { FilterCategory } from "../filters/FilterCategory";
import { HATCH } from "../_primitives";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { getTranslatedCompanySizeLabel } from "./getTranslatedCompanySizeLabel";
import { sizes } from "./sizes";

export const CompanyListFilter = () => {
  const { identity } = useGetIdentity();
  const { companySectors } = useConfigurationContext();
  const translate = useTranslate();
  const translatedSizes = sizes.map((size) => ({
    ...size,
    name: getTranslatedCompanySizeLabel(size, translate),
  }));
  return (
    <div
      className="company-filter-rail w-56 min-w-56 flex flex-col gap-6"
      style={{
        alignSelf: "flex-start",
        border: `1px solid ${HATCH.border}`,
        borderRadius: 8,
        background:
          "linear-gradient(180deg, var(--ink-3) 0%, var(--ink-2-deep) 100%)",
        padding: 14,
      }}
    >
      <style>{COMPANY_FILTER_STYLES}</style>
      <FilterLiveForm>
        <SearchInput source="q" />
      </FilterLiveForm>

      <FilterCategory
        icon={<Building className="h-4 w-4" />}
        label="resources.companies.fields.size"
      >
        {translatedSizes.map((size) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={size.name}
            key={size.name}
            value={{ size: size.id }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Truck className="h-4 w-4" />}
        label="resources.companies.fields.sector"
      >
        {companySectors.map((sector) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={sector.label}
            key={sector.value}
            value={{ sector: sector.value }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Users className="h-4 w-4" />}
        label="resources.companies.fields.sales_id"
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.common.me")}
          value={{ sales_id: identity?.id }}
        />
      </FilterCategory>
    </div>
  );
};

const COMPANY_FILTER_STYLES = `
  .company-filter-rail input {
    height: 36px;
    border-radius: 8px;
    border-color: rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.03);
    color: #ECEEF5;
    font-size: 13px;
  }

  .company-filter-rail input::placeholder {
    color: #5C6784;
  }

  .company-filter-rail h3 {
    color: #ECEEF5;
    font-size: 12px;
  }

  .company-filter-rail h3 svg {
    color: #4DC8E8;
  }

  .company-filter-rail button {
    height: 30px;
    border-radius: 7px;
    color: #B8C0D6;
    font-size: 12.5px;
    font-weight: 650;
  }

  .company-filter-rail button:hover {
    background: rgba(255,255,255,0.05);
    color: #ECEEF5;
  }

  .company-filter-rail button[data-state="on"],
  .company-filter-rail button.bg-secondary {
    background: rgba(77,200,232,0.1);
    color: #4DC8E8;
  }
`;
