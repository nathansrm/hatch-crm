# CLEANUP BLOCKED: outreach_draft + outreach_subject

**Date:** 2026-05-13
**Branch:** chore/drop-outreach-legacy-columns
**Triggered by:** Task to drop deprecated `outreach_draft` and `outreach_subject` columns from `intake_leads`

## Why cleanup is blocked

These columns are **not** backward-compat remnants. They are still actively read by two UI components and actively written by two edge functions. Dropping them would cause runtime failures in the edge functions and regress the mobile UI.

---

## Active read sites

### `src/components/hatch-crm/intake/IntakeListShared.tsx:109`
```ts
const hasDraft = Boolean(record.outreach_draft || record.outreach_subject);
```
This drives the label and conditional rendering of the intake action button:
- `hasDraft === true` → button reads "Review Draft"
- `hasDraft === false` → button reads "Prep Outreach"

Line 170 and 175 render based on `hasDraft`. Removing the columns breaks this UX gate entirely.

### `src/components/hatch-crm/intake/IntakeMobileList.tsx:142`
```tsx
body={record.outreach_draft || "No draft generated yet."}
```
The mobile outreach detail card body is populated from `record.outreach_draft`. Removing the column would make every mobile card show the fallback message regardless of outreach state.

---

## Active write sites (edge functions — must not be modified per task constraints)

### `supabase/functions/upsert-outreach-step/index.ts:151-152`
```ts
outreach_subject: latestStep?.subject ?? null,
outreach_draft: latestStep?.body ?? null,
```
Every time an outreach step is upserted, both columns are updated on `intake_leads`. If the columns are dropped, this Postgres UPDATE will throw a column-not-found error, breaking the entire outreach-step upsert flow.

### `supabase/functions/send-outreach/index.ts:332-333` (failure path)
```ts
outreach_subject: failLatestStep?.subject ?? null,
outreach_draft: failLatestStep?.body ?? null,
```

### `supabase/functions/send-outreach/index.ts:436-437` (success path)
```ts
outreach_subject: latestStep?.subject ?? null,
outreach_draft: latestStep?.body ?? null,
```
The send-outreach function writes to both columns on both success and failure paths. Dropping the columns breaks outreach sending.

---

## Additional references found (non-blocking on their own, but relevant)

| File | Nature |
|------|--------|
| `src/types/supabase.ts:701,703,730,732,759,761` | Auto-generated Supabase types — would need regeneration |
| `src/components/hatch-crm/types.ts:187,204` | `IntakeLead` type — removal would surface type errors |
| `src/components/hatch-crm/providers/commons/englishCrmMessages.ts:389` | i18n label |
| `src/components/hatch-crm/providers/commons/frenchCrmMessages.ts:394` | i18n label |
| `src/components/hatch-crm/providers/fakerest/dataGenerator/intakeLeads.ts:156,174` | Fakerest seed data |
| `supabase/schemas/01_tables.sql:382,396` | Schema source of truth |
| `supabase/migrations/20260411120300_intake_leads_rollup_columns.sql:5` | Existing migration (must not edit) |

---

## What needs to happen before this cleanup can proceed

1. **Migrate the mobile list**: `IntakeMobileList.tsx` should read `outreach_draft` from `outreach_steps` (join or separate fetch) instead of the denormalized column.
2. **Migrate the shared list button**: `IntakeListShared.tsx` `hasDraft` logic should query `outreach_steps` (e.g., check `COUNT > 0`) rather than the denormalized flags.
3. **Update the edge functions**: Both `send-outreach` and `upsert-outreach-step` must stop writing to these columns. (These are off-limits in the current task scope — a separate brief is needed.)
4. **Only after steps 1–3**: drop the columns and remove remaining type/i18n/seed references.

This is a multi-step migration, not a simple column drop. Recommend creating a new brief scoped to the full outreach-column deprecation.
