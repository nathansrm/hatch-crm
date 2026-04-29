import { Globe, Linkedin, Phone } from "lucide-react";
import {
  useGetIdentity,
  useLocaleState,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { ShowButton } from "@/components/admin/show-button";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { UrlField } from "@/components/admin/url-field";
import { SelectField } from "@/components/admin/select-field";

import { HATCH } from "../_primitives";
import { formatLocalizedDate } from "../misc/RelativeDate";
import { AsideSection } from "../misc/AsideSection";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Company } from "../types";
import { getTranslatedCompanySizeLabel } from "./getTranslatedCompanySizeLabel";
import { sizes } from "./sizes";
import { useGetSalesName } from "../sales/useGetSalesName";

interface CompanyAsideProps {
  link?: string;
}

export const CompanyAside = ({ link = "edit" }: CompanyAsideProps) => {
  const record = useRecordContext<Company>();
  const translate = useTranslate();
  if (!record) return null;

  return (
    // HatchAside defaults (sm:flex, gap-6, no width) don't match CompanyAside layout — primitive reconciliation deferred to follow-up brief.
    <div
      className="company-aside-rail hidden sm:block w-92 min-w-92 space-y-3"
      style={{ color: HATCH.textMd }}
    >
      <style>{COMPANY_ASIDE_STYLES}</style>
      <div className="flex flex-row space-x-1">
        {link === "edit" ? (
          <EditButton label={translate("resources.companies.action.edit")} />
        ) : (
          <ShowButton label={translate("resources.companies.action.show")} />
        )}
      </div>

      <CompanyInfo record={record} />

      <AddressInfo record={record} />

      <ContextInfo record={record} />

      <ConstructionInfo record={record} />

      <AdditionalInfo record={record} />

      {link !== "edit" && (
        <div className="mt-6 pt-6 border-t hidden sm:flex flex-col gap-2 items-start">
          <DeleteButton
            className="h-6 cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
            size="sm"
          />
        </div>
      )}
    </div>
  );
};

const COMPANY_ASIDE_STYLES = `
  .company-aside-rail > div:not(:first-child) {
    margin-bottom: 0;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    background: #0D1424;
    padding: 16px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.18);
  }

  .company-aside-rail > div:first-child a,
  .company-aside-rail > div:first-child button {
    height: 36px;
    border-radius: 8px;
    border-color: rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.03);
    color: #ECEEF5;
    font-size: 12.5px;
    font-weight: 700;
  }

  .company-aside-rail h3 {
    padding-bottom: 0;
    color: #4DC8E8;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.22em;
  }

  .company-aside-rail [data-slot="separator"] {
    display: none;
  }

  .company-aside-rail p,
  .company-aside-rail span,
  .company-aside-rail a {
    color: #B8C0D6;
  }

  .company-aside-rail a {
    text-underline-offset: 3px;
  }

  .company-aside-rail svg {
    color: #5C6784;
  }
`;

export const CompanyInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  if (!record.website && !record.linkedin_url && !record.phone_number) {
    return null;
  }

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.contact")}
    >
      {record.website && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Globe className="w-4 h-4" />
          <UrlField
            source="website"
            target="_blank"
            rel="noopener"
            content={record.website
              .replace("http://", "")
              .replace("https://", "")}
          />
        </div>
      )}
      {record.linkedin_url && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Linkedin className="w-4 h-4" />
          <a
            className="underline hover:no-underline"
            href={record.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            title={record.linkedin_url}
          >
            LinkedIn
          </a>
        </div>
      )}
      {record.phone_number && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Phone className="w-4 h-4" />
          <TextField source="phone_number" />
        </div>
      )}
    </AsideSection>
  );
};

export const ContextInfo = ({ record }: { record: Company }) => {
  const { companySectors } = useConfigurationContext();
  const translate = useTranslate();
  if (!record.revenue && !record.id) {
    return null;
  }

  const sector = companySectors.find((s) => s.value === record.sector);
  const sectorLabel = sector?.label;
  const translatedSizes = sizes.map((size) => ({
    ...size,
    name: getTranslatedCompanySizeLabel(size, translate),
  }));

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.context")}
    >
      {sectorLabel && (
        <span>
          {translate("resources.companies.fields.sector")}: {sectorLabel}
        </span>
      )}
      {record.size && (
        <span>
          {translate("resources.companies.fields.size")}:{" "}
          <SelectField source="size" choices={translatedSizes} />
        </span>
      )}
      {record.revenue && (
        <span>
          {translate("resources.companies.fields.revenue")}:{" "}
          <TextField source="revenue" />
        </span>
      )}
      {record.tax_identifier && (
        <span>
          {translate("resources.companies.fields.tax_identifier", {})}
          : <TextField source="tax_identifier" />
        </span>
      )}
    </AsideSection>
  );
};

export const AddressInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  if (
    !record.address &&
    !record.city &&
    !record.zipcode &&
    !record.state_abbr
  ) {
    return null;
  }

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.address")}
      noGap
    >
      <TextField source="address" />
      <TextField source="city" />
      <TextField source="zipcode" />
      <TextField source="state_abbr" />
      <TextField source="country" />
    </AsideSection>
  );
};

const constructionCompanySizeChoices = [
  { id: "1-5", name: "1-5 employees" },
  { id: "6-20", name: "6-20 employees" },
  { id: "21-50", name: "21-50 employees" },
  { id: "50+", name: "50+ employees" },
];

const techMaturityChoices = [
  { id: "Paper", name: "Paper" },
  { id: "Basic Digital", name: "Basic Digital" },
  { id: "Automated", name: "Automated" },
];

export const ConstructionInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();

  if (
    !record.trade_type_id &&
    !record.service_area &&
    !record.company_size &&
    !record.tech_maturity
  ) {
    return null;
  }

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.construction", {
        _: "Construction",
      })}
    >
      {record.trade_type_id && (
        <span>
          {translate("resources.companies.fields.trade_type_id", {
            _: "Trade Type",
          })}
          :{" "}
          <ReferenceField source="trade_type_id" reference="trade_types">
            <TextField source="name" />
          </ReferenceField>
        </span>
      )}
      {record.service_area && (
        <span>
          {translate("resources.companies.fields.service_area", {
            _: "Service Area",
          })}
          : <TextField source="service_area" />
        </span>
      )}
      {record.company_size && (
        <span>
          {translate("resources.companies.fields.company_size", {
            _: "Company Size",
          })}
          :{" "}
          <SelectField
            source="company_size"
            choices={constructionCompanySizeChoices}
          />
        </span>
      )}
      {record.tech_maturity && (
        <span>
          {translate("resources.companies.fields.tech_maturity", {
            _: "Tech Maturity",
          })}
          : <SelectField source="tech_maturity" choices={techMaturityChoices} />
        </span>
      )}
    </AsideSection>
  );
};

export const AdditionalInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const { identity } = useGetIdentity();
  const isCurrentUser = record.sales_id === identity?.id;
  const salesName = useGetSalesName(record.sales_id, {
    enabled: !isCurrentUser,
  });
  if (
    !record.created_at &&
    !record.sales_id &&
    !record.description &&
    !record.context_links
  ) {
    return null;
  }
  const getBaseURL = (url: string) => {
    const urlObject = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObject.hostname;
  };

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.additional_info")}
    >
      {record.description && (
        <p className="text-sm  mb-1">{record.description}</p>
      )}
      {record.context_links && (
        <div className="flex flex-col">
          {record.context_links.map((link, index) =>
            link ? (
              <a
                key={index}
                className="text-sm underline hover:no-underline mb-1"
                href={link.startsWith("http") ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                title={link}
              >
                {getBaseURL(link)}
              </a>
            ) : null,
          )}
        </div>
      )}
      {record.sales_id !== null && (
        <div className="inline-flex text-sm text-muted-foreground mb-1">
          {translate(
            isCurrentUser
              ? "resources.companies.followed_by_you"
              : "resources.companies.followed_by",
            { name: salesName },
          )}
        </div>
      )}
      {record.created_at && (
        <p className="text-sm text-muted-foreground mb-1">
          {translate("resources.companies.added_on", {
            date: formatLocalizedDate(record.created_at, locale),
          })}{" "}
        </p>
      )}
    </AsideSection>
  );
};
