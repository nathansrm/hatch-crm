import { InfiniteListBase, useGetIdentity, useListContext } from "ra-core";
import { useMemo, useState } from "react";
import { Link, matchPath, useLocation } from "react-router";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { AlertTriangle, CircleDollarSign, Filter } from "lucide-react";

import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import {
  MOBILE_PANEL,
  MobileAppHeader,
  MobileAvatar,
  MobilePill,
} from "../layout/MobileChrome";
import { InfinitePagination } from "../misc/InfinitePagination";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { OPEN_DEALS_FILTER } from "./dealFilters";
import { getDealDecayLevel } from "./dealUtils";
import { DealShow } from "./DealShow";

const STAGES = ["lead", "qualified", "proposal", "won", "lost"] as const;

const getStageLabel = (stage: string) =>
  stage.charAt(0).toUpperCase() + stage.slice(1).replace(/[-_]/g, " ");

const fmtCompactCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const DealListMobile = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <InfiniteListBase
      perPage={50}
      sort={{ field: "updated_at", order: "DESC" }}
      filter={OPEN_DEALS_FILTER}
      queryOptions={{
        onError: () => {
          /* Disable error notification as DealListLayoutMobile handles it */
        },
      }}
    >
      <DealListLayoutMobile />
    </InfiniteListBase>
  );
};

const DealListLayoutMobile = () => {
  const { isPending, data = [], error } = useListContext<Deal>();
  const [activeStage, setActiveStage] = useState<string>("proposal");
  const location = useLocation();
  const matchShow = matchPath("/deals/:id/show", location.pathname);

  const stageCounts = useMemo(
    () =>
      STAGES.map((stage) => ({
        stage,
        count: data.filter((deal) => deal.stage === stage).length,
      })),
    [data],
  );
  const visibleDeals = data.filter((deal) => deal.stage === activeStage);

  return (
    <div>
      <MobileHeader>
        <MobileAppHeader
          title="Deals"
          subtitle={`${data.length} open pipeline records`}
          actions={<MobileAvatar label="N" />}
        />
      </MobileHeader>
      <MobileContent>
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {stageCounts.map(({ stage, count }) => (
              <MobilePill
                key={stage}
                active={activeStage === stage}
                onClick={() => setActiveStage(stage)}
              >
                {getStageLabel(stage)}{" "}
                <span className="opacity-70">{count}</span>
              </MobilePill>
            ))}
          </div>

          <div className={MOBILE_PANEL}>
            <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5c6784]">
                  {getStageLabel(activeStage)}
                </p>
                <h2 className="text-sm font-bold text-[#eceef5]">
                  {visibleDeals.length} deal
                  {visibleDeals.length === 1 ? "" : "s"}
                </h2>
              </div>
              <Filter className="h-4 w-4 text-[#5c6784]" />
            </div>
            <div className="space-y-2.5 p-3">
              {!isPending && !visibleDeals.length ? (
                <div className="py-6 text-sm text-[#9aa3be]">
                  No deals in this stage.
                </div>
              ) : (
                visibleDeals.map((deal) => (
                  <MobileDealCard key={deal.id} deal={deal} />
                ))
              )}
            </div>
          </div>

          {!error && (
            <div className="flex justify-center">
              <InfinitePagination />
            </div>
          )}
        </div>
      </MobileContent>
      <DealShow open={!!matchShow} id={matchShow?.params.id} />
    </div>
  );
};

const MobileDealCard = ({ deal }: { deal: Deal }) => {
  const { currency } = useConfigurationContext();
  const decay = getDealDecayLevel(deal);
  const decayLabel =
    decay === "none" ? "Live" : decay === "red" ? "High" : "Med";
  const decayClass =
    decay === "red"
      ? "bg-rose-400/10 text-rose-300"
      : decay === "amber"
        ? "bg-amber-300/10 text-amber-200"
        : "bg-emerald-400/10 text-emerald-300";

  return (
    <Link
      to={`/deals/${deal.id}/show`}
      className="block rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 transition-colors active:bg-white/[0.05]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.08] text-xs font-bold text-[#eceef5]">
          {String(deal.name ?? "?")
            .slice(0, 2)
            .toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[#eceef5]">
                {deal.name}
              </h3>
              <p className="mt-1 truncate text-xs text-[#9aa3be]">
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link={false}
                  record={deal}
                >
                  <TextField source="name" />
                </ReferenceField>
              </p>
            </div>
            <span className="text-right text-sm font-bold text-[#eceef5]">
              {fmtCompactCurrency(deal.amount ?? 0, currency)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 text-[11px] font-semibold text-[#9aa3be]">
              <CircleDollarSign className="h-3.5 w-3.5 text-[#4dc8e8]" />
              Next: follow-up
            </span>
            <span
              className={`inline-flex min-h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold ${decayClass}`}
            >
              {decay !== "none" ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : null}
              {decayLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
