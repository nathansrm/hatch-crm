/* eslint-disable max-lines */
import { useState } from "react";
import {
  InfiniteListBase,
  RecordRepresentation,
  ShowBase,
  useGetList,
  useShowContext,
  useTranslate,
} from "ra-core";
import type { ShowBaseProps } from "ra-core";
import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  FileText,
  Image,
  Mail,
  MapPin,
  Paperclip,
  Pencil,
  Pin,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import { Link } from "react-router";

import {
  HatchCard,
  HatchGhostButton,
  HatchPageHeader,
  HatchTabs,
  HatchTabsContent,
  HatchTabsList,
  HatchTabsTrigger,
} from "../_primitives";
import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { CompanyAvatar } from "../companies/CompanyAvatar";
import { NotesIteratorMobile } from "../notes";
import { NoteCreateSheet } from "../notes/NoteCreateSheet";
import { NoteEditSheet } from "../notes/NoteEditSheet";
import { TagsListEdit } from "./TagsListEdit";
import { ContactEditSheet } from "./ContactEditSheet";
import { ContactStatusSelector } from "./ContactInputs";
import { ContactPersonalInfo } from "./ContactPersonalInfo";
import { ContactBackgroundInfo } from "./ContactBackgroundInfo";
import { ContactTasksList } from "./ContactTasksList";
import type { Contact, ContactNote, Deal } from "../types";
import { Avatar } from "./Avatar";
import { MobileBackButton } from "../misc/MobileBackButton";
import { Status } from "../misc/Status";
import { formatRelativeDate } from "../misc/RelativeDate";
import { AddTask } from "../tasks/AddTask";

export const ContactShow = (props: ShowBaseProps = {}) => {
  const isMobile = useIsMobile();

  return (
    <ShowBase
      queryOptions={{
        onError: isMobile
          ? () => {
              {
                /** Disable error notification as the content handles offline */
              }
            }
          : undefined,
      }}
      {...props}
    >
      {isMobile ? <ContactShowContentMobile /> : <ContactShowContent />}
    </ShowBase>
  );
};

const ContactShowContentMobile = () => {
  const translate = useTranslate();
  const { defaultTitle, record, isPending } = useShowContext<Contact>();
  const [noteCreateOpen, setNoteCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  if (isPending || !record) return null;

  const taskCount = record.nb_tasks ?? 0;

  return (
    <>
      {/* We need to repeat the note creation sheet here to support the note 
      create button that is rendered when there are no notes. */}
      <NoteCreateSheet
        open={noteCreateOpen}
        onOpenChange={setNoteCreateOpen}
        contact_id={record.id}
      />
      <ContactEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        contactId={record.id}
      />
      <MobileHeader>
        <MobileBackButton />
        <div className="flex flex-1 min-w-0">
          <Link to="/contacts" className="flex-1 min-w-0">
            <h1 className="truncate text-xl font-semibold">{defaultTitle}</h1>
          </Link>
        </div>
        <HatchGhostButton
          type="button"
          size="icon"
          className="rounded-full"
          aria-label={translate("ra.action.edit")}
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-5" />
        </HatchGhostButton>
      </MobileHeader>
      <MobileContent>
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Avatar />
            <div className="mx-3 flex-1">
              <h2 className="text-2xl font-bold">
                <RecordRepresentation />
              </h2>
              <div className="text-sm text-muted-foreground">
                {record.title && record.company_id != null
                  ? `${translate("resources.contacts.position_at", {
                      title: record.title,
                    })} `
                  : record.title}
                {record.company_id != null && (
                  <ReferenceField
                    source="company_id"
                    reference="companies"
                    link="show"
                  >
                    <TextField source="name" className="underline" />
                  </ReferenceField>
                )}
              </div>
              {record.lead_source_id != null && (
                <div className="text-sm text-muted-foreground mt-1">
                  <span>Lead Source: </span>
                  <ReferenceField
                    source="lead_source_id"
                    reference="lead_sources"
                    link={false}
                  >
                    <TextField source="name" />
                  </ReferenceField>
                </div>
              )}
            </div>
            <div>
              <ReferenceField
                source="company_id"
                reference="companies"
                link="show"
                className="no-underline"
              >
                <CompanyAvatar />
              </ReferenceField>
            </div>
          </div>
        </div>

        <HatchTabs defaultValue="notes" className="w-full">
          <HatchTabsList className="grid w-full grid-cols-3 h-10">
            <HatchTabsTrigger value="notes" className="px-2 py-1 text-sm">
              {translate("resources.notes.name", { smart_count: 2 })}
            </HatchTabsTrigger>
            <HatchTabsTrigger value="tasks" className="px-2 py-1 text-sm">
              {translate("crm.common.task_count", {
                smart_count: taskCount ?? 0,
              })}
            </HatchTabsTrigger>
            <HatchTabsTrigger value="details" className="px-2 py-1 text-sm">
              {translate("crm.common.details")}
            </HatchTabsTrigger>
          </HatchTabsList>

          <HatchTabsContent value="notes" className="mt-2">
            <InfiniteListBase
              resource="contact_notes"
              filter={{ contact_id: record.id }}
              sort={{ field: "date", order: "DESC" }}
              perPage={25}
              disableSyncWithLocation
              storeKey={false}
              empty={
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {translate("resources.notes.empty")}
                  </p>
                  <HatchGhostButton
                    variant="outline"
                    onClick={() => setNoteCreateOpen(true)}
                  >
                    {translate("resources.notes.action.add")}
                  </HatchGhostButton>
                </div>
              }
              loading={false}
              error={false}
              queryOptions={{
                onError: () => {
                  /** override to hide notification as error case is handled by NotesIteratorMobile */
                },
              }}
            >
              <NotesIteratorMobile contactId={record.id} showStatus />
            </InfiniteListBase>
          </HatchTabsContent>

          <HatchTabsContent value="tasks" className="mt-4">
            <ContactTasksList />
          </HatchTabsContent>

          <HatchTabsContent value="details" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {translate("resources.notes.fields.status")}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactStatusSelector />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate(
                    "resources.contacts.field_categories.personal_info",
                  )}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactPersonalInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate(
                    "resources.contacts.field_categories.background_info",
                  )}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactBackgroundInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate("resources.tags.name", { smart_count: 2 })}
                </h3>
                <Separator />
                <div className="mt-3">
                  <TagsListEdit />
                </div>
              </div>
            </div>
          </HatchTabsContent>
        </HatchTabs>
      </MobileContent>
    </>
  );
};

const ContactShowContent = () => {
  const { record, isPending } = useShowContext<Contact>();
  const [noteCreateOpen, setNoteCreateOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<ContactNote["id"] | null>(
    null,
  );
  const contactId = record?.id;
  const { data: recentNotes = [] } = useGetList<ContactNote>(
    "contact_notes",
    {
      filter: { contact_id: contactId },
      pagination: { page: 1, perPage: 12 },
      sort: { field: "date", order: "DESC" },
    },
    { enabled: !!contactId },
  );
  const { data: deals = [] } = useGetList<Deal>(
    "deals",
    {
      filter: {
        "contact_ids@cs": `{${contactId}}`,
        "archived_at@is": null,
      },
      pagination: { page: 1, perPage: 4 },
      sort: { field: "updated_at", order: "DESC" },
    },
    { enabled: !!contactId },
  );

  if (isPending || !record) return null;

  const primaryEmail =
    record.email_jsonb?.find((email) => email.type === "Work")?.email ??
    record.email_jsonb?.[0]?.email;
  const primaryPhone =
    record.phone_jsonb?.find((phone) => phone.type === "Work")?.number ??
    record.phone_jsonb?.[0]?.number;
  const attachments = recentNotes.flatMap((note) =>
    (note.attachments ?? []).map((attachment) => ({
      ...attachment,
      noteDate: note.date,
    })),
  );

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        minHeight: "100%",
        padding: "24px 28px 28px",
        background: "var(--ink-1)",
      }}
    >
      <NoteCreateSheet
        open={noteCreateOpen}
        onOpenChange={setNoteCreateOpen}
        contact_id={record.id}
      />
      {editingNoteId != null && (
        <NoteEditSheet
          open
          onOpenChange={(open) => {
            if (!open) setEditingNoteId(null);
          }}
          noteId={editingNoteId}
        />
      )}
      <HatchPageHeader
        eyebrow={
          <Link
            to="/contacts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <ArrowLeft style={{ width: 13, height: 13 }} />
            Contacts
          </Link>
        }
        title={<RecordRepresentation />}
        subline={
          <span>
            {record.title ? `${record.title} at ` : ""}
            {record.company_id != null ? (
              <ReferenceField
                source="company_id"
                reference="companies"
                link="show"
              >
                <TextField source="name" />
              </ReferenceField>
            ) : (
              "No company attached"
            )}
          </span>
        }
        actions={
          <>
            <ProfileActionButton
              href={primaryEmail ? `mailto:${primaryEmail}` : undefined}
            >
              <Mail style={{ width: 15, height: 15 }} />
              Email
            </ProfileActionButton>
            <ProfileActionButton
              href={primaryPhone ? `tel:${primaryPhone}` : undefined}
            >
              <Phone style={{ width: 15, height: 15 }} />
              Call
            </ProfileActionButton>
            <HatchGhostButton
              type="button"
              size="sm"
              className="h-9"
              onClick={() => setNoteCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add note
            </HatchGhostButton>
            <AddTask
              label="New task"
              wrapperClassName="my-0"
              className="h-9 px-3 font-semibold shadow-[0_0_20px_rgba(77,200,232,0.22)]"
              style={{
                background: "var(--hatch-cyan)",
                borderColor: "rgba(77,200,232,0.45)",
                color: "var(--hatch-ink)",
              }}
            />
          </>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div
          className="grid gap-3"
          style={{
            gridColumn: 1,
            gridTemplateColumns: "300px minmax(0, 1fr)",
            alignItems: "stretch",
          }}
        >
          <HatchCard
            padding="md"
            className="space-y-4"
            style={{ gridColumn: 1 }}
          >
            <div className="flex items-start gap-3">
              <Avatar />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#4DC8E8]">
                  Contact card
                </div>
                <h2 className="font-heading m-0 text-lg font-bold text-[#ECEEF5]">
                  <RecordRepresentation />
                </h2>
                <div className="mt-1">
                  <Status status={record.status} />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <ProfileField
                icon={Mail}
                label="Email"
                value={primaryEmail}
                href={primaryEmail ? `mailto:${primaryEmail}` : undefined}
              />
              <ProfileField
                icon={Phone}
                label="Phone"
                value={primaryPhone}
                href={primaryPhone ? `tel:${primaryPhone}` : undefined}
              />
              <ProfileField
                icon={MapPin}
                label="Location"
                value="Contact location"
                muted
              />
              <ProfileField
                icon={UserRound}
                label="Lead source"
                value={
                  record.lead_source_id != null ? (
                    <ReferenceField
                      source="lead_source_id"
                      reference="lead_sources"
                      link={false}
                    >
                      <TextField source="name" />
                    </ReferenceField>
                  ) : (
                    "Not set"
                  )
                }
                muted={record.lead_source_id == null}
              />
            </div>
            <Separator className="bg-[rgba(255,255,255,0.07)]" />
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5C6784]">
                Relationship details
              </div>
              <div className="space-y-3">
                <ContactStatusSelector />
                <TagsListEdit />
              </div>
            </div>
          </HatchCard>

          <HatchCard
            padding="md"
            className="min-w-0"
            style={{ gridColumn: 2, height: "100%" }}
          >
            <SectionHeader
              eyebrow="Relationship timeline"
              title="Activity, notes, and email context"
            />
            <ActivityFeed notes={recentNotes} contact={record} />
          </HatchCard>

          <HatchCard
            id="contact-notes"
            padding="md"
            className="overflow-hidden"
            style={{ gridColumn: "1 / 3" }}
          >
            <div className="flex items-start justify-between gap-3">
              <SectionHeader
                eyebrow="Relationship notes"
                title={`${recentNotes.length} note${recentNotes.length === 1 ? "" : "s"}`}
              />
              <HatchGhostButton
                type="button"
                size="sm"
                className="h-8"
                onClick={() => setNoteCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add note
              </HatchGhostButton>
            </div>
            <ContactNotesBoard
              notes={recentNotes}
              onAddNote={() => setNoteCreateOpen(true)}
              onEditNote={setEditingNoteId}
            />
          </HatchCard>
        </div>

        <div className="grid gap-3" style={{ gridColumn: 2 }}>
          <HatchCard padding="md">
            <SectionHeader eyebrow="Company" title="Connected account" />
            {record.company_id != null ? (
              <Link
                to={`/companies/${record.company_id}/show`}
                className="mt-3 flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-3 no-underline hover:bg-[rgba(255,255,255,0.04)]"
              >
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link={false}
                >
                  <CompanyAvatar />
                </ReferenceField>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-[#ECEEF5]">
                    <ReferenceField
                      source="company_id"
                      reference="companies"
                      link={false}
                    >
                      <TextField source="name" />
                    </ReferenceField>
                  </div>
                  <div className="text-xs text-[#9AA3BE]">
                    Open company record
                  </div>
                </div>
              </Link>
            ) : (
              <EmptyPanelLine>No company connected.</EmptyPanelLine>
            )}
          </HatchCard>

          <HatchCard padding="md">
            <SectionHeader eyebrow="Deals" title="Related opportunities" />
            <div className="mt-3 grid gap-2">
              {deals.length ? (
                deals.map((deal) => (
                  <RelatedDealCard key={deal.id} deal={deal} />
                ))
              ) : (
                <EmptyPanelLine>No related deals yet.</EmptyPanelLine>
              )}
            </div>
          </HatchCard>

          <HatchCard padding="md">
            <SectionHeader eyebrow="Tasks" title="Open follow-ups" />
            <div className="mt-3">
              <ContactTasksList />
            </div>
          </HatchCard>

          <HatchCard padding="md">
            <SectionHeader eyebrow="Files" title="Attached files" />
            <div className="mt-3 grid gap-2">
              {attachments.length ? (
                attachments.slice(0, 4).map((attachment, index) => (
                  <div
                    key={`${attachment.src ?? attachment.title}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-3"
                  >
                    <FileText className="h-4 w-4 text-[#4DC8E8]" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#ECEEF5]">
                        {attachment.title ?? "Attachment"}
                      </div>
                      <div className="text-xs text-[#9AA3BE]">
                        Added {formatRelativeDate(attachment.noteDate, "en")}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyPanelLine>
                  No files attached to this relationship yet.
                </EmptyPanelLine>
              )}
            </div>
          </HatchCard>

          <HatchCard padding="md">
            <SectionHeader eyebrow="Details" title="Background" />
            <div className="mt-3 space-y-4">
              <ContactPersonalInfo />
              <Separator className="bg-[rgba(255,255,255,0.07)]" />
              <ContactBackgroundInfo />
            </div>
          </HatchCard>
        </div>
      </div>
    </div>
  );
};

const ProfileActionButton = ({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) => {
  if (!href) {
    return (
      <HatchGhostButton size="sm" className="h-9 opacity-50" disabled>
        {children}
      </HatchGhostButton>
    );
  }

  return (
    <HatchGhostButton asChild size="sm" className="h-9">
      <a href={href}>{children}</a>
    </HatchGhostButton>
  );
};

const SectionHeader = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <div>
    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4DC8E8]">
      {eyebrow}
    </div>
    <h3 className="font-heading m-0 mt-1 text-[16px] font-bold text-[#ECEEF5]">
      {title}
    </h3>
  </div>
);

const ProfileField = ({
  icon: Icon,
  label,
  value,
  href,
  muted,
}: {
  icon: typeof Mail;
  label: string;
  value: ReactNode;
  href?: string;
  muted?: boolean;
}) => {
  const content = (
    <>
      <Icon className="h-4 w-4 text-[#5C6784]" />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5C6784]">
          {label}
        </div>
        <div
          className="truncate text-sm"
          style={{ color: muted ? "var(--fg-3)" : "var(--fg-mid)" }}
        >
          {value || "Not set"}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-2 no-underline"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-2">
      {content}
    </div>
  );
};

const ContactNotesBoard = ({
  notes,
  onAddNote,
  onEditNote,
}: {
  notes: ContactNote[];
  onAddNote: () => void;
  onEditNote: (noteId: ContactNote["id"]) => void;
}) => {
  if (!notes.length) {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={onAddNote}
          className="flex min-h-28 w-full items-center justify-between rounded-lg border border-dashed border-[rgba(77,200,232,0.24)] bg-[rgba(77,200,232,0.045)] p-4 text-left text-sm text-[#9AA3BE] transition hover:border-[rgba(77,200,232,0.45)] hover:bg-[rgba(77,200,232,0.07)]"
        >
          <span>
            No relationship notes yet. Add the first call recap, preference, or
            follow-up detail.
          </span>
          <Plus className="h-4 w-4 text-[#4DC8E8]" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onAddNote}
        className="mb-3 flex h-10 w-full items-center justify-between rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] px-3 text-left text-sm text-[#5C6784] transition hover:border-[rgba(77,200,232,0.28)] hover:text-[#9AA3BE]"
      >
        <span>Quick add note...</span>
        <Plus className="h-4 w-4" />
      </button>
      <div className="-mx-1 overflow-x-auto px-1 pb-2">
        <div
          className="grid gap-3"
          style={{
            gridAutoColumns: "minmax(218px, 246px)",
            gridAutoFlow: "column",
            gridTemplateRows:
              notes.length > 3
                ? "repeat(2, minmax(178px, auto))"
                : "minmax(178px, auto)",
          }}
        >
          {notes.map((note) => (
            <StickyNoteCard
              key={note.id}
              note={note}
              onOpen={() => onEditNote(note.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const StickyNoteCard = ({
  note,
  onOpen,
}: {
  note: ContactNote;
  onOpen: () => void;
}) => {
  const attachments = note.attachments ?? [];
  const imageCount = attachments.filter((attachment) =>
    attachment.type?.startsWith("image/"),
  ).length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group grid min-h-[178px] content-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.022))] p-3 text-left shadow-[0_14px_36px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-[rgba(77,200,232,0.35)] hover:shadow-[0_18px_42px_rgba(0,0,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4DC8E8]"
      aria-label={`Edit note from ${formatRelativeDate(note.date, "en")}`}
    >
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-mono text-[11px] text-[#9AA3BE]">
              {formatRelativeDate(note.date, "en")}
            </div>
            <div className="mt-1">
              <Status status={note.status} />
            </div>
          </div>
          <Pin className="h-3.5 w-3.5 shrink-0 text-[#5C6784] transition group-hover:text-[#4DC8E8]" />
        </div>
        <p className="m-0 line-clamp-5 text-sm leading-5 text-[#D9DEEA]">
          {note.text || "Attachment-only note"}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <NoteMetaChip>Status: {formatNoteStatus(note.status)}</NoteMetaChip>
        {attachments.length ? (
          <NoteMetaChip>
            <Paperclip className="h-3.5 w-3.5" />
            {attachments.length} file{attachments.length === 1 ? "" : "s"}
          </NoteMetaChip>
        ) : (
          <NoteMetaChip>Text note</NoteMetaChip>
        )}
        {imageCount > 0 && (
          <NoteMetaChip>
            <Image className="h-3.5 w-3.5" />
            {imageCount} image{imageCount === 1 ? "" : "s"}
          </NoteMetaChip>
        )}
      </div>
    </button>
  );
};

const NoteMetaChip = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex h-6 items-center gap-1 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.045)] px-2 text-[11px] font-semibold text-[#9AA3BE]">
    {children}
  </span>
);

const formatNoteStatus = (status: string | undefined) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unlabeled";

const ActivityFeed = ({
  notes,
  contact,
}: {
  notes: ContactNote[];
  contact: Contact;
}) => {
  const items = notes.slice(0, 2);

  return (
    <div className="mt-4 grid gap-3">
      <div className="rounded-lg border border-[rgba(77,200,232,0.18)] bg-[rgba(77,200,232,0.055)] p-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#4DC8E8]">
          <CalendarCheck className="h-4 w-4" />
          Next best action
        </div>
        <div className="mt-2 text-sm font-semibold text-[#ECEEF5]">
          {(contact.nb_tasks ?? 0) > 0
            ? "Review the open follow-up tasks for this relationship."
            : "Add the next task or relationship note from this profile."}
        </div>
      </div>
      {items.length ? (
        items.map((note) => (
          <div
            key={note.id}
            className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-3"
          >
            <div className="grid h-7 w-7 place-items-center rounded-md bg-[rgba(77,200,232,0.09)] text-[#4DC8E8]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[#ECEEF5]">
                  Note added
                </div>
                <div className="font-mono text-[11px] text-[#5C6784]">
                  {formatRelativeDate(note.date, "en")}
                </div>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-[#9AA3BE]">
                {note.text}
              </p>
              <div className="mt-2">
                <Status status={note.status} />
              </div>
            </div>
          </div>
        ))
      ) : (
        <EmptyPanelLine>
          No activity yet. Add the first relationship note below.
        </EmptyPanelLine>
      )}
    </div>
  );
};

const RelatedDealCard = ({ deal }: { deal: Deal }) => (
  <Link
    to={`/deals/${deal.id}/show`}
    className="grid gap-1 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-3 no-underline hover:bg-[rgba(255,255,255,0.04)]"
  >
    <div className="flex items-center gap-2">
      <BriefcaseBusiness className="h-4 w-4 text-[#4DC8E8]" />
      <div className="min-w-0 truncate text-sm font-bold text-[#ECEEF5]">
        {deal.name}
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs text-[#9AA3BE]">
      <Building2 className="h-3.5 w-3.5" />
      <span>{deal.stage}</span>
      {deal.amount > 0 ? (
        <span className="font-mono">${deal.amount.toLocaleString()}</span>
      ) : null}
    </div>
  </Link>
);

const EmptyPanelLine = ({ children }: { children: ReactNode }) => (
  <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-3 text-sm text-[#5C6784]">
    {children}
  </div>
);
