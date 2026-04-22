import jsonExport from "jsonexport/dist";
import {
  downloadCSV,
  InfiniteListBase,
  useGetIdentity,
  useListContext,
  type Exporter,
} from "ra-core";
import { BulkActionsToolbar } from "@/components/admin/bulk-actions-toolbar";
import { BulkDeleteButton } from "@/components/admin/bulk-delete-button";
import { BulkExportButton } from "@/components/admin/bulk-export-button";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { SelectAllButton } from "@/components/admin/select-all-button";
import { SortButton } from "@/components/admin/sort-button";

import type { Company, Contact, Sale, Tag } from "../types";
import { BulkTagButton } from "./BulkTagButton";
import { ContactEmpty } from "./ContactEmpty";
import { ContactImportButton } from "./ContactImportButton";
import {
  ContactListContent,
  ContactListContentMobile,
} from "./ContactListContent";
import {
  ContactListFilterSummary,
  ContactListFilter,
} from "./ContactListFilter";
import { TopToolbar } from "../layout/TopToolbar";
import { InfinitePagination } from "../misc/InfinitePagination";
import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";

export const ContactList = () => {
  const { identity } = useGetIdentity();

  if (!identity) return null;

  return (
    <List
      title={false}
      actions={<ContactListActions />}
      perPage={25}
      sort={{ field: "last_seen", order: "DESC" }}
      exporter={exporter}
    >
      <ContactListLayoutDesktop />
    </List>
  );
};

const ContactListLayoutDesktop = () => {
  const { data, isPending, filterValues, total } = useListContext();

  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return <ContactListSkeleton />;

  if (!data?.length && !hasFilters) return <ContactEmpty />;

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
            People
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
              className="font-heading"
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#ECEEF5",
              }}
            >
              Contacts
            </h1>
            <p style={{ margin: "4px 0 0", color: "#9AA3BE", fontSize: 13 }}>
              <span
                className="font-mono"
                style={{
                  fontWeight: 600,
                  color: "#ECEEF5",
                }}
              >
                {total ?? 0}
              </span>
              {" contacts in the pipeline"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-8">
        <ContactListFilter />
        <div className="w-full flex flex-col gap-4">
          <div
            style={{
              background: "#0D1424",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <ContactListContent />
          </div>
        </div>
        <BulkActionsToolbar>
          <ContactBulkActionButtons />
        </BulkActionsToolbar>
      </div>
    </>
  );
};

const ContactBulkActionButtons = () => (
  <>
    <SelectAllButton />
    <BulkTagButton />
    <BulkExportButton />
    <BulkDeleteButton />
  </>
);

const ContactListActions = () => (
  <TopToolbar>
    <SortButton fields={["first_name", "last_name", "last_seen"]} />
    <ContactImportButton />
    <ExportButton exporter={exporter} />
    <CreateButton />
  </TopToolbar>
);

export const ContactListMobile = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <InfiniteListBase
      perPage={25}
      sort={{ field: "last_seen", order: "DESC" }}
      exporter={exporter}
      queryOptions={{
        onError: () => {
          /* Disable error notification as ContactListLayoutMobile handles it */
        },
      }}
    >
      <ContactListLayoutMobile />
    </InfiniteListBase>
  );
};

const ContactListLayoutMobile = () => {
  const { isPending, data, error, filterValues } = useListContext();

  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (!isPending && !data?.length && !hasFilters) return <ContactEmpty />;

  return (
    <div>
      <MobileHeader>
        <ContactListFilter />
      </MobileHeader>
      <MobileContent>
        <ContactListFilterSummary />
        <ContactListContentMobile />
        {!error && (
          <div className="flex justify-center">
            <InfinitePagination />
          </div>
        )}
      </MobileContent>
    </div>
  );
};

const exporter: Exporter<Contact> = async (records, fetchRelatedRecords) => {
  const companies = await fetchRelatedRecords<Company>(
    records,
    "company_id",
    "companies",
  );
  const leadSources = await fetchRelatedRecords<{ id: string; name: string }>(
    records,
    "lead_source_id",
    "lead_sources",
  );
  const sales = await fetchRelatedRecords<Sale>(records, "sales_id", "sales");
  const tags = await fetchRelatedRecords<Tag>(records, "tags", "tags");

  const contacts = records.map((contact) => {
    const exportedContact = {
      ...contact,
      company:
        contact.company_id != null
          ? companies[contact.company_id].name
          : undefined,
      lead_source:
        contact.lead_source_id != null
          ? leadSources[contact.lead_source_id]?.name
          : undefined,
      sales:
        contact.sales_id != null
          ? `${sales[contact.sales_id].first_name} ${sales[contact.sales_id].last_name}`
          : undefined,
      tags: contact.tags.map((tagId) => tags[tagId].name).join(", "),
      email_work: contact.email_jsonb?.find((email) => email.type === "Work")
        ?.email,
      email_home: contact.email_jsonb?.find((email) => email.type === "Home")
        ?.email,
      email_other: contact.email_jsonb?.find((email) => email.type === "Other")
        ?.email,
      email_jsonb: JSON.stringify(contact.email_jsonb),
      email_fts: undefined,
      phone_work: contact.phone_jsonb?.find((phone) => phone.type === "Work")
        ?.number,
      phone_home: contact.phone_jsonb?.find((phone) => phone.type === "Home")
        ?.number,
      phone_other: contact.phone_jsonb?.find((phone) => phone.type === "Other")
        ?.number,
      phone_jsonb: JSON.stringify(contact.phone_jsonb),
      phone_fts: undefined,
    };
    delete exportedContact.email_fts;
    delete exportedContact.phone_fts;
    return exportedContact;
  });
  return jsonExport(contacts, {}, (_err: any, csv: string) => {
    downloadCSV(csv, "contacts");
  });
};

const ContactListSkeleton = () => (
  <>
    <style>{"@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }"}</style>
    <div style={{ padding: "0 0 20px" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 56,
            margin: "4px 0",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  </>
);
