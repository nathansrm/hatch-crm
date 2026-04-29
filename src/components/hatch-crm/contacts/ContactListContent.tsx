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
import { type CSSProperties, type MouseEvent, type ReactNode, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Phone, RotateCcw } from "lucide-react";

import { Status } from "../misc/Status";
import { formatRelativeDate } from "../misc/RelativeDate";
import type { Contact } from "../types";
import { Avatar } from "./Avatar";
import { TagsList } from "./TagsList";

const CONTACT_TABLE_COLUMNS =
  "30px minmax(190px, 1.7fr) minmax(130px, 1.15fr) minmax(105px, 0.85fr) 92px 105px 118px minmax(100px, 0.8fr) 96px";

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
          gridTemplateColumns: CONTACT_TABLE_COLUMNS,
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          fontSize: 9.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--fg-3)",
          fontWeight: 700,
          alignItems: "center",
        }}
      >
        <div />
        <div>Name</div>
        <div>Company</div>
        <div>Role</div>
        <div>Lifecycle</div>
        <div>Last touch</div>
        <div>Next action</div>
        <div>Tags</div>
        <div>Quick actions</div>
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
  const navigate = useNavigate();
  const { selectedIds } = useListContext<Contact>();
  const isSelected = selectedIds?.includes(contact.id) ?? false;
  const primaryEmail =
    contact.email_jsonb?.find((email) => email.type === "Work")?.email ??
    contact.email_jsonb?.[0]?.email;
  const primaryPhone =
    contact.phone_jsonb?.find((phone) => phone.type === "Work")?.number ??
    contact.phone_jsonb?.[0]?.number;
  const contactPath = `/contacts/${contact.id}/show`;
  const nextAction =
    (contact.nb_tasks ?? 0) > 0 ? "Follow up today" : "Open profile";

  const handleRowClick = () => {
    navigate(contactPath);
  };

  const handleCheckboxClick = (event: MouseEvent) => {
    event.stopPropagation();
    handleToggleItem(contact.id, event);
  };

  return (
    <div
      onClick={handleRowClick}
      style={{
        display: "grid",
        gridTemplateColumns: CONTACT_TABLE_COLUMNS,
        gap: 12,
        padding: "13px 16px",
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
      <div
        onClick={handleCheckboxClick}
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
              : "1.5px solid rgba(255,255,255,0.22)",
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <Link
          to={contactPath}
          onClick={(event) => event.stopPropagation()}
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
      <div style={{ minWidth: 0 }}>
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
      </div>
      <div style={{ minWidth: 0 }}>
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
      </div>
      <div style={{ minWidth: 0 }}>
        <LifecycleBadge status={contact.status} />
      </div>
      <div style={{ minWidth: 0 }}>
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
      </div>
      <div style={{ minWidth: 0 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 24,
            padding: "3px 9px",
            borderRadius: 7,
            border:
              (contact.nb_tasks ?? 0) > 0
                ? "1px solid rgba(232,203,125,0.24)"
                : "1px solid rgba(255,255,255,0.07)",
            background:
              (contact.nb_tasks ?? 0) > 0
                ? "rgba(232,203,125,0.08)"
                : "rgba(255,255,255,0.025)",
            color: (contact.nb_tasks ?? 0) > 0 ? "var(--warn)" : "var(--fg-3)",
            fontSize: 11.5,
            fontWeight: 650,
            whiteSpace: "nowrap",
          }}
        >
          {nextAction}
        </span>
      </div>
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
          overflow: "hidden",
        }}
      >
        {contact.tags?.length ? (
          <TagsList />
        ) : (
          <span style={{ color: "var(--fg-3)", fontSize: 12 }}>{"\u2014"}</span>
        )}
      </div>
      <div
        onClick={(event) => event.stopPropagation()}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <QuickAction
          href={primaryEmail ? `mailto:${primaryEmail}` : undefined}
          label="Email contact"
          disabled={!primaryEmail}
        >
          <Mail style={{ width: 14, height: 14 }} />
        </QuickAction>
        <QuickAction
          href={primaryPhone ? `tel:${primaryPhone}` : undefined}
          label="Call contact"
          disabled={!primaryPhone}
        >
          <Phone style={{ width: 14, height: 14 }} />
        </QuickAction>
        <QuickAction href={contactPath} label="Open contact profile">
          <ExternalLink style={{ width: 14, height: 14 }} />
        </QuickAction>
      </div>
    </div>
  );
};

const statusAccent: Record<string, { bg: string; border: string; text: string }> = {
  cold: {
    bg: "rgba(125,189,232,0.08)",
    border: "rgba(125,189,232,0.24)",
    text: "#7DBDE8",
  },
  warm: {
    bg: "rgba(232,203,125,0.08)",
    border: "rgba(232,203,125,0.24)",
    text: "#E8CB7D",
  },
  hot: {
    bg: "rgba(232,139,125,0.08)",
    border: "rgba(232,139,125,0.24)",
    text: "#E88B7D",
  },
  closed: {
    bg: "rgba(164,232,125,0.08)",
    border: "rgba(164,232,125,0.24)",
    text: "#A4E87D",
  },
};

const LifecycleBadge = ({ status }: { status: string }) => {
  const accent = statusAccent[status] ?? {
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.1)",
    text: "var(--fg-2)",
  };
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")
    : "Unknown";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 24,
        padding: "3px 9px",
        borderRadius: 7,
        border: `1px solid ${accent.border}`,
        background: accent.bg,
        color: accent.text,
        fontSize: 11.5,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

const QuickAction = ({
  href,
  label,
  disabled,
  children,
}: {
  href?: string;
  label: string;
  disabled?: boolean;
  children: ReactNode;
}) => {
  const baseStyle: CSSProperties = {
    width: 29,
    height: 29,
    display: "grid",
    placeItems: "center",
    borderRadius: 7,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: disabled ? "rgba(154,163,190,0.35)" : "var(--fg-2)",
    cursor: disabled ? "not-allowed" : "pointer",
  };

  if (!href || disabled) {
    return (
      <span aria-label={label} aria-disabled style={baseStyle}>
        {children}
      </span>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link to={href} aria-label={label} style={baseStyle}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} aria-label={label} style={baseStyle}>
      {children}
    </a>
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
