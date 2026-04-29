import { useState } from "react";
import { Check, MailCheck, Pencil, Send } from "lucide-react";
import { useDataProvider } from "ra-core";
import { toast } from "sonner";

import {
  HatchGhostButton,
  HatchPrimaryButton,
  HatchTextInput,
  HatchTextareaInput,
  HATCH,
} from "../_primitives";
import { getSupabaseClient } from "../providers/supabase/supabase";
import type { OutreachStep } from "../types";

interface OutreachStepCardProps {
  step: OutreachStep;
  leadEmail?: string;
  onChange: () => void;
}

const BODY_PREVIEW_LENGTH = 120;

const capitalize = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

const formatDateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Unknown send time";

export const OutreachStepCard = ({
  step,
  leadEmail,
  onChange,
}: OutreachStepCardProps) => {
  const dataProvider = useDataProvider();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(step.subject ?? "");
  const [editedBody, setEditedBody] = useState(step.body ?? "");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const hasEmail = Boolean(leadEmail?.trim());
  const body = step.body ?? "";
  const bodyIsLong = body.length > BODY_PREVIEW_LENGTH;
  const visibleBody =
    bodyIsLong && !isExpanded
      ? `${body.slice(0, BODY_PREVIEW_LENGTH)}...`
      : body;
  const isReadOnly = [
    "drafting",
    "sent",
    "failed",
    "completed",
    "replied",
  ].includes(step.status);
  const canEdit = step.status === "ai_reviewed" || step.status === "action_needed";
  const canApprove =
    step.status === "ai_reviewed" || step.status === "action_needed";
  const canSend = step.status === "ai_reviewed" || step.status === "approved";

  const handleEdit = () => {
    setEditedSubject(step.subject ?? "");
    setEditedBody(step.body ?? "");
    setIsEditing(true);
  };

  const handleApprove = async () => {
    setIsMutating(true);
    try {
      await dataProvider.update("outreach_steps", {
        id: step.id,
        data: { status: "approved" },
        previousData: step,
      });
      onChange();
      toast.success("Draft approved");
    } finally {
      setIsMutating(false);
    }
  };

  const handleSend = async () => {
    setIsMutating(true);
    try {
      const { error } = await getSupabaseClient().functions.invoke(
        "send-outreach",
        {
          body: { outreach_step_id: step.id },
        },
      );
      if (error) {
        toast.error(`Send failed: ${error.message}`);
        return;
      }
      onChange();
      toast.success("Email sent");
    } finally {
      setIsMutating(false);
    }
  };

  const handleSave = async () => {
    setIsMutating(true);
    try {
      await dataProvider.update("outreach_steps", {
        id: step.id,
        data: {
          subject: editedSubject,
          body: editedBody,
          status: "action_needed",
          review_status: "pending",
          review_feedback: null,
        },
        previousData: step,
      });
      setIsEditing(false);
      onChange();
      toast.success("Draft saved");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <article
      style={{
        border: `1px solid ${HATCH.fieldBorder}`,
        borderRadius: 10,
        background: HATCH.fieldBg,
        padding: 14,
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
          <div
            style={{
              color: HATCH.textMuted,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Step {step.sequence_step} · {step.channel}
          </div>
          <h4
            className="font-heading"
            style={{
              margin: "7px 0 0",
              color: HATCH.textHi,
              fontSize: 15,
              fontWeight: 800,
              overflowWrap: "anywhere",
            }}
          >
            {step.subject || "No subject"}
          </h4>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            borderRadius: 999,
            border: `1px solid ${HATCH.borderStrong}`,
            background: HATCH.hover,
            color: HATCH.textMd,
            padding: "4px 8px",
            fontSize: 11,
            fontWeight: 750,
          }}
        >
          {capitalize(step.status)}
        </span>
      </div>

      {isEditing ? (
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <HatchTextInput
            value={editedSubject}
            onChange={(event) => setEditedSubject(event.target.value)}
            placeholder="Subject"
            className="px-3 py-2 text-sm"
          />
          <HatchTextareaInput
            value={editedBody}
            onChange={(event) => setEditedBody(event.target.value)}
            placeholder="Body"
            className="min-h-40 px-3 py-2 text-sm"
          />
        </div>
      ) : (
        <div
          style={{
            marginTop: 12,
            color: body ? HATCH.textMd : HATCH.textMuted,
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {visibleBody || "No body drafted yet."}
          {bodyIsLong ? (
            <button
              type="button"
              onClick={() => setIsExpanded((value) => !value)}
              style={{
                display: "inline",
                marginLeft: 6,
                color: HATCH.cyan,
                fontSize: 12,
                fontWeight: 750,
              }}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          ) : null}
        </div>
      )}

      {step.review_feedback ? (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${HATCH.dangerBorder}`,
            background: HATCH.dangerBg,
            color: HATCH.textMd,
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          {step.review_feedback}
        </div>
      ) : null}

      {step.status === "sent" ? (
        <div
          style={{
            marginTop: 12,
            color: HATCH.textLo,
            fontSize: 12,
            lineHeight: 1.55,
          }}
        >
          Sent {formatDateTime(step.sent_at)}
          {step.provider_message_id ? ` - ${step.provider_message_id}` : ""}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginTop: 14,
        }}
      >
        <div style={{ color: HATCH.textMuted, fontSize: 12 }}>
          {step.status === "drafting" ? "Drafting…" : null}
          {isReadOnly && step.status !== "drafting"
            ? `${capitalize(step.status)} draft`
            : null}
          {canSend && !hasEmail ? "No email on file" : null}
        </div>

        {isEditing ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <HatchGhostButton
              type="button"
              size="sm"
              disabled={isMutating}
              className="border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)]"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </HatchGhostButton>
            <HatchPrimaryButton
              type="button"
              size="sm"
              disabled={isMutating}
              onClick={handleSave}
            >
              <Check className="mr-1.5 size-3.5" />
              Save
            </HatchPrimaryButton>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {canEdit ? (
              <HatchGhostButton
                type="button"
                size="sm"
                disabled={isMutating}
                className="border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)]"
                onClick={handleEdit}
              >
                <Pencil className="mr-1.5 size-3.5" />
                Edit
              </HatchGhostButton>
            ) : null}
            {canApprove ? (
              <HatchPrimaryButton
                type="button"
                size="sm"
                disabled={isMutating}
                onClick={handleApprove}
              >
                <MailCheck className="mr-1.5 size-3.5" />
                Approve
              </HatchPrimaryButton>
            ) : null}
            {canSend && hasEmail ? (
              <HatchPrimaryButton
                type="button"
                size="sm"
                disabled={isMutating}
                onClick={handleSend}
              >
                <Send className="mr-1.5 size-3.5" />
                Send
              </HatchPrimaryButton>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
};
