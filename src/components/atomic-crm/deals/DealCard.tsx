import type { CSSProperties } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRedirect, RecordContextProvider } from "ra-core";
import { ReferenceField } from "@/components/admin/reference-field";
import { NumberField } from "@/components/admin/number-field";
import { SelectField } from "@/components/admin/select-field";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { getBottleneckLabel } from "./bottleneckLabels";
import { getDealDecayLevel, type DecayLevel } from "./dealUtils";
import { stackInfo } from "./stackInfo";
import { stageColorMap } from "./stageColors";

const decayStyles: Record<DecayLevel, CSSProperties> = {
  none: {},
  amber: { outline: "2px solid rgba(245,184,74,0.5)", outlineOffset: "-2px" },
  red: { outline: "2px solid rgba(239,90,111,0.6)", outlineOffset: "-2px" },
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
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      ref={provided?.innerRef}
      onClick={handleClick}
    >
      <RecordContextProvider value={deal}>
        <div
          style={{
            background: snapshot?.isDragging ? "#161F36" : "#0D1424",
            border: "1px solid rgba(255,255,255,0.07)",
            borderLeft: `3px solid ${colors?.border ?? "#4DC8E8"}`,
            borderRadius: 10,
            padding: "12px 14px",
            cursor: "pointer",
            transition: "all 0.15s",
            ...decayStyles[decay],
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
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
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ECEEF5",
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
                    fontWeight: 400,
                    color: "#9AA3BE",
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
                color: "#9AA3BE",
                fontFamily: '"JetBrains Mono", ui-monospace',
                margin: 0,
              }}
            >
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
                style={{
                  fontSize: 11,
                  color: decay === "red" ? "#EF5A6F" : "#F5B84A",
                  fontWeight: 600,
                  marginTop: 2,
                  marginBottom: 0,
                }}
              >
                {Math.floor(
                  (Date.now() - new Date(deal.updated_at).getTime()) /
                    86400000,
                )}
                d stale
              </p>
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
                      color: "#5C6784",
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
                      color: "#5C6784",
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
                  <span style={{ fontSize: 10, color: "#5C6784" }}>
                    +{remainingStackCount} more
                  </span>
                )}
                {hasOwnerSignal && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#9AA3BE",
                      fontSize: 11,
                    }}
                  >
                    {deal.dm_present ? (
                      <CheckCircle2
                        size={12}
                        style={{ color: "#34D399", flexShrink: 0 }}
                      />
                    ) : (
                      <XCircle
                        size={12}
                        style={{ color: "#9AA3BE", flexShrink: 0 }}
                      />
                    )}
                    {deal.dm_present ? "Owner" : "No Owner"}
                  </span>
                )}
                {hasHoursWasted && (
                  <span style={{ color: "#9AA3BE", fontSize: 11 }}>
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
