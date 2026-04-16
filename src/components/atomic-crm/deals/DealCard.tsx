import { Draggable } from "@hello-pangea/dnd";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRedirect, RecordContextProvider } from "ra-core";
import { ReferenceField } from "@/components/admin/reference-field";
import { NumberField } from "@/components/admin/number-field";
import { SelectField } from "@/components/admin/select-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { getBottleneckLabel } from "./bottleneckLabels";
import { getDealDecayLevel, type DecayLevel } from "./dealUtils";
import { stackInfo } from "./stackInfo";
import { stageColorMap } from "./stageColors";

const decayStyles: Record<DecayLevel, string> = {
  none: "",
  amber: "ring-2 ring-amber-400/60",
  red: "ring-2 ring-red-500/70",
};

export const DealCard = ({ deal, index }: { deal: Deal; index: number }) => {
  if (!deal) return null;

  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(provided, snapshot) => (
        <DealCardContent provided={provided} snapshot={snapshot} deal={deal} />
      )}
    </Draggable>
  );
};

export const DealCardContent = ({
  provided,
  snapshot,
  deal,
}: {
  provided?: any;
  snapshot?: any;
  deal: Deal;
}) => {
  const { dealCategories, currency } = useConfigurationContext();
  const colors = stageColorMap[deal.stage];
  const decay = getDealDecayLevel(deal);
  const stackSlugs = Array.isArray(deal.software_stack)
    ? deal.software_stack.filter(Boolean)
    : [];
  const visibleStackSlugs = stackSlugs.slice(0, 2);
  const remainingStackCount = stackSlugs.length - visibleStackSlugs.length;
  const hasOwnerSignal = deal.dm_present !== undefined && deal.dm_present !== null;
  const hasHoursWasted =
    deal.hours_wasted_per_week !== undefined &&
    deal.hours_wasted_per_week !== null;
  const hasEnrichment =
    !!deal.primary_bottleneck ||
    stackSlugs.length > 0 ||
    hasOwnerSignal ||
    hasHoursWasted;
  const redirect = useRedirect();
  const handleClick = () => {
    redirect(`/deals/${deal.id}/show`, undefined, undefined, undefined, {
      _scrollToTop: false,
    });
  };

  return (
    <div
      className="cursor-pointer"
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      ref={provided?.innerRef}
      onClick={handleClick}
    >
      <RecordContextProvider value={deal}>
        <Card
          className={`py-3 transition-all duration-200 ${
            snapshot?.isDragging
              ? "opacity-90 transform rotate-1 shadow-lg"
              : "shadow-sm hover:shadow-md"
          } ${decayStyles[decay]}`}
          style={{ borderLeft: `3px solid ${colors?.border ?? "#E5E5E3"}` }}
        >
          <CardContent className="px-3 flex flex-col">
            <div className="flex-1 flex">
              <p className="flex-1 text-sm font-medium mb-2">
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link={false}
                />
                {" - "}
                {deal.name}
              </p>
              <ReferenceField
                source="company_id"
                reference="companies"
                link={false}
              >
                <CompanyAvatar width={20} height={20} />
              </ReferenceField>
            </div>
            <p className="text-xs text-muted-foreground">
              <NumberField
                source="amount"
                options={{
                  notation: "compact",
                  style: "currency",
                  currency,
                  currencyDisplay: "narrowSymbol",
                  minimumSignificantDigits: 3,
                }}
              />
              {deal.category && ", "}
              <SelectField
                source="category"
                choices={dealCategories}
                optionText="label"
                optionValue="value"
              />
            </p>
            {decay !== "none" && (
              <p
                className={`text-[11px] mt-1 font-medium ${
                  decay === "red" ? "text-red-600" : "text-amber-600"
                }`}
              >
                {Math.floor(
                  (Date.now() - new Date(deal.updated_at).getTime()) /
                    86400000,
                )}
                d stale
              </p>
            )}
            {hasEnrichment && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {deal.primary_bottleneck && (
                  <Badge
                    variant="outline"
                    className="max-w-[120px] truncate px-1.5 py-0 text-[10px]"
                    title={deal.primary_bottleneck}
                  >
                    {getBottleneckLabel(deal.primary_bottleneck)}
                  </Badge>
                )}
                {visibleStackSlugs.map((slug) => (
                  <Badge
                    key={slug}
                    variant="outline"
                    className="max-w-[110px] truncate px-1.5 py-0 text-[10px]"
                    title={stackInfo[slug]?.name ?? slug}
                  >
                    {stackInfo[slug]?.name ?? slug}
                  </Badge>
                ))}
                {remainingStackCount > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{remainingStackCount} more
                  </span>
                )}
                {hasOwnerSignal && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    {deal.dm_present ? (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    ) : (
                      <XCircle size={12} className="text-muted-foreground" />
                    )}
                    {deal.dm_present ? "Owner" : "No Owner"}
                  </span>
                )}
                {hasHoursWasted && (
                  <span className="text-[11px] text-muted-foreground">
                    {deal.hours_wasted_per_week}h/wk
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </RecordContextProvider>
    </div>
  );
};
