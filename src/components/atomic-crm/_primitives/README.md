# Hatch Primitives

Single-source-of-truth primitives for Atomic CRM's dark "Hatch" surface
language. Everything in `src/components/atomic-crm/_primitives/` wraps the
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
} from "@/components/atomic-crm/_primitives";
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
