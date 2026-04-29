import { useState } from "react";
import type { Identifier } from "ra-core";
import { RecordContextProvider, useListContext } from "ra-core";
import { ChevronDown } from "lucide-react";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";

import { HATCH } from "../_primitives";
import type { IntakeLead } from "../types";
import { IntakeStatusBadge } from "./IntakeStatusBadge";
import { IntakeActionButton, OutreachProgress } from "./IntakeListShared";

export const IntakeMobileList = () => {
  const { data = [] } = useListContext<IntakeLead>();
  const [expandedIds, setExpandedIds] = useState<Identifier[]>([]);

  const toggleExpanded = (id: Identifier) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((expandedId) => expandedId !== id)
        : [...current, id],
    );
  };

  return (
    <div className="intake-mobile-cards">
      {data.map((record) => {
        const expanded = expandedIds.includes(record.id);

        return (
          <RecordContextProvider key={record.id} value={record}>
            <article
              onClick={() => toggleExpanded(record.id)}
              style={{
                display: "grid",
                gap: 14,
                padding: 16,
                background: HATCH.surface,
                border: `1px solid ${HATCH.border}`,
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <h3
                    className="font-heading"
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: HATCH.textHi,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {record.business_name}
                  </h3>
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      color: HATCH.textLo,
                      fontSize: 12,
                    }}
                  >
                    <ReferenceField
                      source="trade_type_id"
                      reference="trade_types"
                      link={false}
                      empty={
                        <span style={{ color: HATCH.textMuted }}>No trade</span>
                      }
                    >
                      <TextField source="name" />
                    </ReferenceField>
                    <span style={{ color: HATCH.textMuted }}>|</span>
                    <span>{record.city || "No city"}</span>
                    {record.source ? (
                      <>
                        <span style={{ color: HATCH.textMuted }}>|</span>
                        <span>{record.source}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <IntakeStatusBadge status={record.status} />
              </div>

              <OutreachProgress record={record} />

              <div
                onClick={(event) => event.stopPropagation()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <IntakeActionButton
                  record={record}
                  onToggleExpanded={toggleExpanded}
                />
                <ChevronDown
                  style={{
                    color: HATCH.textMuted,
                    width: 18,
                    height: 18,
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                  }}
                />
              </div>

              {expanded ? <MobileIntakeDetails record={record} /> : null}
            </article>
          </RecordContextProvider>
        );
      })}
    </div>
  );
};

const MobileIntakeDetails = ({ record }: { record: IntakeLead }) => (
  <div
    style={{
      display: "grid",
      gap: 12,
      paddingTop: 14,
      borderTop: `1px solid ${HATCH.border}`,
    }}
  >
    <MobileDetailBlock
      title="AI Enrichment Summary"
      body={record.enrichment_summary || "No enrichment data yet."}
    />
    <MobileDetailBlock
      title="Outreach Draft"
      body={record.outreach_draft || "No draft generated yet."}
    />
  </div>
);

const MobileDetailBlock = ({
  title,
  body,
}: {
  title: string;
  body: string;
}) => (
  <section
    style={{
      display: "grid",
      gap: 6,
      padding: 12,
      borderRadius: 10,
      background: HATCH.fieldBg,
      border: `1px solid ${HATCH.border}`,
    }}
  >
    <h4
      className="font-heading"
      style={{
        margin: 0,
        fontSize: 13,
        fontWeight: 700,
        color: HATCH.textHi,
      }}
    >
      {title}
    </h4>
    <p
      style={{
        margin: 0,
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        fontSize: 12.5,
        lineHeight: 1.55,
        color: HATCH.textLo,
      }}
    >
      {body}
    </p>
  </section>
);
