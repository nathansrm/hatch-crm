import { useMutation } from "@tanstack/react-query";
import { isValid } from "date-fns";
import { Archive, ArchiveRestore } from "lucide-react";
import {
  InfiniteListBase,
  ShowBase,
  useDataProvider,
  useNotify,
  useRecordContext,
  useRedirect,
  useRefresh,
  useTranslate,
  useUpdate,
} from "ra-core";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditButton } from "@/components/admin/edit-button";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { Badge } from "@/components/ui/badge";

import {
  HatchCard,
  HatchDialog,
  HatchGhostButton,
  HatchStagePill,
} from "../_primitives";
import { CompanyAvatar } from "../companies/CompanyAvatar";
import { NoteCreate } from "../notes/NoteCreate";
import { NotesIterator } from "../notes/NotesIterator";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { ContactList } from "./ContactList";
import { DecisionContextBlock } from "./DecisionContextBlock";
import { findDealLabel, formatISODateString } from "./dealUtils";
import { StackBlock } from "./StackBlock";

export const DealShow = ({ open, id }: { open: boolean; id?: string }) => {
  const redirect = useRedirect();
  const handleClose = () => {
    redirect("list", "deals");
  };

  return (
    <HatchDialog
      open={open}
      onOpenChange={(open) => !open && handleClose()}
      title="Deal details"
      showHeader={false}
      size="xl"
      contentClassName="max-h-[calc(100vh-48px)]"
      className="max-h-[calc(100vh-48px)] overflow-y-auto"
    >
      {id ? (
        <ShowBase id={id}>
          <DealShowContent />
        </ShowBase>
      ) : null}
    </HatchDialog>
  );
};

const DealShowContent = () => {
  const translate = useTranslate();
  const { dealStages, dealCategories, currency } = useConfigurationContext();
  const record = useRecordContext<Deal>();
  if (!record) return null;

  return (
    <div className="space-y-5">
      {record.archived_at ? <ArchivedBanner /> : null}

      {/* Title row + actions, inline so they share record context */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <ReferenceField source="company_id" reference="companies" link="show">
            <CompanyAvatar />
          </ReferenceField>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5C6784]">
              DEAL
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#ECEEF5] truncate">
              {record.name}
            </h2>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {record.archived_at ? (
            <>
              <UnarchiveButton record={record} />
              <DeleteButton />
            </>
          ) : (
            <>
              <ArchiveButton record={record} />
              <EditButton />
            </>
          )}
        </div>
      </div>

      {/* Stat strip */}
      <div className="flex flex-wrap gap-x-8 gap-y-4 border-y border-[rgba(255,255,255,0.07)] py-4">
        <StatCol label={translate("resources.deals.fields.stage")}>
          <HatchStagePill
            stage={record.stage}
            label={findDealLabel(dealStages, record.stage)}
          />
        </StatCol>
        <StatCol label={translate("resources.deals.fields.amount")}>
          <span className="font-mono text-sm font-semibold text-[#ECEEF5]">
            {record.amount.toLocaleString("en-US", {
              notation: "compact",
              style: "currency",
              currency,
              currencyDisplay: "narrowSymbol",
              minimumSignificantDigits: 3,
            })}
          </span>
        </StatCol>
        <StatCol
          label={translate("resources.deals.fields.expected_closing_date")}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#ECEEF5]">
              {isValid(new Date(record.expected_closing_date))
                ? formatISODateString(record.expected_closing_date)
                : translate("resources.deals.invalid_date")}
            </span>
            {new Date(record.expected_closing_date) < new Date() ? (
              <Badge className="border border-[rgba(239,90,111,0.28)] bg-[rgba(239,90,111,0.08)] text-[10.5px] font-bold uppercase tracking-[0.04em] text-[#EF5A6F]">
                {translate("crm.common.past")}
              </Badge>
            ) : null}
          </div>
        </StatCol>
        {record.category && (
          <StatCol label={translate("resources.deals.fields.category")}>
            <span className="text-sm text-[#ECEEF5]">
              {dealCategories.find((c) => c.value === record.category)?.label ??
                record.category}
            </span>
          </StatCol>
        )}
      </div>

      <div className="flex flex-col gap-5 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <DecisionContextBlock record={record} />
          <StackBlock record={record} />

          {record.description && (
            <HatchCard className="space-y-2 whitespace-pre-line" padding="md">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5C6784]">
                {translate("resources.deals.fields.description")}
              </h3>
              <p className="text-sm leading-6 text-[#B8C0D6]">
                {record.description}
              </p>
            </HatchCard>
          )}

          <HatchCard padding="md">
            <InfiniteListBase
              resource="deal_notes"
              filter={{ deal_id: record.id }}
              sort={{ field: "date", order: "DESC" }}
              perPage={25}
              disableSyncWithLocation
              storeKey={false}
              empty={<NoteCreate reference={"deals"} />}
            >
              <NotesIterator reference="deals" />
            </InfiniteListBase>
          </HatchCard>
        </div>

        <div className="flex w-full flex-col gap-4 md:w-64 md:shrink-0">
          {!!record.contact_ids?.length && (
            <HatchCard padding="md" className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5C6784]">
                {translate("resources.deals.fields.contact_ids")}
              </h3>
              <ReferenceArrayField
                source="contact_ids"
                reference="contacts_summary"
              >
                <ContactList />
              </ReferenceArrayField>
            </HatchCard>
          )}
        </div>
      </div>
    </div>
  );
};

function StatCol({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-[140px] flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5C6784]">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

const ArchivedBanner = () => {
  const translate = useTranslate();
  return (
    <div
      className="rounded-lg border px-4 py-3"
      style={{
        background: "rgba(239,90,111,0.08)",
        borderColor: "rgba(239,90,111,0.28)",
      }}
    >
      <h3 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-[#EF5A6F]">
        {translate("resources.deals.archived.title")}
      </h3>
    </div>
  );
};

const ArchiveButton = ({ record }: { record: Deal }) => {
  const translate = useTranslate();
  const [update] = useUpdate();
  const redirect = useRedirect();
  const notify = useNotify();
  const refresh = useRefresh();
  const handleClick = () => {
    update(
      "deals",
      {
        id: record.id,
        data: { archived_at: new Date().toISOString() },
        previousData: record,
      },
      {
        onSuccess: () => {
          redirect("list", "deals");
          notify("resources.deals.archived.success", {
            type: "info",
            undoable: false,
          });
          refresh();
        },
        onError: () => {
          notify("resources.deals.archived.error", {
            type: "error",
          });
        },
      },
    );
  };

  return (
    <HatchGhostButton
      onClick={handleClick}
      size="sm"
      variant="outline"
      className="flex h-9 items-center gap-2 border-[rgba(255,255,255,0.09)] bg-transparent text-[#B8C0D6] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#ECEEF5]"
    >
      <Archive className="w-4 h-4" />
      {translate("resources.deals.archived.action")}
    </HatchGhostButton>
  );
};

const UnarchiveButton = ({ record }: { record: Deal }) => {
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const redirect = useRedirect();
  const notify = useNotify();
  const refresh = useRefresh();

  const { mutate } = useMutation({
    mutationFn: () => dataProvider.unarchiveDeal(record),
    onSuccess: () => {
      redirect("list", "deals");
      notify("resources.deals.unarchived.success", {
        type: "info",
        undoable: false,
      });
      refresh();
    },
    onError: () => {
      notify("resources.deals.unarchived.error", {
        type: "error",
      });
    },
  });

  return (
    <HatchGhostButton
      onClick={() => mutate()}
      size="sm"
      variant="outline"
      className="flex h-9 items-center gap-2 border-[rgba(255,255,255,0.09)] bg-transparent text-[#B8C0D6] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#ECEEF5]"
    >
      <ArchiveRestore className="w-4 h-4" />
      {translate("resources.deals.unarchived.action")}
    </HatchGhostButton>
  );
};
