import { HATCH } from "../_primitives";
import type { IntakeLead, OutreachStep } from "../types";

export const OUTREACH_CADENCE = [
  { day: 1, label: "Day 1", type: "Email" },
  { day: 3, label: "Day 3", type: "Email" },
  { day: 4, label: "Day 4", type: "Email" },
  { day: 7, label: "Day 7", type: "Email" },
  { day: 14, label: "Day 14", type: "Email" },
  { day: 21, label: "Day 21", type: "Email" },
  { day: 28, label: "Day 28", type: "Email" },
] as const;

export const DRAFT_STATUS_LABELS: Record<
  IntakeLead["current_draft_status"],
  string
> = {
  none: "No draft",
  drafting: "Drafting",
  ai_reviewed: "Ready for review",
  approved: "Approved",
  sent: "Sent",
};

export const STEP_STATUS_LABELS: Record<OutreachStep["status"], string> = {
  drafting: "Drafting",
  ai_reviewed: "Ready for review",
  action_needed: "Needs edits",
  approved: "Approved",
  sent: "Sent",
  completed: "Completed",
  failed: "Failed",
  replied: "Replied",
};

export const intakeExpandedPanelStyle = {
  border: `1px solid ${HATCH.border}`,
  background: "rgba(255,255,255,0.025)",
  borderRadius: 10,
} as const;

export const getCadenceStyles = (
  isCompleted: boolean,
  isCurrent: boolean,
) => {
  if (isCompleted) {
    return {
      background: "rgba(52,211,153,0.08)",
      border: "1px solid rgba(52,211,153,0.22)",
      color: "#34D399",
    };
  }

  if (isCurrent) {
    return {
      background: "rgba(77,200,232,0.1)",
      border: "1px solid rgba(77,200,232,0.28)",
      color: HATCH.cyan,
    };
  }

  return {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: HATCH.textLo,
  };
};

export const formatShortDate = (value: string | null) => {
  if (!value) {
    return "TBD";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const capitalize = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
