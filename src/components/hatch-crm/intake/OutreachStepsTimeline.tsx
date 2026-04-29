import { useGetList } from "ra-core";

import { HATCH, HATCH_CLASS } from "../_primitives";
import type { OutreachStep } from "../types";
import { OutreachStepCard } from "./OutreachStepCard";

interface OutreachStepsTimelineProps {
  leadId: string;
  leadEmail?: string;
}

export const OutreachStepsTimeline = ({
  leadId,
  leadEmail,
}: OutreachStepsTimelineProps) => {
  const {
    data: steps = [],
    isLoading,
    refetch,
  } = useGetList<OutreachStep>("outreach_steps", {
    filter: { intake_lead_id: leadId },
    sort: { field: "sequence_step", order: "ASC" },
    pagination: { page: 1, perPage: 10 },
  });

  return (
    <div>
      <div className={HATCH_CLASS.eyebrowAccent}>Outreach drafts</div>

      {isLoading && steps.length === 0 ? (
        <p
          style={{
            margin: "12px 0 0",
            color: HATCH.textMuted,
            fontSize: 13,
          }}
        >
          Loading drafts...
        </p>
      ) : null}

      {!isLoading && steps.length === 0 ? (
        <p
          style={{
            margin: "12px 0 0",
            color: HATCH.textLo,
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          No drafts yet — the daily routine will create one.
        </p>
      ) : null}

      {steps.length > 0 ? (
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {steps.map((step) => (
            <OutreachStepCard
              key={step.id}
              step={step}
              leadEmail={leadEmail}
              onChange={() => {
                void refetch();
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
