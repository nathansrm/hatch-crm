import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IntakeLead } from "../types";

const OUTREACH_CADENCE = [
  { day: 1, label: "Day 1", type: "Email" },
  { day: 3, label: "Day 3", type: "Email" },
  { day: 4, label: "Day 4", type: "LinkedIn" },
  { day: 7, label: "Day 7", type: "Phone" },
  { day: 14, label: "Day 14", type: "Email" },
  { day: 21, label: "Day 21", type: "Phone" },
  { day: 28, label: "Day 28", type: "Email" },
] as const;

export const IntakeExpandedRow = ({ record }: { record: IntakeLead }) => {
  const currentStep = Math.max(
    0,
    Math.min(OUTREACH_CADENCE.length, record.outreach_sequence_step),
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr_1.2fr]">
      <div className="rounded-2xl border bg-card p-4">
        <h4 className="mb-2 font-heading text-base font-extrabold">
          AI Enrichment Summary
        </h4>
        <p className="text-sm leading-6 text-muted-foreground">
          {record.enrichment_summary || "No enrichment data yet."}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h4 className="mb-2 font-heading text-base font-extrabold">
          Outreach Draft
        </h4>
        <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {record.outreach_draft || "No draft generated yet."}
        </p>
        {record.outreach_draft ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => toast.info("Outreach sending is coming soon.")}
            >
              Send Now
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => toast.info("Draft editing is coming soon.")}
            >
              Edit Draft
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h4 className="mb-3 font-heading text-base font-extrabold">
          Cadence Timeline
        </h4>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold">
          {OUTREACH_CADENCE.map((touch, index) => {
            const touchNumber = index + 1;
            const isCompleted = touchNumber < currentStep;
            const isCurrent =
              record.status === "in-sequence" && touchNumber === currentStep;
            const stateLabel = isCompleted
              ? "sent"
              : isCurrent
                ? "next"
                : "pending";

            return (
              <div
                key={touch.day}
                className={cn(
                  "rounded-xl px-2 py-3",
                  isCompleted
                    ? "bg-green-500/12 text-green-700"
                    : isCurrent
                      ? "bg-primary/12 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{touch.label}</span>
                  {isCompleted ? <Check className="size-3.5" /> : null}
                  {isCurrent ? <ArrowRight className="size-3.5" /> : null}
                </div>
                <div className="mt-1 font-medium text-muted-foreground">
                  {touch.type} - {stateLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
