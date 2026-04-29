import type { Identifier } from "ra-core";
import { Eye, FileCheck2, Send } from "lucide-react";

import { HatchGhostButton, HatchPrimaryButton, HATCH } from "../_primitives";
import type { IntakeLead } from "../types";
import { IntakePromoteButton } from "./IntakePromoteButton";

const OUTREACH_STEPS_TOTAL = 7;
const TRACK_BG = "rgba(255,255,255,0.06)";

export const OutreachProgress = ({ record }: { record: IntakeLead }) => {
  const nextDate = formatShortDate(record.next_outreach_date);
  const progressWidth = `${Math.max(
    0,
    Math.min(100, (record.outreach_sequence_step / OUTREACH_STEPS_TOTAL) * 100),
  )}%`;

  if (record.status === "uncontacted") {
    return (
      <div style={{ fontSize: 11.5, color: HATCH.textMuted }}>
        Ready for first touch
      </div>
    );
  }

  if (record.status === "in-sequence") {
    return (
      <div style={{ display: "grid", gap: 6 }}>
        <div
          className="font-mono"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: HATCH.textHi,
          }}
        >
          Touch {record.outreach_sequence_step}/{OUTREACH_STEPS_TOTAL}
        </div>
        <div
          style={{
            height: 4,
            width: 140,
            borderRadius: 999,
            background: TRACK_BG,
          }}
        >
          <div
            style={{
              height: 4,
              borderRadius: 999,
              background: HATCH.cyan,
              width: progressWidth,
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: HATCH.textMuted, marginTop: 2 }}>
          Next: {nextDate}
        </div>
      </div>
    );
  }

  if (record.status === "engaged") {
    return (
      <div style={{ fontSize: 11.5, color: HATCH.textMuted }}>
        Reply received
      </div>
    );
  }

  if (record.status === "not-interested") {
    return (
      <div style={{ fontSize: 11.5, color: HATCH.textMuted }}>Declined</div>
    );
  }

  if (record.status === "unresponsive") {
    return (
      <div style={{ fontSize: 11.5, color: HATCH.textMuted }}>
        Touch {record.outreach_sequence_step}/{OUTREACH_STEPS_TOTAL} &middot;
        Next: {nextDate}
      </div>
    );
  }

  if (record.status === "qualified") {
    return (
      <div style={{ fontSize: 11.5, color: HATCH.textMuted }}>Promoted</div>
    );
  }

  if (record.status === "rejected") {
    return (
      <div style={{ fontSize: 11.5, color: HATCH.textMuted }}>Rejected</div>
    );
  }

  return <div style={{ fontSize: 11.5, color: HATCH.textMuted }}>-</div>;
};

export const IntakeActionButton = ({
  record,
  onToggleExpanded,
}: {
  record: IntakeLead;
  onToggleExpanded: (id: Identifier) => void;
}) => {
  const handleExpand = () => onToggleExpanded(record.id);
  const hasDraft = Boolean(record.outreach_draft || record.outreach_subject);
  const ghostClass =
    "h-8 border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] px-3 text-xs";
  const disabledClass = `${ghostClass} opacity-50`;

  if (record.status === "engaged") {
    return (
      <div data-intake-promote-button>
        <IntakePromoteButton record={record} />
      </div>
    );
  }

  if (record.status === "qualified") {
    return (
      <HatchGhostButton type="button" size="sm" disabled className={disabledClass}>
        Promoted
      </HatchGhostButton>
    );
  }

  if (record.status === "rejected") {
    return (
      <HatchGhostButton type="button" size="sm" disabled className={disabledClass}>
        Rejected
      </HatchGhostButton>
    );
  }

  if (record.status === "not-interested") {
    return (
      <HatchGhostButton
        type="button"
        size="sm"
        onClick={handleExpand}
        className={ghostClass}
      >
        <Eye className="mr-1.5 size-3.5" />
        Review Notes
      </HatchGhostButton>
    );
  }

  if (record.status === "uncontacted") {
    return (
      <HatchPrimaryButton
        type="button"
        size="sm"
        onClick={handleExpand}
        className="h-8 px-3 text-xs"
      >
        {hasDraft ? (
          <FileCheck2 className="mr-1.5 size-3.5" />
        ) : (
          <Send className="mr-1.5 size-3.5" />
        )}
        {hasDraft ? "Review Draft" : "Prep Outreach"}
      </HatchPrimaryButton>
    );
  }

  if (record.status === "in-sequence" || record.status === "unresponsive") {
    return (
      <HatchGhostButton
        type="button"
        size="sm"
        onClick={handleExpand}
        className={ghostClass}
      >
        <Eye className="mr-1.5 size-3.5" />
        View Sequence
      </HatchGhostButton>
    );
  }

  return null;
};

const formatShortDate = (value: string | null) => {
  if (!value) {
    return "TBD";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};
