import {
  ArrowRight,
  Check,
  ExternalLink,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import {
  HatchGhostButton,
  HATCH,
  HATCH_CLASS,
} from "../_primitives";
import type { IntakeLead } from "../types";
import { SnapshotItem, SnapshotTagList } from "./IntakeExpandedRowParts";
import { OutreachStepsTimeline } from "./OutreachStepsTimeline";
import {
  DRAFT_STATUS_LABELS,
  formatShortDate,
  getCadenceStyles,
  intakeExpandedPanelStyle,
  OUTREACH_CADENCE,
} from "./IntakeExpandedRowUtils";

export const IntakeExpandedRow = ({ record }: { record: IntakeLead }) => {
  const currentStep = Math.max(
    0,
    Math.min(OUTREACH_CADENCE.length, record.outreach_sequence_step),
  );
  const snapshotTags = [
    record.city,
    record.source,
    record.current_draft_status === "ai_reviewed" ||
    record.current_draft_status === "approved"
      ? "Ready review"
      : null,
  ].filter((tag): tag is string => Boolean(tag));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(220px, 0.85fr) minmax(360px, 1.4fr) minmax(320px, 1fr)",
        gap: 14,
        padding: "16px 0 18px",
      }}
    >
      <section style={{ ...intakeExpandedPanelStyle, padding: 16 }}>
        <div className={HATCH_CLASS.eyebrowAccent}>Lead snapshot</div>
        <h4
          className="font-heading"
          style={{
            margin: "8px 0 4px",
            color: HATCH.textHi,
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          {record.business_name}
        </h4>
        <p style={{ margin: 0, color: HATCH.textLo, fontSize: 12.5 }}>
          {[record.city, record.region].filter(Boolean).join(", ") ||
            "Location not captured"}
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          <SnapshotItem label="Source" value={record.source || "Unknown"} />
          <SnapshotItem label="Website" value={record.website || "Not captured"} />
          <SnapshotItem
            label="Email"
            value={record.email || "Missing email"}
            tone={record.email ? "normal" : "warning"}
          />
          <SnapshotItem
            label="Phone"
            value={record.phone || "Missing phone"}
            tone={record.phone ? "normal" : "muted"}
          />
          <SnapshotItem
            label="Draft state"
            value={DRAFT_STATUS_LABELS[record.current_draft_status]}
            tone={
              record.current_draft_status === "ai_reviewed" ||
              record.current_draft_status === "approved"
                ? "ready"
                : "normal"
            }
          />
        </div>

        {record.notes ? (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background: "rgba(77,200,232,0.06)",
              color: HATCH.textMd,
              fontSize: 12.5,
              lineHeight: 1.55,
            }}
          >
            {record.notes}
          </div>
        ) : null}

        <SnapshotTagList tags={snapshotTags} />
      </section>

      <section style={{ ...intakeExpandedPanelStyle, padding: 18 }}>
        <OutreachStepsTimeline
          leadId={String(record.id)}
          leadEmail={record.email ?? undefined}
        />
      </section>

      <section style={{ ...intakeExpandedPanelStyle, padding: 16 }}>
        <div className={HATCH_CLASS.eyebrowAccent}>Cadence</div>
        <h4
          className="font-heading"
          style={{
            margin: "8px 0 12px",
            color: HATCH.textHi,
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          Sequence timeline
        </h4>
        <div style={{ display: "grid", gap: 8 }}>
          {OUTREACH_CADENCE.slice(0, 4).map((touch, index) => {
            const touchNumber = index + 1;
            const isCompleted = touchNumber <= currentStep && currentStep > 0;
            const isCurrent =
              record.status === "in-sequence" &&
              touchNumber ===
                Math.min(currentStep + 1, OUTREACH_CADENCE.length);
            const stateLabel = isCompleted
              ? "sent"
              : isCurrent
                ? "next"
                : "pending";
            const styles = getCadenceStyles(isCompleted, isCurrent);

            return (
              <div
                key={touch.day}
                style={{
                  display: "grid",
                  gridTemplateColumns: "34px minmax(0, 1fr) auto",
                  alignItems: "center",
                  gap: 11,
                  minHeight: 64,
                  padding: "10px 12px",
                  borderRadius: 9,
                  border: styles.border,
                  background: styles.background,
                  color: styles.color,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(8,12,26,0.62)",
                    border: styles.border,
                  }}
                >
                  <Mail style={{ width: 16, height: 16 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: HATCH.textHi,
                      fontSize: 12.5,
                      fontWeight: 800,
                    }}
                  >
                    <span>
                      {touch.type} {touchNumber} - {touch.label}
                    </span>
                    {isCompleted ? <Check className="size-3.5" /> : null}
                    {isCurrent ? <ArrowRight className="size-3.5" /> : null}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      color: HATCH.textLo,
                      fontSize: 11.5,
                      fontWeight: 600,
                    }}
                  >
                    {isCurrent
                      ? `Next touch ${formatShortDate(record.next_outreach_date)}`
                      : stateLabel}
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: 999,
                    border: styles.border,
                    color: styles.color,
                    background: "rgba(8,12,26,0.48)",
                    padding: "4px 8px",
                    fontSize: 10.5,
                    fontWeight: 750,
                    textTransform: "capitalize",
                  }}
                >
                  {stateLabel}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            color: HATCH.textLo,
            fontSize: 12,
          }}
        >
          Next touch: {formatShortDate(record.next_outreach_date)}
        </div>
        <HatchGhostButton
          type="button"
          size="sm"
          className="mt-3 w-full border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] text-xs"
          onClick={() => toast.info("Full sequence view is coming soon.")}
        >
          View full sequence
          <ExternalLink className="ml-1.5 size-3.5" />
        </HatchGhostButton>
      </section>
    </div>
  );
};
