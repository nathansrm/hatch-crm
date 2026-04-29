import { difference, union } from "lodash";
import {
  type Identifier,
  RecordContextProvider,
  RecordRepresentation,
  useListContext,
  useLocaleState,
  useTimeout,
  useTranslate,
} from "ra-core";
import { type MouseEvent, useCallback, useRef } from "react";
import { Link } from "react-router";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

import { Status } from "../misc/Status";
import { formatRelativeDate } from "../misc/RelativeDate";
import type { Contact } from "../types";
import { Avatar } from "./Avatar";

export const ContactListContent = () => {
  const translate = useTranslate();
  const {
    data: contacts,
    error,
    isPending,
    onToggleItem,
    onSelect,
    selectedIds,
  } = useListContext<Contact>();
  const lastSelected = useRef<Identifier | null>(null);

  // Handle shift+click to select a range of rows
  const handleToggleItem = useCallback(
    (id: Identifier, event: MouseEvent) => {
      if (!contacts) return;

      const ids = contacts.map((contact) => contact.id);
      const lastSelectedIndex = lastSelected.current
        ? ids.indexOf(lastSelected.current)
        : -1;

      if (event.shiftKey && lastSelectedIndex !== -1) {
        const index = ids.indexOf(id);
        const idsBetweenSelections = ids.slice(
          Math.min(lastSelectedIndex, index),
          Math.max(lastSelectedIndex, index) + 1,
        );

        const isClickedItemSelected = selectedIds?.includes(id);
        const newSelectedIds = isClickedItemSelected
          ? difference(selectedIds, idsBetweenSelections)
          : union(selectedIds, idsBetweenSelections);

        onSelect?.(newSelectedIds);
      } else {
        onToggleItem(id);
      }

      lastSelected.current = id;
    },
    [contacts, selectedIds, onSelect, onToggleItem],
  );

  if (isPending) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr",
          gap: 16,
          padding: "10px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          fontSize: 9.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--fg-3)",
          fontWeight: 700,
        }}
      >
        <div>Name</div>
        <div>Company</div>
        <div>Role</div>
        <div>Last Activity</div>
      </div>
      {contacts.map((contact) => (
        <RecordContextProvider key={contact.id} value={contact}>
          <ContactItemContent
            contact={contact}
            handleToggleItem={handleToggleItem}
          />
        </RecordContextProvider>
      ))}

      {contacts.length === 0 && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--fg-3)",
            fontSize: 13,
          }}
        >
          {translate("resources.contacts.empty.title", {})}
        </div>
      )}
    </div>
  );
};

const ContactItemContent = ({
  contact,
  handleToggleItem,
}: {
  contact: Contact;
  handleToggleItem: (id: Identifier, event: MouseEvent) => void;
}) => {
  const [locale = "en"] = useLocaleState();
  const { selectedIds } = useListContext<Contact>();
  const isSelected = selectedIds.includes(contact.id);
  const primaryEmail =
    contact.email_jsonb?.find((email) => email.type === "Work")?.email ??
    contact.email_jsonb?.[0]?.email;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr",
        gap: 16,
        padding: "13px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        alignItems: "center",
        cursor: "pointer",
        transition: "background 0.15s",
        background: isSelected ? "rgba(77,200,232,0.04)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          onClick={(e) => handleToggleItem(contact.id, e)}
          style={{ cursor: "pointer", flexShrink: 0 }}
        >
          <div
            data-slot="checkbox"
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={0}
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: isSelected ? "var(--hatch-cyan)" : "transparent",
              border: isSelected
                ? "1.5px solid var(--hatch-cyan)"
                : "1.5px solid rgba(255,255,255,0.2)",
              display: "grid",
              placeItems: "center",
            }}
          >
            {isSelected && (
              <span
                style={{
                  color: "var(--hatch-ink)",
                  fontSize: 10,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {"\u2713"}
              </span>
            )}
          </div>
        </div>
        <Link
          to={`/contacts/${contact.id}/show`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
            flex: 1,
            minWidth: 0,
          }}
        >
          <Avatar />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--fg-1)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {`${contact.first_name} ${contact.last_name ?? ""}`}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 12,
                color: primaryEmail ? "var(--fg-2)" : "var(--fg-3)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {primaryEmail || "\u2014"}
            </div>
          </div>
        </Link>
      </div>
      <Link
        to={`/contacts/${contact.id}/show`}
        style={{ textDecoration: "none", minWidth: 0 }}
      >
        {contact.company_id != null ? (
          <span style={{ fontSize: 12.5, color: "var(--fg-2)" }}>
            <ReferenceField
              source="company_id"
              reference="companies"
              link={false}
            >
              <TextField source="name" />
            </ReferenceField>
          </span>
        ) : (
          <span style={{ color: "var(--fg-3)", fontSize: 12 }}>{"\u2014"}</span>
        )}
      </Link>
      <Link
        to={`/contacts/${contact.id}/show`}
        style={{ textDecoration: "none", minWidth: 0 }}
      >
        <span
          style={{
            fontSize: 12,
            color: contact.title ? "var(--fg-2)" : "var(--fg-3)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "block",
          }}
        >
          {contact.title || "\u2014"}
        </span>
      </Link>
      <Link
        to={`/contacts/${contact.id}/show`}
        style={{ textDecoration: "none", minWidth: 0 }}
      >
        {contact.last_seen ? (
          <span
            className="font-mono"
            style={{
              fontSize: 11.5,
              color: "var(--fg-3)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block",
            }}
          >
            {formatRelativeDate(contact.last_seen, locale)}
          </span>
        ) : (
          <span style={{ color: "var(--fg-3)", fontSize: 11.5 }}>
            {"\u2014"}
          </span>
        )}
      </Link>
    </div>
  );
};

export const ContactListContentMobile = () => {
  const translate = useTranslate();
  const {
    data: contacts,
    error,
    isPending,
    refetch,
  } = useListContext<Contact>();
  const oneSecondHasPassed = useTimeout(1000);

  if (isPending) {
    if (!oneSecondHasPassed) {
      return null;
    }
    return (
      <>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex flex-row items-center py-2 hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
          >
            <div className="flex flex-row gap-4 items-center mr-4">
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <Skeleton className="w-32 h-5 mb-2" />
              <Skeleton className="w-48 h-4" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (error && !contacts) {
    return (
      <div className="p-4">
        <div className="text-center text-muted-foreground mb-4">
          {translate("resources.contacts.list.error_loading")}
        </div>
        <div className="text-center mt-2">
          <Button
            onClick={() => {
              refetch();
            }}
          >
            <RotateCcw />
            {translate("crm.common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:divide-y">
      {contacts.map((contact) => (
        <RecordContextProvider key={contact.id} value={contact}>
          <ContactItemContentMobile contact={contact} />
        </RecordContextProvider>
      ))}
      {contacts.length === 0 && (
        <div className="p-4">
          <div className="text-muted-foreground">
            {translate("resources.contacts.empty.title")}
          </div>
        </div>
      )}
    </div>
  );
};

const ContactItemContentMobile = ({ contact }: { contact: Contact }) => {
  const translate = useTranslate();
  return (
    <Link
      to={`/contacts/${contact.id}/show`}
      className="flex flex-row gap-4 items-center py-2 hover:bg-muted transition-colors"
    >
      <Avatar />
      <div className="flex flex-col grow justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <div className="font-medium">
              <RecordRepresentation />
            </div>
            <Status status={contact.status} />
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="flex flex-col gap-1">
              <span>
                {contact.title && contact.company_id != null
                  ? `${translate("resources.contacts.position_at", {
                      title: contact.title,
                    })} `
                  : contact.title}
                {contact.company_id != null && (
                  <ReferenceField
                    source="company_id"
                    reference="companies"
                    link={false}
                  >
                    <TextField source="name" />
                  </ReferenceField>
                )}
              </span>
              {contact.nb_tasks ? (
                <span>
                  {translate("crm.common.task_count", {
                    smart_count: contact.nb_tasks,
                  })}
                </span>
              ) : null}
              {contact.lead_source_id != null && (
                <span>
                  Lead Source:{" "}
                  <ReferenceField
                    source="lead_source_id"
                    reference="lead_sources"
                    link={false}
                  >
                    <TextField source="name" />
                  </ReferenceField>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
