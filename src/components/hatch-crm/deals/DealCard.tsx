import {
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRedirect, RecordContextProvider } from "ra-core";
import { ReferenceField } from "@/components/admin/reference-field";
import { NumberField } from "@/components/admin/number-field";
import { SelectField } from "@/components/admin/select-field";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { HATCH } from "../_primitives";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { getBottleneckLabel } from "./bottleneckLabels";
import { getDealDecayLevel, type DecayLevel } from "./dealUtils";
import { stackInfo } from "./stackInfo";
import { stageColorMap } from "./stageColors";

const decayBadgeStyles: Record<
  Exclude<DecayLevel, "none">,
  { color: string; background: string; border: string }
> = {
  amber: {
    color: "rgb(245 184 74)",
    background: "rgba(245,184,74,0.08)",
    border: "rgba(245,184,74,0.24)",
  },
  red: {
    color: HATCH.danger,
    background: HATCH.dangerBg,
    border: HATCH.dangerBorder,
  },
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
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  deal: Deal;
}) => {
  const { dealCategories, currency } = useConfigurationContext();
  const colors = stageColorMap[deal.stage];
  const decay = getDealDecayLevel(deal);
  const staleDays = Math.floor(
    (Date.now() - new Date(deal.updated_at).getTime()) / 86400000,
  );
  const stackSlugs = Array.isArray(deal.software_stack)
    ? deal.software_stack.filter(Boolean)
    : [];
  const visibleStackSlugs = stackSlugs.slice(0, 2);
  const remainingStackCount = stackSlugs.length - visibleStackSlugs.length;
  const hasOwnerSignal =
    deal.dm_present !== undefined && deal.dm_present !== null;
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
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      ref={provided?.innerRef}
      onClick={handleClick}
    >
      <RecordContextProvider value={deal}>
        <div
          style={{
            background: snapshot?.isDragging ? "rgb(22 31 54)" : HATCH.surface,
            border: `1px solid ${HATCH.border}`,
            borderLeft: `3px solid ${colors?.border ?? HATCH.cyan}`,
            borderRadius: 8,
            padding: "12px 14px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="font-heading"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: HATCH.textHi,
                    lineHeight: 1.35,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <ReferenceField
                    source="company_id"
                    reference="companies"
                    link={false}
                  />
                </p>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: HATCH.textMd,
                    lineHeight: 1.35,
                    margin: 0,
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {deal.name}
                </p>
              </div>
              <ReferenceField
                source="company_id"
                reference="companies"
                link={false}
              >
                <CompanyAvatar width={20} height={20} />
              </ReferenceField>
            </div>
            <p
              style={{
                fontSize: 12,
                color: HATCH.textLo,
                margin: 0,
              }}
            >
              <span className="font-mono">
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
              </span>
              {deal.category ? (
                <>
                  <span style={{ color: HATCH.textMuted }}> / </span>
                  <SelectField
                    source="category"
                    choices={dealCategories}
                    optionText="label"
                    optionValue="value"
                  />
                </>
              ) : null}
            </p>
            {decay !== "none" && (
              <span
                style={{
                  alignSelf: "flex-start",
                  marginTop: 4,
                  padding: "2px 7px",
                  borderRadius: 4,
                  border: `1px solid ${decayBadgeStyles[decay].border}`,
                  background: decayBadgeStyles[decay].background,
                  color: decayBadgeStyles[decay].color,
                  fontSize: 10,
                  fontWeight: 750,
                  lineHeight: 1.4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
                title={`${staleDays} days without activity`}
              >
                {staleDays}d stale
              </span>
            )}
            {hasEnrichment && (
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {deal.primary_bottleneck && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 7px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: HATCH.textMuted,
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={deal.primary_bottleneck}
                  >
                    {getBottleneckLabel(deal.primary_bottleneck)}
                  </span>
                )}
                {visibleStackSlugs.map((slug) => (
                  <span
                    key={slug}
                    style={{
                      fontSize: 10,
                      padding: "2px 7px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: HATCH.textMuted,
                      maxWidth: 110,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={stackInfo[slug]?.name ?? slug}
                  >
                    {stackInfo[slug]?.name ?? slug}
                  </span>
                ))}
                {remainingStackCount > 0 && (
                  <span style={{ fontSize: 10, color: HATCH.textMuted }}>
                    +{remainingStackCount} more
                  </span>
                )}
                {hasOwnerSignal && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      color: HATCH.textLo,
                      fontSize: 11,
                    }}
                  >
                    {deal.dm_present ? (
                      <CheckCircle2
                        size={12}
                        style={{ color: "rgb(52 211 153)", flexShrink: 0 }}
                      />
                    ) : (
                      <XCircle
                        size={12}
                        style={{ color: HATCH.textLo, flexShrink: 0 }}
                      />
                    )}
                    {deal.dm_present ? "Owner" : "No Owner"}
                  </span>
                )}
                {hasHoursWasted && (
                  <span style={{ color: HATCH.textLo, fontSize: 11 }}>
                    {deal.hours_wasted_per_week}h/wk
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </RecordContextProvider>
    </div>
  );
};
