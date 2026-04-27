import { useGetList, useRecordContext, useTranslate } from "ra-core";
import { Link } from "react-router";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin";
import { ReferenceManyField } from "@/components/admin/reference-many-field";
import { ShowButton } from "@/components/admin/show-button";
import { Badge } from "@/components/ui/badge";

import { formatCompactCurrency } from "../dashboard/widgets/dashboardUtils";
import { findDealLabel } from "../deals/dealUtils";
import { stageColorMap } from "../deals/stageColors";
import { AddTask } from "../tasks/AddTask";
import { TasksIterator } from "../tasks/TasksIterator";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { TagsListEdit } from "./TagsListEdit";
import { ContactStatusSelector } from "./ContactInputs";
import { ContactPersonalInfo } from "./ContactPersonalInfo";
import { ContactBackgroundInfo } from "./ContactBackgroundInfo";
import { HatchAside, HatchAsideSection } from "../_primitives";
import type { Contact, Deal } from "../types";
import { ContactMergeButton } from "./ContactMergeButton";
import { ExportVCardButton } from "./ExportVCardButton";

export const ContactAside = ({ link = "edit" }: { link?: "edit" | "show" }) => {
  const record = useRecordContext<Contact>();
  const translate = useTranslate();
  const { currency, dealStages } = useConfigurationContext();
  const { data: deals, isPending } = useGetList<Deal>(
    "deals",
    {
      pagination: { page: 1, perPage: 10 },
      sort: { field: "updated_at", order: "DESC" },
      filter: {
        "contact_ids@cs": `{${record?.id}}`,
        "archived_at@is": null,
      },
    },
    { enabled: !!record?.id },
  );

  if (!record) return null;

  return (
    <HatchAside>
      <div className="mb-4 -ml-1">
        {link === "edit" ? (
          <EditButton label="resources.contacts.action.edit" />
        ) : (
          <ShowButton label="resources.contacts.action.show" />
        )}
      </div>

      <HatchAsideSection title={translate("resources.notes.fields.status")}>
        <ContactStatusSelector />
      </HatchAsideSection>

      <HatchAsideSection
        title={translate("resources.contacts.field_categories.personal_info")}
      >
        <ContactPersonalInfo />
      </HatchAsideSection>

      <HatchAsideSection
        title={translate("resources.contacts.field_categories.background_info")}
      >
        <ContactBackgroundInfo />
      </HatchAsideSection>

      <HatchAsideSection
        title={translate("resources.tags.name", { smart_count: 2 })}
      >
        <TagsListEdit />
      </HatchAsideSection>

      <HatchAsideSection
        title={translate("resources.tasks.name", { smart_count: 2 })}
      >
        <ReferenceManyField
          target="contact_id"
          reference="tasks"
          sort={{ field: "due_date", order: "ASC" }}
          perPage={1000}
        >
          <TasksIterator />
        </ReferenceManyField>
        <AddTask />
      </HatchAsideSection>

      {!isPending && !!deals?.length && (
        <HatchAsideSection title={translate("resources.deals.name", { smart_count: 2 })}>
          <div className="flex flex-col gap-1">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}/show`}
                className="hover:bg-muted/40 rounded-md -mx-2 px-2 py-1.5 block"
              >
                <div className="flex flex-col gap-1">
                  <div className="text-sm truncate" title={deal.name}>
                    {deal.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      style={{
                        backgroundColor: stageColorMap[deal.stage]?.bg,
                        color: stageColorMap[deal.stage]?.text,
                        border: stageColorMap[deal.stage]?.border
                          ? `1px solid ${stageColorMap[deal.stage].border}`
                          : undefined,
                      }}
                    >
                      {findDealLabel(dealStages, deal.stage)}
                    </Badge>
                    {deal.amount > 0 ? (
                      <span>{formatCompactCurrency(deal.amount, currency)}</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </HatchAsideSection>
      )}

      {link !== "edit" && (
        <>
          <div className="mt-4 pt-4 border-t border-border hidden sm:flex flex-col gap-2 items-start">
            <ExportVCardButton />
            <ContactMergeButton />
          </div>
          <div className="mt-4 pt-4 border-t border-border hidden sm:flex flex-col gap-2 items-start">
            <DeleteButton
              className="h-6 cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
              size="sm"
            />
          </div>
        </>
      )}
    </HatchAside>
  );
};
