import { Plus, Users } from "lucide-react";
import { useGetIdentity, useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Avatar } from "../contacts/Avatar";
import { SimpleList } from "../simple-list/SimpleList";
import type { Contact } from "../types";

const getEngagementBadge = (status?: string) => {
  if (status === "hot") {
    return {
      className: "rounded-full border-transparent bg-red-100 text-red-700",
      label: "Hot",
    };
  }

  if (status === "warm") {
    return {
      className: "rounded-full border-transparent bg-amber-100 text-amber-700",
      label: "Warm",
    };
  }

  return {
    className: "rounded-full border-transparent bg-slate-100 text-slate-700",
    label: "Cooling",
  };
};

export const HotContacts = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const {
    data: contactData,
    total: contactTotal,
    isPending: contactsLoading,
  } = useGetList<Contact>(
    "contacts",
    {
      pagination: { page: 1, perPage: 10 },
      sort: { field: "last_seen", order: "DESC" },
      filter: { status: "hot", sales_id: identity?.id },
    },
    { enabled: identity?.id != null },
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="mr-3 flex">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("resources.contacts.hot.title")}
        </h2>
        {contactTotal ? (
          <Badge variant="secondary" className="ml-2">
            {contactTotal}
          </Badge>
        ) : null}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground"
                asChild
              >
                <Link to="/contacts/create">
                  <Plus className="h-4 w-4 text-primary" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {translate("resources.contacts.action.create")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Card className="py-0">
        <SimpleList<Contact>
          linkType="show"
          data={contactData}
          total={contactTotal}
          isPending={contactsLoading}
          resource="contacts"
          className="[&>li:first-child>a]:rounded-t-xl [&>li:last-child>a]:rounded-b-xl"
          primaryText={(contact) =>
            `${contact.first_name} ${contact.last_name}`
          }
          secondaryText={(contact) => (
            <span className="flex items-center gap-1.5">
              <span>
                {contact.title && contact.company_name
                  ? translate("resources.contacts.position_at_company", {
                      title: contact.title,
                      company: contact.company_name,
                    })
                  : contact.title || contact.company_name}
              </span>
              {contact.last_seen ? (
                <span className="text-muted-foreground/60">
                  &middot;{" "}
                  {new Date(contact.last_seen).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ) : null}
            </span>
          )}
          rightIcon={(contact) => {
            const badge = getEngagementBadge(contact.status);

            return (
              <Badge
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
              >
                {badge.label}
              </Badge>
            );
          }}
          leftAvatar={(contact) => <Avatar record={contact} />}
          empty={
            <div className="p-4">
              <p className="mb-4 text-sm">
                {translate("resources.contacts.hot.empty_hint")}
              </p>
              <p className="text-sm">
                {translate("resources.contacts.hot.empty_change_status")}
              </p>
            </div>
          }
        />
      </Card>
    </div>
  );
};
