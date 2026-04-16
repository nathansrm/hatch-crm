# Task Brief: Deal Kanban Card Enrichment

**ID:** BRIEF-002
**Date:** 2026-04-16
**Project:** Hatch CRM
**Size:** M
**Depends on:** none

## Goal

Surface the five agency predictive signals on `DealCard` so the kanban shows real decision context at a glance — and add the Supabase migration that makes those fields persistent.

## Environment

**Branch:** `feat/deal-card-enrichment` (create from `main`)
**Setup:** `npm install` (already done), `npm run dev:demo` to validate in demo mode
**Test command:** `npm run test:unit:app`
**When done:** Push to origin and open a PR against `main`

## Scope

### In Scope
- [ ] `supabase/migrations/{timestamp}_add_deal_predictive_fields.sql` — new migration adding the 5 predictive columns to the `deals` table
- [ ] `src/components/atomic-crm/deals/stackInfo.ts` — new lookup map for software tool metadata (shared with BRIEF-003)
- [ ] `src/components/atomic-crm/deals/bottleneckLabels.ts` — new short-label map for bottleneck display
- [ ] `src/components/atomic-crm/deals/DealCard.tsx` — add 5 signal slots to `DealCardContent`
- [ ] `src/components/atomic-crm/deals/index.ts` — export new files
- [ ] `demo/` — extend the deal generator to populate the 5 new fields with realistic values so demo mode renders them

### Out of Scope
- [ ] DealShow page (covered by BRIEF-003)
- [ ] DealInputs / DealEdit form fields (not needed — fields are set externally by lead gen or manually via Edit; keep scope tight)
- [ ] Dashboard changes (BRIEF-004)
- [ ] Any file in `src/components/admin/`, `src/components/ui/`, or `src/components/atomic-crm/providers/`

## Architecture Notes

**Migration:**
- Column names must match the existing TypeScript type exactly: `primary_bottleneck` (text), `software_stack` (text[]), `dm_present` (boolean), `hours_wasted_per_week` (numeric), `response_time_hours` (numeric)
- All columns nullable — these are optional enrichment fields
- Timestamp format: `YYYYMMDDHHMMSS_add_deal_predictive_fields.sql`

**stackInfo.ts:**
```ts
export type StackTool = {
  slug: string;
  name: string;
  category: "CRM" | "Scheduling" | "Estimating" | "Comms" | "Accounting" | "Other";
  migration: { difficulty: "easy" | "moderate" | "hard"; note: string };
};
export const stackInfo: Record<string, StackTool> = { ... };
```
Seed these slugs at minimum: `jobber`, `servicetitan`, `buildertrend`, `jobtread`, `quickbooks`, `google-sheets`, `hubspot`, `monday`, `housecall-pro`, `excel`, `no-software`. Unknown slugs fall back gracefully to a generic chip (slug as display name, category "Other").

**bottleneckLabels.ts:**
Short display map — the full bottleneck string is verbose, card needs ≤20 chars. Example:
```ts
export const bottleneckLabels: Record<string, string> = {
  "Lead response speed": "Lead Speed",
  "Estimating turnaround": "Estimating",
  "Job scheduling": "Scheduling",
  // ...
};
// Fallback: truncate to 20 chars with ellipsis
```

**DealCard enrichment layout** — add below the existing amount/category line, only when data is present:
1. **Bottleneck badge** — `<Badge variant="outline" className="text-[10px] px-1.5 py-0 truncate max-w-[120px]">` with short label. Only renders if `deal.primary_bottleneck` is set.
2. **Stack chips** — render up to 2 from `deal.software_stack[]`, truncate with `+N` if more. Use `stackInfo[slug].name` for display. Only renders if array is non-empty.
3. **Owner present** — `<CheckCircle2 size={12} className="text-emerald-500" />` or `<XCircle size={12} className="text-muted-foreground" />` with text "Owner" / "No Owner". Only renders if `deal.dm_present !== undefined`.
4. **Hours wasted** — `{N}h/wk` in `text-[11px] text-muted-foreground`. Only renders if `deal.hours_wasted_per_week` is set.

All 4 slots are additive below the existing decay line. If none of the 4 fields are set, nothing renders (no empty space). Wrap them in a single `div` that only renders when at least one field is present.

**Demo generator:** The fakerest generator in `demo/` needs to produce realistic values for the 5 fields on a subset of deals (not all — make ~60% have enrichment data so the card shows both enriched and bare states). Check the existing generator pattern in `demo/` for how deals are currently generated.

## Acceptance Criteria

- [ ] `npm run test:unit:app` passes with 0 failures
- [ ] `npm run dev:demo` renders DealCard with bottleneck badge, stack chips, owner icon, and hours label on deals that have enrichment data
- [ ] Cards without enrichment data show no blank space — absent fields hide cleanly
- [ ] Stack chips show tool name from `stackInfo`; unknown slugs show slug as-is (no crash)
- [ ] On mobile viewport (375px), enrichment signals are readable and don't overflow the card
- [ ] Migration file is present and syntactically valid SQL

## Must Not Change

- [ ] `src/components/atomic-crm/types.ts` — Deal type already has the 5 fields correctly typed; do not modify the type, only use it
- [ ] `src/components/atomic-crm/deals/dealUtils.ts` — decay logic is correct, do not touch
- [ ] `src/components/atomic-crm/deals/stageColors.ts` — stage color map, leave as-is
- [ ] `src/components/admin/` — RA primitive wrappers, out of scope entirely
- [ ] Any existing migration file — append only, never edit past migrations
- [ ] `DealCard`'s existing click handler, draggable wiring, and decay ring logic

## Scope Gates

- [ ] If `software_stack` field is missing from the Deal type when you go to use it — STOP and comment on PR. (It should be there, but verify first.)
- [ ] If the demo generator file structure is significantly different from what's described here — STOP and comment with what you found.

## Deviation Rules

**Auto-fix (no checkpoint needed):**
- Missing imports for lucide icons used in new enrichment slots
- Lint/format violations
- Missing null checks on enrichment fields

**Checkpoint required:**
- Any change to `DealCard`'s drag-and-drop wiring or click handler
- Adding a new npm dependency
- Changing the `Deal` type definition in `types.ts`
- Any modification to existing migrations

## Anti-Patterns

- Do not render empty badge containers when the field is null/undefined — use conditional rendering, not empty strings
- Do not hardcode tool names in DealCard — all tool name display goes through `stackInfo`
- Do not create a new data fetch in `DealCard` — the deal object is already passed as a prop; read directly from it

## Manual Test Checklist

- [ ] Open demo mode (`npm run dev:demo`), navigate to pipeline kanban. Verify enriched deals show bottleneck badge, stack chips, owner icon, and hours — and un-enriched deals show none of those elements (no blank gap)
- [ ] On a mobile viewport (375px wide), verify cards don't overflow horizontally and enrichment signals are legible
- [ ] Drag a deal card from one column to another — verify drag still works with new content added
- [ ] Click a deal card — verify DealShow dialog still opens

## Status

- [x] Spec drafted
- [x] Brief approved (Claude)
- [ ] Built (Codex)
- [ ] Reviewed (Claude)
- **Revision count:** 0
