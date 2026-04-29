import { Droppable } from "@hello-pangea/dnd";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { findDealLabel } from "./dealUtils";
import { DealCard } from "./DealCard";
import { stageColorMap } from "./stageColors";

export const DealColumn = ({
  stage,
  deals,
}: {
  stage: string;
  deals: Deal[];
}) => {
  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const { dealStages, currency } = useConfigurationContext();
  const colors = stageColorMap[stage] ?? {
    border: "#4DC8E8",
    bg: "rgba(77,200,232,0.08)",
    text: "#4DC8E8",
  };

  return (
    <div style={{ flex: 1, paddingBottom: 32 }}>
      <div
        style={{
          background: "var(--ink-3)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ marginBottom: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: colors.border,
                  boxShadow: `0 0 8px ${colors.border}`,
                }}
              />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "var(--fg-1)",
                  letterSpacing: "0.02em",
                }}
              >
                {findDealLabel(dealStages, stage)}
              </span>
            </div>
            <span
              className="font-mono"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.border,
              }}
            >
              {deals.length}
            </span>
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: "var(--fg-3)",
            }}
          >
            {totalAmount.toLocaleString("en-US", {
              notation: "compact",
              style: "currency",
              currency,
              currencyDisplay: "narrowSymbol",
              minimumSignificantDigits: 3,
            })}
          </div>
          <div
            style={{
              height: 2,
              background: `linear-gradient(90deg, ${colors.border} 0%, ${colors.border}33 100%)`,
              borderRadius: 2,
              marginTop: 8,
            }}
          />
        </div>
      </div>
      <Droppable droppableId={stage}>
        {(droppableProvided, snapshot) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 10,
              background: snapshot.isDraggingOver
                ? "rgba(255,255,255,0.02)"
                : "transparent",
            }}
          >
            {deals.length === 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 80,
                  color: "var(--fg-4)",
                  fontSize: 12,
                  border: `1px dashed ${colors.border}22`,
                  borderRadius: 8,
                }}
              >
                Drop here
              </div>
            )}
            {deals.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} />
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
