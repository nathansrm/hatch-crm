import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
  Home,
  Inbox,
  ListTodo,
  MoreHorizontal,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { useTranslate } from "ra-core";
import { Link, matchPath, useLocation, useMatch } from "react-router";
import { ContactCreateSheet } from "../contacts/ContactCreateSheet";
import { DealCreateSheet } from "../deals/DealCreateSheet";
import { useState } from "react";
import { NoteCreateSheet } from "../notes/NoteCreateSheet";
import { TaskCreateSheet } from "../tasks/TaskCreateSheet";

export const MobileNavigation = () => {
  const location = useLocation();
  const translate = useTranslate();

  let currentPath: string | boolean = "/";
  if (matchPath("/", location.pathname)) {
    currentPath = "/";
  } else if (matchPath("/contacts/*", location.pathname)) {
    currentPath = "/contacts";
  } else if (matchPath("/companies/*", location.pathname)) {
    currentPath = "/companies";
  } else if (matchPath("/tasks/*", location.pathname)) {
    currentPath = "/tasks";
  } else if (matchPath("/deals/*", location.pathname)) {
    currentPath = "/deals";
  } else if (matchPath("/intake_leads/*", location.pathname)) {
    currentPath = "/intake_leads";
  } else if (
    matchPath("/reports/*", location.pathname) ||
    matchPath("/delivery/*", location.pathname) ||
    matchPath("/resources/*", location.pathname) ||
    matchPath("/settings/*", location.pathname)
  ) {
    currentPath = "/more";
  } else {
    currentPath = false;
  }

  // Check if the app is running as a PWA (standalone mode)
  const isPwa = window.matchMedia("(display-mode: standalone)").matches;
  // Check if it's iOS on the web
  const isWebiOS = /iPad|iPod|iPhone/.test(window.navigator.userAgent);

  return (
    <nav
      aria-label={translate("crm.navigation.label")}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-[#0A0F1E]/95 shadow-[0_-16px_34px_rgba(0,0,0,0.3)] backdrop-blur-xl"
      style={{
        // iOS bug: even though viewport is set correctly, the bottom safe area inset is not accounted for
        // So we manually add some padding to avoid the navigation being too close to the home bar
        paddingBottom: isPwa && isWebiOS ? 15 : undefined,
        // We use box-sizing: border-box, so the height contains the padding.
        // To actually increase the padding, we need to increase the height as well
        height: isPwa && isWebiOS ? "calc(72px + 15px)" : "72px",
      }}
    >
      <div className="relative mx-auto grid h-full max-w-md grid-cols-5 items-start px-1 pt-1.5">
        <NavigationButton
          href="/"
          Icon={Home}
          label={translate("ra.page.dashboard")}
          isActive={currentPath === "/"}
        />
        <NavigationButton
          href="/contacts"
          Icon={Users}
          label={translate("resources.contacts.name", {
            smart_count: 2,
          })}
          isActive={currentPath === "/contacts"}
        />
        <NavigationButton
          href="/deals"
          Icon={CircleDollarSign}
          label={translate("resources.deals.name", {
            smart_count: 2,
            _: "Deals",
          })}
          isActive={currentPath === "/deals"}
        />
        <NavigationButton
          href="/tasks"
          Icon={ListTodo}
          label={translate("resources.tasks.name", { smart_count: 2 })}
          isActive={currentPath === "/tasks"}
        />
        <MoreButton
          isActive={currentPath === "/more" || currentPath === "/intake_leads"}
        />
      </div>
    </nav>
  );
};

const NavigationButton = ({
  href,
  Icon,
  label,
  isActive,
}: {
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
}) => (
  <Button
    asChild
    variant="ghost"
    className={cn(
      "mx-auto h-auto w-full max-w-[4.25rem] flex-col gap-1 rounded-lg px-1 py-1.5 text-[0.62rem] font-semibold",
      isActive
        ? "text-[#4DC8E8]"
        : "text-[#7f8ba8] hover:bg-white/[0.04] hover:text-[#eceef5]",
    )}
  >
    <Link to={href}>
      <Icon className="size-5" />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  </Button>
);

const MoreButton = ({ isActive }: { isActive: boolean }) => {
  const translate = useTranslate();
  const contact_id = useMatch("/contacts/:id/*")?.params.id;
  const [contactCreateOpen, setContactCreateOpen] = useState(false);
  const [dealCreateOpen, setDealCreateOpen] = useState(false);
  const [noteCreateOpen, setNoteCreateOpen] = useState(false);
  const [taskCreateOpen, setTaskCreateOpen] = useState(false);

  return (
    <>
      <ContactCreateSheet
        open={contactCreateOpen}
        onOpenChange={setContactCreateOpen}
      />
      <DealCreateSheet open={dealCreateOpen} onOpenChange={setDealCreateOpen} />
      <NoteCreateSheet
        open={noteCreateOpen}
        onOpenChange={setNoteCreateOpen}
        contact_id={contact_id}
      />
      <TaskCreateSheet
        open={taskCreateOpen}
        onOpenChange={setTaskCreateOpen}
        contact_id={contact_id}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "mx-auto h-auto w-full max-w-[4.25rem] flex-col gap-1 rounded-lg px-1 py-1.5 text-[0.62rem] font-semibold",
              isActive
                ? "text-[#4DC8E8]"
                : "text-[#7f8ba8] hover:bg-white/[0.04] hover:text-[#eceef5]",
            )}
          >
            <MoreHorizontal className="size-5" />
            <span>More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="min-w-56">
          <DropdownMenuItem
            className="h-12 px-4 text-base font-medium"
            onSelect={() => {
              setDealCreateOpen(true);
            }}
          >
            <Plus className="mr-2 size-4 text-[#4DC8E8]" />
            New Lead
          </DropdownMenuItem>
          <DropdownMenuItem
            className="h-12 px-4 text-base"
            onSelect={() => {
              setContactCreateOpen(true);
            }}
          >
            <Plus className="mr-2 size-4 text-[#4DC8E8]" />
            {translate("resources.contacts.forcedCaseName")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="h-12 px-4 text-base"
            onSelect={() => {
              setNoteCreateOpen(true);
            }}
          >
            <Plus className="mr-2 size-4 text-[#4DC8E8]" />
            {translate("resources.notes.forcedCaseName")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="h-12 px-4 text-base"
            onSelect={() => {
              setTaskCreateOpen(true);
            }}
          >
            <Plus className="mr-2 size-4 text-[#4DC8E8]" />
            {translate("resources.tasks.forcedCaseName")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/intake_leads" className="flex h-11 items-center gap-2">
              <Inbox className="size-4" />
              Intake
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/reports" className="flex h-11 items-center gap-2">
              <BarChart3 className="size-4" />
              Reports
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/delivery" className="flex h-11 items-center gap-2">
              <BriefcaseBusiness className="size-4" />
              Delivery
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/resources" className="flex h-11 items-center gap-2">
              <FileText className="size-4" />
              Resources
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex h-11 items-center gap-2">
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
