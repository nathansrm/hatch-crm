# Task Brief: Deal Show Page Redesign

**ID:** BRIEF-003
**Date:** 2026-04-16
**Project:** Hatch CRM
**Size:** M
**Depends on:** BRIEF-002 (requires `stackInfo.ts` to exist)

## Goal

Reorganize the Deal Show dialog into a command center for proposal prep — Decision Context block, Stack block with migration notes, and a cleaner two-column layout that puts the information Nathan needs front and center.

## Environment

**Branch:** `feat/deal-show-redesign` (create from `feat/deal-card-enrichment` after BRIEF-002 merges, OR from `main` with `stackInfo.ts` copied in)
**Setup:** `npm install`, `npm run dev:demo`
**Test command:** `npm run test:unit:app`
**When done:** Push to origin and open a PR against `main`

## Scope

### In Scope
- [ ] `src/components/atomic-crm/deals/DealShow.tsx` — restructure `DealShowContent` layout
- [ ] `src/components/atomic-crm/deals/DecisionContextBlock.tsx` — new component
- [ ] `src/components/atomic-crm/deals/StackBlock.tsx` — new component
- [ ] `src/components/atomic-crm/deals/index.ts` — export new components

### Out of Scope
- [ ] `DealEdit.tsx` / `DealInputs.tsx` — edit form is separate, leave as-is
- [ ] `DealCard.tsx` — handled by BRIEF-002
- [ ] Any route changes — DealShow is a Dialog, keep it that way
- [ ] Dashboard (BRIEF-004)
- [ ] `src/components/admin/`, `src/components/ui/`, providers

## Architecture Notes

**DealShow is a Dialog, not a page.** `DialogContent` has `max-w-4xl` and `overflow-y-auto max-h-9/10`. Work within those constraints — no horizontal overflow.

**DealShowContent new layout:**

```
[Header: company avatar + name + edit/archive buttons]
[Stage + amount + closing date row — existing, keep]
─────────────────────────────────────────
Main col (flex-1)          | Sidebar (w-64, hidden on mobile)
─────────────────────────────────────────
DecisionContextBlock        | ContactList (existing)
StackBlock                  | Tasks (existing)
                            | Tags (existing)
Notes/Activity (existing)   | Outreach history (existing)
```

On mobile (`< md`): sidebar collapses and stacks after the main column blocks. Use `flex flex-col md:flex-row gap-6` on the outer wrapper.

**DecisionContextBlock** — renders when at least one of the 4 fields is present. Displays:
- **Bottleneck:** full text of `record.primary_bottleneck` (not truncated here — use full string)
- **Hours wasted:** `{N} hours/week lost to manual work`
- **Owner present:** "Decision maker present" (✓ green) or "Owner not in deal" (✗ muted)
- **Time to first response:** `{N} hours` or "Not tracked"

Empty state when all 4 are null: `<p className="text-sm text-muted-foreground">No context captured yet — fill in during Discovery call.</p>`

**StackBlock** — renders when `record.software_stack` is non-empty. For each slug in the array:
```tsx
// chip per tool
<div className="flex items-center gap-2 p-2 rounded-md border">
  <span className="text-sm font-medium">{stackInfo[slug]?.name ?? slug}</span>
  <Badge variant="outline" className="text-xs">{stackInfo[slug]?.category ?? "Other"}</Badge>
  <span className={`text-xs ml-auto ${difficultyColor[stackInfo[slug]?.migration.difficulty ?? "moderate"]}`}>
    {stackInfo[slug]?.migration.note ?? "Migration details unknown"}
  </span>
</div>
```
`difficultyColor`: `easy → text-emerald-600`, `moderate → text-amber-600`, `hard → text-red-600`

Empty state when array is empty/null: `<p className="text-sm text-muted-foreground">No software stack recorded.</p>`

**Import `stackInfo`** from `./stackInfo` (created by BRIEF-002). If BRIEF-002 hasn't merged yet and the file doesn't exist, create a minimal stub with just the type export and an empty `stackInfo = {}` — the full seed will come from BRIEF-002.

**Existing content to keep:** Everything currently in `DealShowContent` below the header/stage row stays — ContactList, Notes/Activity, the archive/edit buttons, all translations. Just reorganize the layout wrapper and inject the two new blocks.

## Acceptance Criteria

- [ ] `npm run test:unit:app` passes with 0 failures
- [ ] Deal Show dialog opens from kanban click — no regression
- [ ] `DecisionContextBlock` renders when fields are present; shows empty state message when all 4 are null
- [ ] `StackBlock` renders tool chips with name, category badge, and migration note; shows empty state when stack is empty
- [ ] On mobile viewport (375px), sidebar collapses below main content — no horizontal overflow
- [ ] All existing content (ContactList, Tasks, Tags, Notes, outreach history, edit/archive buttons) still present and functional
- [ ] Two-column layout appears at `md` breakpoint and above

## Must Not Change

- [ ] `Dialog` wrapper in `DealShow.tsx` — `max-w-4xl`, `overflow-y-auto max-h-9/10`, `top-1/20 translate-y-0`; do not change these constraints
- [ ] `ShowBase` + `DealShowContent` export names — consumed by `DealList.tsx`
- [ ] `ContactList.tsx` — the contact list component inside DealShow; only move its position, don't modify it
- [ ] `src/components/atomic-crm/deals/dealUtils.ts` — don't touch
- [ ] All existing translations (use `useTranslate()` for any new labels or add keys to the i18n file if needed, don't hardcode English strings — OR hardcode only if no translation key exists yet, which is fine for new fields)

## Scope Gates

- [ ] If `stackInfo.ts` doesn't exist and there's no clear stub to create — STOP and comment. It should exist from BRIEF-002.
- [ ] If the Dialog constraints prevent a clean two-column layout — STOP and comment with what you tried.

## Deviation Rules

**Auto-fix (no checkpoint needed):**
- Missing imports
- Null/undefined guard checks on record fields
- Lint/format violations
- Minor spacing/padding tweaks to make the layout look right

**Checkpoint required:**
- Changing the Dialog max-width or overflow settings
- Modifying `ContactList.tsx` beyond moving it in the layout
- Adding a new npm dependency
- Changing any exported function signatures in `dealUtils.ts`

## Anti-Patterns

- Do not duplicate the `stackInfo` map — import from `./stackInfo` (BRIEF-002 creates it)
- Do not hardcode tool-specific logic in `StackBlock` — all tool metadata comes from `stackInfo`
- Do not remove or hide existing fields (amount, stage, closing date, contacts, notes) — only reorganize
- Do not create a new `useGetList` call for deal data — `useRecordContext<Deal>()` already provides the record

## Manual Test Checklist

- [ ] Open demo mode, click a deal card that has enrichment data. Verify `DecisionContextBlock` and `StackBlock` render with real values.
- [ ] Click a deal card with no enrichment data. Verify both blocks show their empty states (not blank space, not a crash).
- [ ] On mobile viewport (375px): verify sidebar content stacks below DecisionContext + Stack, dialog scrolls, no overflow.
- [ ] Edit button still opens the edit form. Archive button still archives. Notes still load.
- [ ] Two-column layout visible at full desktop width (1280px).

## Status

- [x] Spec drafted
- [x] Brief approved (Claude)
- [ ] Built (Codex)
- [ ] Reviewed (Claude)
- **Revision count:** 0
