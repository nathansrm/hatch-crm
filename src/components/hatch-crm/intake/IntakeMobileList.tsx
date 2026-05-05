import { useState } from "react";
import type { Identifier } from "ra-core";
import { RecordContextProvider, useListContext } from "ra-core";
import { ChevronDown, Mail, Phone } from "lucide-react";
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
              className="grid cursor-pointer gap-3 rounded-xl border border-white/[0.07] bg-[linear-gradient(180deg,#0D1424_0%,#080C1A_100%)] p-3.5 shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
            >
              <div className="grid gap-3">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading break-words text-[15px] font-bold leading-snug text-[#ECEEF5]">
                      {record.business_name}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-medium text-[#9AA3BE]">
                      <ReferenceField
                        source="trade_type_id"
                        reference="trade_types"
                        link={false}
                        empty={<span className="text-[#5C6784]">No trade</span>}
                      >
                        <TextField source="name" />
                      </ReferenceField>
                      <span className="text-[#5C6784]">/</span>
                      <span>{record.city || "No city"}</span>
                      {record.source ? (
                        <>
                          <span className="text-[#5C6784]">/</span>
                          <span>{record.source}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <IntakeStatusBadge status={record.status} />
                </div>

                <OutreachProgress record={record} />

                <div className="grid grid-cols-2 gap-2">
                  {record.phone ? (
                    <a
                      href={`tel:${record.phone}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-[11px] font-semibold text-[#B8C0D6]"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#4DC8E8]" />
                      <span className="truncate">{record.phone}</span>
                    </a>
                  ) : null}
                  {record.email ? (
                    <a
                      href={`mailto:${record.email}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-[11px] font-semibold text-[#B8C0D6]"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#4DC8E8]" />
                      <span className="truncate">Email</span>
                    </a>
                  ) : null}
                </div>
              </div>

              <div
                onClick={(event) => event.stopPropagation()}
                className="grid grid-cols-[minmax(0,1fr)_44px] gap-2"
              >
                <IntakeActionButton
                  record={record}
                  onToggleExpanded={toggleExpanded}
                />
                <button
                  type="button"
                  aria-label={
                    expanded ? "Collapse intake lead" : "Expand intake lead"
                  }
                  onClick={() => toggleExpanded(record.id)}
                  className="grid min-h-11 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03]"
                >
                  <ChevronDown
                    style={{
                      color: HATCH.textMuted,
                      width: 18,
                      height: 18,
                      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s",
                    }}
                  />
                </button>
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
