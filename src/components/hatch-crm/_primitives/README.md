# Hatch Primitives

Single-source-of-truth primitives for Hatch CRM's dark "Hatch" surface
language. Everything in `src/components/hatch-crm/_primitives/` wraps the
existing shadcn primitive (so accessibility behavior is identical) and locks
in the audited tokens — gradient surfaces, cyan accent, eyebrow micro-type,
field shells, stage pills.

## Why this exists

Polish was leaking through copy-pasted inline styles in 30+ files. The audit
found 8 reusable patterns. This folder is those 8 patterns extracted, named,
and given one place to evolve.

## Import surface

```tsx
import {
  HatchSheet,
  HatchDialog,
  HatchCard,
  HatchPanel,
  HatchPageHeader,
  HatchField,
  HatchTextInput,
  HatchTextareaInput,
  HatchDateInput,
  HatchPillGroup,
  HatchAutocompleteShell,
  HatchPrimaryButton,
  HatchGhostButton,
  HatchDangerButton,
  HatchStagePill,
  HatchTabs,
  HatchTabsList,
  HatchTabsTrigger,
  HatchTabsContent,
  HatchAside,
  HatchAsideSection,
  HATCH,
  HATCH_CLASS,
} from "@/components/hatch-crm/_primitives";
```

## Refactor playbook

The audit identified two waves. The pattern is the same for each file:
**replace the chrome, keep the data wiring.** ra-core inputs (`TextInput`,
`AutocompleteInput`, etc.) keep working — only the surrounding container
chrome changes.

### Pattern 1 — Sheet pages (DealEdit, ContactCreate, NoteCreateSheet, …)

```tsx
// Before
<Sheet open={open} onOpenChange={...}>
  <SheetContent
    side="right"
    className="… inline gradient + tokens …"
    style={{ background: "linear-gradient(…)", boxShadow: "…" }}
  >
    <SheetHeader …>{/* eyebrow + title */}</SheetHeader>
    <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
    <SheetFooter …>{actions}</SheetFooter>
  </SheetContent>
</Sheet>

// After
<HatchSheet
  open={open}
  onOpenChange={...}
  eyebrow="EDIT DEAL"
  title={record.name}
  subtitle={`${record.amount}`}
  footer={
    <>
      <HatchGhostButton onClick={onCancel}>Cancel</HatchGhostButton>
      <HatchPrimaryButton onClick={onSave}>Save</HatchPrimaryButton>
    </>
  }
>
  {/* form body — ra inputs unchanged */}
</HatchSheet>
```

### Pattern 2 — Page headers

Replace inline-styled `<h1>` + eyebrow + count blocks with `HatchPageHeader`.

```tsx
<HatchPageHeader
  eyebrow="DEALS"
  title="Pipeline"
  count={total}
  countSuffix="open deals"
  actions={<HatchPrimaryButton>+ New deal</HatchPrimaryButton>}
/>
```

### Pattern 3 — Cards & panels

- Static surface card → `HatchCard padding="md"`
- List/table container → `HatchPanel` (overflow-hidden by default)
- Stage-tinted accent rail → `<HatchCard accent={stageColors.discovery.text}>`

### Pattern 4 — Form fields

Wrap each row in `HatchField label="…">`. For plain inputs use
`HatchTextInput` / `HatchTextareaInput` / `HatchDateInput`. For ra-core
autocompletes wrap them in `HatchAutocompleteShell` so the trigger inherits
the dark field tokens.

### Pattern 5 — Stage pills

Anywhere you see an inline-styled stage chip (DealShow header, ContactAside,
deal cards), use `HatchStagePill stage={record.stage} label="Discovery" />`.
Colors come from `deals/stageColors.ts`.

### Pattern 6 — Tabs

Replace `<Tabs>` + `<TabsList>` + `<TabsTrigger>` from `@/components/ui/tabs`
with the `Hatch*` versions. Same Radix props, dark cyan-underline visuals.

### Pattern 7 — Aside rails

Right-rail metadata sections on Show pages → `HatchAside` + `HatchAsideSection
title="OWNER">…</HatchAsideSection>`.

### Pattern 8 — Buttons

- Primary CTA → `HatchPrimaryButton`
- Cancel / secondary → `HatchGhostButton`
- Destructive (Delete contact, Archive deal) → `HatchDangerButton`

## Files to migrate (audit waves)

**HIGH (visible on first paint):**

- `deals/DealEdit.tsx`, `deals/DealShow.tsx`, `deals/DealCreate.tsx`
- `contacts/ContactCreate.tsx`, `contacts/ContactShow.tsx`
- `companies/CompanyCreate.tsx`, `companies/CompanyShow.tsx`
- `notes/NoteCreateSheet.tsx`, `notes/NoteEditSheet.tsx`
- `tags/TagDialog.tsx`
- `sales/SalesCreate.tsx`, `sales/SalesEdit.tsx`
- `login/LoginPage.tsx`, `login/SignupPage.tsx`

**MEDIUM (frequent but lower-traffic):**

- `contacts/ContactList.tsx`, `companies/CompanyList.tsx`,
  `deals/DealList.tsx`
- `layout/Header.tsx`
- `contacts/ContactAside.tsx`
- `contacts/ContactInputs.tsx`, `deals/DealInputs.tsx`

Each file changes by ~20–60 lines and removes a corresponding amount of
inline styling. Do them one at a time, run the app, eyeball the diff.

## Tokens

If you need a value the primitives don't expose, reach into `HATCH` (style
object) or `HATCH_CLASS` (className strings) — don't re-author the literals
inline.

## Audit Notes (BRIEF-023)

Audited 2026-04-28 against existing callers and BRIEF-024 migration targets.

| Primitive | Status | Finding |
|-----------|--------|---------|
| HatchSheet | ✅ complete | Covers create/edit sheet needs with header slots, footer, side/content classes, aria hooks, and form wrapping; inline literals match locked tokens. |
| HatchDialog | ✅ complete | Covers modal/show-page needs with size variants, optional header suppression, footer/header slots, and form wrapping; inline literals match locked tokens. |
| HatchCard | ✅ complete | Provides reusable dark surface, padding variants, accent rail, and native div props for show/login/card migrations. |
| HatchPanel | ✅ complete | Provides list/table surface with flush overflow default and native div props for dense list migrations. |
| HatchPageHeader | ✅ complete | Covers eyebrow, title, counts, subline, actions, and className needs for list/create/show headers. |
| HatchField + variants | ✅ complete | Field wrappers cover labels, hints, errors, native text/textarea/date inputs, pill groups, and autocomplete shells for sheet forms. |
| HatchButton variants | ✅ complete | Button wrappers mirror shadcn Button props; FormToolbar raw class exports remain intentional for ra-core SaveButton/CancelButton className injection. |
| HatchStagePill | ✅ complete | Pulls deal stage colors from `stageColors.ts` and supports labels, sizes, and className for deal chips. |
| HatchTabs | ✅ complete | Wraps shadcn/Radix tab primitives with Hatch visuals while preserving component props and accessibility behavior. |
| HatchAside + Section | ✅ complete | Covers desktop show-page side rails with section titles, actions, children, and className customization. |

Status key: ✅ complete | ✏️ minor gap fixed in this brief | ⚠️ gap deferred to BRIEF-024

**BRIEF-024 gate:** CLEAR — proceed with mass migration.
