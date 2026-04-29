import jsonExport from "jsonexport/dist";
import {
  downloadCSV,
  InfiniteListBase,
  useGetIdentity,
  useListContext,
  type Exporter,
} from "ra-core";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { HatchPageHeader, HatchPanel } from "../_primitives";

export const ContactList = () => {
  const { identity } = useGetIdentity();

  if (!identity) return null;

  return (
    <List
      title={false}
      actions={false}
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
    <div
      style={{
        minHeight: "100%",
        padding: "24px 28px 28px",
        background: "var(--ink-1)",
      }}
    >
      <HatchPageHeader
        eyebrow="People"
        title="Contacts"
        count={total ?? 0}
        countSuffix="contacts in the pipeline"
        actions={<ContactListActions />}
      />
      <div className="flex flex-col gap-4">
        <ContactCommandBar />
        <HatchPanel>
          <ContactListContent />
        </HatchPanel>
        <BulkActionsToolbar>
          <ContactBulkActionButtons />
        </BulkActionsToolbar>
      </div>
    </div>
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
  <TopToolbar className="contact-action-toolbar flex-none">
    <style>{CONTACT_ACTION_STYLES}</style>
    <SortButton fields={["first_name", "last_name", "last_seen"]} />
    <ContactImportButton />
    <ExportButton exporter={exporter} />
    <CreateButton />
  </TopToolbar>
);

const CONTACT_ACTION_STYLES = `
  .contact-action-toolbar a,
  .contact-action-toolbar button {
    height: 36px;
    border-radius: 8px;
    border-color: rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    color: #B8C0D6;
    font-size: 12.5px;
    font-weight: 650;
  }

  .contact-action-toolbar a:last-child {
    border-color: rgba(77,200,232,0.45);
    background: #4DC8E8;
    color: #06111F;
    box-shadow: 0 0 20px rgba(77,200,232,0.22);
  }

  .contact-action-toolbar a:hover,
  .contact-action-toolbar button:hover {
    background: rgba(255,255,255,0.06);
    color: #ECEEF5;
  }

  .contact-action-toolbar a:last-child:hover {
    background: #7DDCF0;
    color: #06111F;
  }
`;

const CONTACT_SAVED_VIEWS = [
  { id: "all", label: "All", filter: {} },
  { id: "closed", label: "Clients", filter: { status: "closed" } },
  { id: "warm", label: "Leads", filter: { status: "warm" } },
  { id: "hot", label: "Opportunities", filter: { status: "hot" } },
  { id: "cold", label: "Cold", filter: { status: "cold" } },
  { id: "tasks", label: "Tasks due", filter: { "nb_tasks@gt": 0 } },
] as const;

const ContactCommandBar = () => {
  const {
    displayedFilters,
    filterValues = {},
    setFilters,
  } = useListContext<Contact>();
  const { identity } = useGetIdentity();
  const [search, setSearch] = useState((filterValues.q as string) ?? "");

  useEffect(() => {
    setSearch((filterValues.q as string) ?? "");
  }, [filterValues.q]);

  const baseFilters = useMemo(() => {
    const next = { ...filterValues };
    delete next.status;
    delete next["nb_tasks@gt"];
    return next;
  }, [filterValues]);

  const activeView = useMemo(() => {
    if (filterValues["nb_tasks@gt"]) return "tasks";
    if (typeof filterValues.status === "string") return filterValues.status;
    return "all";
  }, [filterValues]);

  const applyFilters = (nextFilters: Record<string, unknown>) => {
    setFilters(nextFilters, displayedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const next = { ...filterValues };
    if (value.trim()) {
      next.q = value;
    } else {
      delete next.q;
    }
    applyFilters(next);
  };

  const hasFilters = Object.keys(filterValues).length > 0;

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        padding: 16,
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        background:
          "linear-gradient(180deg, var(--ink-3) 0%, var(--ink-2-deep) 100%)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1fr) auto",
          gap: 12,
          alignItems: "center",
        }}
      >
        <label
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Search
            aria-hidden
            style={{
              position: "absolute",
              left: 13,
              width: 16,
              height: 16,
              color: "var(--fg-3)",
            }}
          />
          <input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search contacts, companies, email, tags..."
            aria-label="Search contacts"
            style={{
              width: "100%",
              height: 40,
              padding: "0 40px",
              borderRadius: 9,
              border: "1px solid rgba(255,255,255,0.09)",
              background: "rgba(255,255,255,0.035)",
              color: "var(--fg-1)",
              outline: "none",
              fontSize: 13,
            }}
          />
          {search ? (
            <button
              type="button"
              aria-label="Clear contact search"
              onClick={() => handleSearchChange("")}
              style={{
                position: "absolute",
                right: 10,
                width: 24,
                height: 24,
                display: "grid",
                placeItems: "center",
                border: 0,
                borderRadius: 6,
                color: "var(--fg-3)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          ) : null}
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: 6,
          }}
        >
          {CONTACT_SAVED_VIEWS.map((view) => {
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => applyFilters({ ...baseFilters, ...view.filter })}
                style={{
                  height: 34,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: isActive
                    ? "1px solid rgba(77,200,232,0.35)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: isActive
                    ? "rgba(77,200,232,0.1)"
                    : "rgba(255,255,255,0.025)",
                  color: isActive ? "var(--hatch-cyan)" : "var(--fg-2)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {view.label}
              </button>
            );
          })}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SlidersHorizontal
            aria-hidden
            style={{ width: 15, height: 15, color: "var(--fg-3)" }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-3)",
            }}
          >
            Quick filters
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: "flex-end",
          }}
        >
          <FilterChip
            label="Managed by me"
            active={filterValues.sales_id === identity?.id}
            onClick={() =>
              applyFilters({
                ...filterValues,
                sales_id:
                  filterValues.sales_id === identity?.id
                    ? undefined
                    : identity?.id,
              })
            }
          />
          <FilterChip
            label="Has tasks"
            active={Boolean(filterValues["nb_tasks@gt"])}
            onClick={() =>
              applyFilters({
                ...filterValues,
                "nb_tasks@gt": filterValues["nb_tasks@gt"] ? undefined : 0,
              })
            }
          />
          {hasFilters ? (
            <FilterChip
              label="Clear filters"
              active={false}
              onClick={() => applyFilters({})}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

const FilterChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      height: 30,
      padding: "0 10px",
      borderRadius: 8,
      border: active
        ? "1px solid rgba(77,200,232,0.35)"
        : "1px solid rgba(255,255,255,0.08)",
      background: active ? "rgba(77,200,232,0.1)" : "rgba(255,255,255,0.025)",
      color: active ? "var(--hatch-cyan)" : "var(--fg-2)",
      fontSize: 12,
      fontWeight: 650,
      cursor: "pointer",
    }}
  >
    {label}
  </button>
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
