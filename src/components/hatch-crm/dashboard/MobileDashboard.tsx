/* eslint-disable max-lines */
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Mail,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useGetIdentity, useGetList, useTimeout } from "ra-core";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { OPEN_DEALS_LIST_PARAMS } from "../deals/dealFilters";
import { getDealDecayLevel } from "../deals/dealUtils";
import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import {
  MOBILE_PANEL,
  MOBILE_PANEL_SOFT,
  MobileAppHeader,
  MobileAvatar,
  MobilePill,
  MobileSection,
  MobileSegmentedControl,
  MobileStatGrid,
  MobileStatTile,
} from "../layout/MobileChrome";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact, ContactNote, Deal, IntakeLead, Task } from "../types";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { TasksList } from "./TasksList";
import { ActiveProjectsGrid } from "./widgets/ActiveProjectsGrid";
import { DeliveryKPIs } from "./widgets/DeliveryKPIs";
import { HandoffQueue } from "./widgets/HandoffQueue";

type MobileView = "sales" | "delivery";
type ActionQueueItem = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
  meta: string;
  tone: "cyan" | "amber" | "red" | "green";
};

const TERMINAL_WON_STAGE = "won";
const TERMINAL_LOST_STAGE = "lost";
const STAGE_ORDER = ["lead", "qualified", "proposal", "won", "lost"] as const;

const getTodayDateKey = () => {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const getDateKey = (value?: string | null) => value?.slice(0, 10) ?? null;

const fmtCompactCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <MobileHeader>
        <MobileAppHeader actions={<MobileAvatar label="N" />} />
      </MobileHeader>
      <MobileContent>{children}</MobileContent>
    </>
  );
};

const MobileQuickLink = ({
  children,
  to,
}: {
  children: React.ReactNode;
  to: string;
}) => (
  <Link
    to={to}
    className="inline-flex min-h-8 shrink-0 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-bold text-[#9aa3be]"
  >
    {children}
  </Link>
);

const Loading = () => (
  <Wrapper>
    <div className="space-y-3">
      <Skeleton className="h-10 rounded-xl bg-white/[0.06]" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl bg-white/[0.06]" />
        ))}
      </div>
      <Skeleton className="h-56 rounded-xl bg-white/[0.06]" />
    </div>
  </Wrapper>
);

const getStageLabel = (stage: string) =>
  stage.charAt(0).toUpperCase() + stage.slice(1).replace(/[-_]/g, " ");

const ActionRow = ({
  icon,
  title,
  subtitle,
  href,
  meta,
  tone = "cyan",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
  meta: string;
  tone?: "cyan" | "amber" | "red" | "green";
}) => {
  const toneClass = {
    cyan: "text-[#4dc8e8] bg-[#4dc8e8]/10 border-[#4dc8e8]/25",
    amber: "text-amber-300 bg-amber-300/10 border-amber-300/25",
    red: "text-rose-400 bg-rose-400/10 border-rose-400/25",
    green: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  }[tone];

  return (
    <Link
      to={href}
      className="flex min-h-[52px] items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2.5"
    >
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg border",
          toneClass,
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-[#eceef5]">
          {title}
        </span>
        <span className="block truncate text-xs text-[#9aa3be]">
          {subtitle}
        </span>
      </span>
      <span className="shrink-0 text-xs font-bold text-[#4dc8e8]">{meta}</span>
    </Link>
  );
};

const PipelineFunnel = ({
  deals,
  currency,
}: {
  deals: Deal[];
  currency: string;
}) => {
  const stageStats = STAGE_ORDER.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
    };
  });
  const maxValue = Math.max(...stageStats.map((stat) => stat.value), 1);
  const colors = {
    lead: "#4DC8E8",
    qualified: "#4dc8e8",
    proposal: "#f5b84a",
    won: "#34d399",
    lost: "#ef5a6f",
  } as const;

  return (
    <MobileSection
      title="Pipeline funnel"
      eyebrow={`${deals.length} open records`}
      action={
        <Link to="/deals" className="text-xs font-bold text-[#4dc8e8]">
          View all
        </Link>
      }
    >
      <div className="space-y-2.5">
        {stageStats.map((stat) => (
          <Link
            key={stat.stage}
            to="/deals"
            className="grid grid-cols-[74px_minmax(0,1fr)_64px] items-center gap-2"
          >
            <span className="truncate text-xs font-bold text-[#b8c0d6]">
              {getStageLabel(stat.stage)}
            </span>
            <span className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.max((stat.value / maxValue) * 100, stat.count ? 10 : 3)}%`,
                  backgroundColor: colors[stat.stage],
                }}
              />
            </span>
            <span className="text-right text-xs font-bold text-[#eceef5]">
              {fmtCompactCurrency(stat.value, currency)}
            </span>
          </Link>
        ))}
      </div>
    </MobileSection>
  );
};

const TopOpportunities = ({
  deals,
  currency,
}: {
  deals: Deal[];
  currency: string;
}) => {
  const topDeals = [...deals]
    .filter(
      (deal) => ![TERMINAL_WON_STAGE, TERMINAL_LOST_STAGE].includes(deal.stage),
    )
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
    .slice(0, 5);

  return (
    <MobileSection title="Top opportunities" eyebrow="Pipeline">
      <div className="space-y-2.5">
        {topDeals.length ? (
          topDeals.map((deal) => {
            const decay = getDealDecayLevel(deal);
            return (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}/show`}
                className="flex min-h-[64px] items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2.5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-xs font-bold text-[#eceef5]">
                  {String(deal.name ?? "?")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-[#eceef5]">
                    {deal.name}
                  </span>
                  <span className="block truncate text-xs text-[#9aa3be]">
                    {getStageLabel(deal.stage)} · Next: follow-up
                  </span>
                </span>
                <span className="grid justify-items-end gap-1">
                  <span className="text-xs font-bold text-[#eceef5]">
                    {fmtCompactCurrency(deal.amount ?? 0, currency)}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      decay === "red"
                        ? "bg-rose-400/10 text-rose-300"
                        : decay === "amber"
                          ? "bg-amber-300/10 text-amber-200"
                          : "bg-emerald-400/10 text-emerald-300",
                    )}
                  >
                    {decay === "none" ? "Live" : "Watch"}
                  </span>
                </span>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-[#9aa3be]">No open opportunities yet.</p>
        )}
      </div>
    </MobileSection>
  );
};

const DashboardView = () => {
  const { currency } = useConfigurationContext();
  const { identity } = useGetIdentity();
  const todayKey = getTodayDateKey();

  const { data: deals = [] } = useGetList<Deal>(
    "deals",
    OPEN_DEALS_LIST_PARAMS,
  );
  const { data: tasks = [] } = useGetList<Task>(
    "tasks",
    {
      pagination: { page: 1, perPage: 500 },
      sort: { field: "due_date", order: "ASC" },
      filter: { "done_date@is": null, sales_id: identity?.id },
    },
    { enabled: identity?.id != null },
  );
  const { data: intake = [] } = useGetList<IntakeLead>("intake_leads", {
    pagination: { page: 1, perPage: 200 },
    sort: { field: "created_at", order: "DESC" },
  });

  const wonDeals = deals.filter((deal) => deal.stage === TERMINAL_WON_STAGE);
  const activeDeals = deals.filter(
    (deal) => ![TERMINAL_WON_STAGE, TERMINAL_LOST_STAGE].includes(deal.stage),
  );
  const pipelineValue = activeDeals.reduce(
    (sum, deal) => sum + (deal.amount ?? 0),
    0,
  );
  const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.amount ?? 0), 0);
  const staleDeals = activeDeals.filter(
    (deal) => getDealDecayLevel(deal) !== "none",
  );
  const overdueTasks = tasks.filter((task) => {
    const dueDateKey = getDateKey(task.due_date);
    return dueDateKey != null && dueDateKey < todayKey;
  });
  const todayTasks = tasks.filter(
    (task) => getDateKey(task.due_date) === todayKey,
  );
  const draftReady = intake.filter(
    (lead) => lead.current_draft_status === "ai_reviewed",
  );
  const newIntake = intake.filter(
    (lead) => lead.status === "uncontacted" || lead.status === "in-sequence",
  );

  const actions: ActionQueueItem[] = [];
  if (overdueTasks.length) {
    actions.push({
      icon: <Clock className="h-4 w-4" />,
      title: "Clear overdue tasks",
      subtitle: `${overdueTasks.length} task${overdueTasks.length === 1 ? "" : "s"} need attention`,
      href: "/tasks",
      meta: "Now",
      tone: "red",
    });
  }
  if (draftReady.length) {
    actions.push({
      icon: <Mail className="h-4 w-4" />,
      title: "Approve Gmail follow-ups",
      subtitle: `${draftReady.length} intake draft${draftReady.length === 1 ? "" : "s"} ready`,
      href: "/intake_leads",
      meta: "15m",
      tone: "amber",
    });
  }
  if (staleDeals.length) {
    actions.push({
      icon: <Flame className="h-4 w-4" />,
      title: "Revive stale deals",
      subtitle: `${staleDeals.length} opportunity${staleDeals.length === 1 ? "" : "ies"} going cold`,
      href: "/deals",
      meta: "1h",
      tone: "amber",
    });
  }
  if (newIntake.length) {
    actions.push({
      icon: <Users className="h-4 w-4" />,
      title: "Review new intake",
      subtitle: `${newIntake.length} lead${newIntake.length === 1 ? "" : "s"} in queue`,
      href: "/intake_leads",
      meta: "Today",
      tone: "cyan",
    });
  }

  return (
    <div className="space-y-3">
      <MobileStatGrid>
        <MobileStatTile
          label="Pipeline"
          value={fmtCompactCurrency(pipelineValue, currency)}
          delta={`${activeDeals.length} active`}
          icon={<Target className="h-3.5 w-3.5" />}
          tone="cyan"
        />
        <MobileStatTile
          label="Won"
          value={fmtCompactCurrency(wonValue, currency)}
          delta={`${wonDeals.length} deals`}
          icon={<Trophy className="h-3.5 w-3.5" />}
          tone="green"
        />
        <MobileStatTile
          label="Hot Leads"
          value={newIntake.length}
          delta="intake"
          icon={<Flame className="h-3.5 w-3.5" />}
          tone="red"
        />
        <MobileStatTile
          label="Overdue"
          value={overdueTasks.length}
          delta="tasks"
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          tone={overdueTasks.length ? "red" : "green"}
        />
        <MobileStatTile
          label="Gmail Due"
          value={draftReady.length}
          delta="drafts"
          icon={<Mail className="h-3.5 w-3.5" />}
          tone="amber"
        />
        <MobileStatTile
          label="Today"
          value={todayTasks.length}
          delta="follow-ups"
          icon={<Calendar className="h-3.5 w-3.5" />}
          tone="blue"
        />
      </MobileStatGrid>

      <MobileSection
        title="Action queue"
        eyebrow={`${actions.length} priorities`}
        action={
          <Link to="/tasks" className="text-xs font-bold text-[#4dc8e8]">
            View all
          </Link>
        }
      >
        <div className="space-y-2">
          {actions.length ? (
            actions.map((action) => (
              <ActionRow key={action.title} {...action} />
            ))
          ) : (
            <div
              className={cn(MOBILE_PANEL_SOFT, "flex items-center gap-3 p-3")}
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <p className="text-sm font-semibold text-[#b8c0d6]">
                No urgent queue items.
              </p>
            </div>
          )}
        </div>
      </MobileSection>

      <PipelineFunnel deals={deals} currency={currency} />
      <TopOpportunities deals={deals} currency={currency} />
      <TasksList variant="sales" />
      <DashboardActivityLog />
    </div>
  );
};

const DeliveryView = () => (
  <div className="space-y-3">
    <div className={cn(MOBILE_PANEL, "p-3.5")}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5c6784]">
        Delivery
      </p>
      <h1 className="mt-1 text-lg font-bold text-[#eceef5]">
        Reports and handoffs
      </h1>
      <p className="mt-1 text-xs leading-5 text-[#9aa3be]">
        Project load, handoff queue, pipeline health, and client delivery
        signals.
      </p>
    </div>
    <DeliveryKPIs />
    <HandoffQueue />
    <ActiveProjectsGrid />
  </div>
);

export const MobileDashboard = () => {
  const [activeView, setActiveView] = useState<MobileView>("sales");
  const {
    data: dataContact,
    total: totalContact,
    isPending: isPendingContact,
  } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 1 },
  });
  const { total: totalContactNotes, isPending: isPendingContactNotes } =
    useGetList<ContactNote>("contact_notes", {
      pagination: { page: 1, perPage: 1 },
    });
  const oneSecondHasPassed = useTimeout(1000);

  const isPending = isPendingContact || isPendingContactNotes;

  if (isPending) {
    return oneSecondHasPassed ? <Loading /> : null;
  }

  if (!totalContact) {
    return (
      <Wrapper>
        <DashboardStepper step={1} />
      </Wrapper>
    );
  }

  if (!totalContactNotes) {
    return (
      <Wrapper>
        <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="space-y-3">
        <MobileSegmentedControl
          value={activeView}
          onChange={(value) => setActiveView(value as MobileView)}
          options={[
            { value: "sales", label: "Sales" },
            { value: "delivery", label: "Delivery" },
          ]}
        />
        <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <MobilePill
            active={activeView === "sales"}
            onClick={() => setActiveView("sales")}
          >
            Today
          </MobilePill>
          <MobilePill onClick={() => setActiveView("delivery")}>
            Delivery
          </MobilePill>
          <MobileQuickLink to="/intake_leads">Gmail</MobileQuickLink>
          <MobileQuickLink to="/deals">Pipeline</MobileQuickLink>
        </div>
        {activeView === "sales" ? <DashboardView /> : <DeliveryView />}
      </div>
    </Wrapper>
  );
};
