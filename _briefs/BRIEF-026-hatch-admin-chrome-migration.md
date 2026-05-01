---
brief_id: BRIEF-026
project: Hatch CRM
created: 2026-05-01
status: ready
scope: large
---

# Task Brief: HatchField Admin Chrome Migration

**ID:** BRIEF-026
**Date:** 2026-05-01
**Project:** Hatch CRM
**Size:** L
**Scope:** large (2hrs+, 5+ files, repo-wide chrome change → CodexApp directly)
**Layer:** Interface
**Depends on:** BRIEF-023 (primitives barrel locked), BRIEF-024 (migrations complete)
**Brief confidence:** High — Option A architecture locked, chokepoint files read, pattern precedent exists in TagForm.tsx
**Model:** gpt-5.5
**Model reason:** Multi-file chrome swap across ra-admin binding layer with subtle per-input quirks (date picker state machine, radix Select trigger, autocomplete popover trigger). Repo-wide visual consequence of each change.

> Routing: large — execute in CodexApp, not via dispatch.

<GLOBAL_MASTER_PROMPT>
**Hard Constraints:**
- This is Interface layer only. Do not touch react-hook-form binding logic, `useInput()` calls, `useChoicesContext()`, or any ra-core hooks. The binding layer must not change — only the rendered chrome changes.
- Do not modify any `*Inputs.tsx` call sites (DealInputs, ContactInputs, CompanyInputs, SalesInputs, NoteInputs). Zero changes to those files.
- Do not modify `src/components/hatch-crm/_primitives/index.ts` except to add new exports. Removing or renaming existing exports is a breaking change — the barrel is locked by BRIEF-023.
- Do not modify `src/components/ui/` (shadcn primitives). Chrome swap happens at the admin/ wrapper layer only.
- No raw hex values in JSX `style={{}}` props. All tokens must be CSS variables: `var(--hatch-cyan)`, `var(--fg-1)`, `var(--fg-2)`, `var(--fg-3)`, `var(--bad)`, `var(--surface-deep)`. See existing tokens in `src/components/hatch-crm/_primitives/HatchField.tsx`.
- No `style={{}}` for `:hover`, `:focus`, or `:active` states — use CSS classes or Tailwind focus-visible variants.
- `fieldBase` token string lives in `src/components/hatch-crm/_primitives/HatchField.tsx`. Any new primitive that needs the same dark-field look must import and reuse `fieldBase` from that file — do not copy-paste the string.

**Required Patterns (follow exactly):**
- `src/components/hatch-crm/tags/TagForm.tsx` is the gold-standard consumer of `HatchField` + `HatchTextInput`. Match that pattern exactly for label + input composition in the admin/ wrapper files.
- `src/components/hatch-crm/_primitives/HatchField.tsx` — `HatchAutocompleteShell` is the existing pattern for wrapping radix-based autocomplete triggers. `HatchSelectTrigger` (new, Wave 3) must follow the same pattern: a `div` with dark-field CSS variables, applied via `className`.
- Admin/ wrapper files keep `FormField` as the react-hook-form context boundary. Replace only the inner label and input chrome — `FormField`, `FormError`, `InputHelperText` remain.

**Architectural Boundaries:**
- Wave 1: `text-input.tsx`, `number-input.tsx` — direct Input/Textarea → HatchTextInput/HatchTextareaInput swap. FormLabel → HatchField label prop.
- Wave 2: `date-input.tsx` — preserve the full date state machine (refs, wasLastChangedByInput, inputKey remount pattern). Only swap `<Input type="date">` chrome with `HatchDateInput`. Apply the `ra-input ra-input-${source}` and calendar picker classes to HatchDateInput via `className` prop.
- Wave 3: `select-input.tsx`, `autocomplete-input.tsx`, `autocomplete-array-input.tsx` — add `HatchSelectTrigger` primitive (new export in `HatchField.tsx` + `index.ts`), apply to SelectTrigger. Wrap autocomplete popover trigger buttons with Hatch field tokens via className.

**Absolute Non-Negotiables:**
- The ra-admin form binding (useInput, field.onChange, field.value, field.onBlur, field.ref, isRequired) must not be touched. If you're unsure whether a change affects binding, checkpoint.
- FieldTitle (label + isRequired star) must remain in the HatchField label slot — don't drop required-field indicator.
- `FormError` stays — it surfaces react-hook-form validation errors. Do not remove it.
- `InputHelperText` stays — it renders `helperText` prop. Do not remove it.
- All pre-existing className pass-through on the outer FormField wrapper must be preserved.

**Structural Rules:**
- New components get their own file. Do not add new components or widgets to existing multi-widget files.
- File size cap: 400 lines (excluding blanks and comments). Check each modified file after edits.
- No raw hex values in JSX `style={{}}` props. Use CSS variables.
- No `style={{}}` for hover/focus/active states — use CSS classes.
- Shared UI patterns used 3+ times → extract to a primitive component before adding a third copy.
- One decision, one file.

**Coding Principles (Karpathy guidelines):**
- Surface assumptions explicitly; ask if uncertain rather than picking silently.
- Minimum code. No speculative features, abstractions, or error handling for impossible scenarios.
- Surgical changes — every changed line must trace to this brief. Don't refactor adjacent code.
- Verifiable success — define the check before implementing. Loop until criteria pass.
</GLOBAL_MASTER_PROMPT>

## Architectural Intent

- **Problem being solved (WHY):** The CRM forms (DealCreate, DealEdit, ContactCreate, etc.) render ra-admin inputs with shadcn's default light-mode chrome — white backgrounds, light borders, light labels — which clashes with the Obsidian dark dashboard that IS the Hatch design system. Every form surface has this debt. Fixing it at the call-site level (DealInputs.tsx etc.) would require touching 10+ files for the same chrome change in each. The admin/ wrapper layer is the single chokepoint where react-hook-form binding wires up and chrome is applied — swap chrome once here, every form gets it.
- **Constraints defining the solution space:** Must not change binding logic. Must preserve ra-admin behaviors that are subtle (DateInput's uncontrolled-ish state machine, SelectInput's radix key workaround for controlled value updates, autocomplete's popover open/close state). Must not touch Inputs.tsx call sites — those are BRIEF-024's locked output.
- **Explicitly NOT doing:** boolean-input, radio-button-group-input, file-input, search-input, text-array-input, date-time-input, array-input, reference-input, reference-array-input — these either have different chrome shapes (switch, radio group, file picker) that need dedicated primitive design, or are composition pass-throughs (reference-input just wraps children, it has no own chrome). Deferred to BRIEF-027+.

## Goal

Swap the visual chrome in `src/components/admin/` text, number, date, select, and autocomplete inputs from shadcn default (light) to Hatch dark-field tokens, by replacing `FormLabel` + shadcn `Input`/`Textarea`/`SelectTrigger` with `HatchField` + `HatchTextInput`/`HatchTextareaInput`/`HatchDateInput`/`HatchSelectTrigger`(new)/`HatchAutocompleteShell`. Call sites (DealInputs.tsx etc.) remain unchanged.

## Environment

**Branch:** `feat/brief-026-hatch-admin-chrome`  (create from `main`)
**Setup:** `cd C:/Users/natha/hatch-crm && npm install`
**Test command:** `npx tsc --noEmit --project tsconfig.app.json && npm run lint`
**When done:** Push to origin and open a PR against `main` with `gh pr create`

## Scope

### In Scope

**Wave 1 — Direct input swap (no quirks):**
- [ ] `src/components/admin/text-input.tsx` — `FormLabel(FieldTitle)` → `HatchField label={<FieldTitle>}`, `Input` → `HatchTextInput`, `Textarea` → `HatchTextareaInput`
- [ ] `src/components/admin/number-input.tsx` — same label swap; `Input type="number"` → `HatchTextInput type="number"` (preserve handleChange, handleFocus, handleBlur, local state)

**Wave 2 — Date input (preserve state machine):**
- [ ] `src/components/admin/date-input.tsx` — preserve entire ref / inputKey / wasLastChangedByInput state machine; swap `Input type="date"` chrome with `HatchDateInput`; apply `ra-input ra-input-${source}` + calendar picker classes to HatchDateInput via `className` prop

**Wave 3 — Radix-based inputs (new HatchSelectTrigger primitive):**
- [ ] `src/components/hatch-crm/_primitives/HatchField.tsx` — add `HatchSelectTrigger` component: wraps radix `SelectTrigger` from `@/components/ui/select`, applies dark-field `fieldBase` classes via `cn()`. Export it.
- [ ] `src/components/hatch-crm/_primitives/index.ts` — add `HatchSelectTrigger` export (additive only)
- [ ] `src/components/admin/select-input.tsx` — replace `FormLabel(FieldTitle)` → `HatchField label={<FieldTitle>}`; replace `SelectTrigger` import with `HatchSelectTrigger`
- [ ] `src/components/admin/autocomplete-input.tsx` — replace `FormLabel(FieldTitle)` → `HatchField label={<FieldTitle>}`; wrap popover trigger button in `HatchAutocompleteShell` (already exists in _primitives/)
- [ ] `src/components/admin/autocomplete-array-input.tsx` — same label + `HatchAutocompleteShell` pattern as autocomplete-input.tsx

### Out of Scope

- [ ] `src/components/hatch-crm/deals/DealInputs.tsx` — must not change
- [ ] `src/components/hatch-crm/contacts/ContactInputs.tsx` — must not change
- [ ] `src/components/hatch-crm/companies/CompanyInputs.tsx` — must not change
- [ ] `src/components/hatch-crm/sales/SalesInputs.tsx` — must not change
- [ ] `src/components/hatch-crm/notes/NoteInputs.tsx` — must not change
- [ ] `src/components/ui/` — shadcn primitives, do not modify
- [ ] `src/components/admin/boolean-input.tsx` — different chrome shape, deferred
- [ ] `src/components/admin/radio-button-group-input.tsx` — deferred
- [ ] `src/components/admin/file-input.tsx` — deferred
- [ ] `src/components/admin/search-input.tsx` — deferred
- [ ] `src/components/admin/text-array-input.tsx` — deferred
- [ ] `src/components/admin/date-time-input.tsx` — deferred
- [ ] `src/components/admin/array-input.tsx` — deferred
- [ ] `src/components/admin/reference-input.tsx` — composition pass-through, no own chrome
- [ ] `src/components/admin/reference-array-input.tsx` — composition pass-through, no own chrome
- [ ] `src/components/admin/form.tsx` — do not modify FormField/FormError/FormLabel definitions

## Architecture Notes

- **Label slot:** Replace `<FormLabel><FieldTitle label={label} source={source} resource={resource} isRequired={isRequired} /></FormLabel>` with `<HatchField htmlFor={id} label={<FieldTitle label={label} source={source} resource={resource} isRequired={isRequired} />}>`. FieldTitle already handles i18n + required star — do not drop it.
- **Input props pass-through:** `HatchTextInput`, `HatchTextareaInput`, `HatchDateInput` are raw `<input>` / `<textarea>` wrappers — they accept `React.InputHTMLAttributes` / `React.TextareaHTMLAttributes`. Pass `{...rest} {...field}` exactly as the current code passes to shadcn `<Input>`. No change to what props are forwarded.
- **FormField stays:** `FormField` is the react-hook-form `Controller` boundary. Wrap HatchField INSIDE FormField, not around it. Structure: `<FormField id={id} name={field.name}><HatchField label={...}><HatchTextInput .../></HatchField><InputHelperText /><FormError /></FormField>`.
- **HatchSelectTrigger:** In `HatchField.tsx`, add:
  ```tsx
  import { SelectTrigger } from "@/components/ui/select";
  export const HatchSelectTrigger = ({ className, ...rest }: React.ComponentProps<typeof SelectTrigger>) => (
    <SelectTrigger {...rest} className={cn(fieldBase, "h-11 px-3 text-sm", className)} />
  );
  ```
  This applies `fieldBase` dark tokens to the radix trigger. The SelectContent/SelectItem/SelectValue remain unchanged — they inherit from the existing SelectContent styling.
- **HatchAutocompleteShell for autocomplete:** `HatchAutocompleteShell` already exists in the barrel. In `autocomplete-input.tsx`, wrap the `PopoverTrigger`'s inner `<Button>` content in `HatchAutocompleteShell`. The popover trigger button itself should remain (it manages popover open state) — style its dark background by applying Hatch field tokens via `className` on the Button, or wrap in HatchAutocompleteShell as the visible field chrome.
- **Date input calendar picker:** `HatchDateInput` renders `<input type="date">`. In `date-input.tsx`, apply the existing className from the current Input: `cn("ra-input", \`ra-input-${source}\`, "scheme-light dark:scheme-dark relative [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-100 appearance-none", inputClassName)` to `HatchDateInput` via its `className` prop. Preserve `ref={inputRef}`, `defaultValue`, `key={inputKey}`, `onChange`, `onFocus`, `onBlur` exactly as today.
- **Proof of pattern:** `src/components/hatch-crm/tags/TagForm.tsx` lines 63–74 show exactly how HatchField + HatchTextInput compose with a manual htmlFor+id link. Mirror this pattern for the ra-admin wrappers (id comes from `useInput()`).
- **fieldBase import:** `fieldBase` is currently an unexported `const` in `HatchField.tsx`. To reuse in `HatchSelectTrigger`, either export it (`export const fieldBase = ...`) or define `HatchSelectTrigger` in the same file (preferred — keeps dark-field token source of truth in one file).

## Acceptance Criteria

- [ ] `npx tsc --noEmit --project tsconfig.app.json` exits with 0 errors
- [ ] `npm run lint` exits with 0 errors
- [ ] Opening DealCreate form in browser: all text/number/date/select inputs render with dark background (`rgba(255,255,255,0.03)`) and cyan focus border (`var(--hatch-cyan)`) — no white or light-grey input backgrounds visible
- [ ] Field labels render in the `text-xs font-bold uppercase tracking-[0.16em] text-[var(--fg-2)]` HatchField eyebrow style across DealCreate, ContactCreate, CompanyCreate, DealEdit
- [ ] Required-field star still appears on required fields (FieldTitle renders it when `isRequired=true`)
- [ ] Validation error messages still appear below fields on submit with missing required fields (FormError still present)
- [ ] SelectInput in DealCreate (stage, category) opens the dropdown normally and selection works
- [ ] DateInput in DealCreate (expected_closing_date) renders with dark chrome, date picker opens, value saves correctly
- [ ] No regression in DealShow, ContactShow, CompanyShow display fields (those use read-only fields, not these inputs)

## Must Not Change

- [ ] `src/components/admin/form.tsx` — FormField/FormError/FormControl/FormLabel definitions; changing these breaks all admin/ inputs simultaneously
- [ ] `src/components/hatch-crm/_primitives/index.ts` existing exports — barrel is locked (BRIEF-023); only add new exports
- [ ] Any `*Inputs.tsx` file — call sites are BRIEF-024's locked output; regression here means the migration has leaked scope
- [ ] `src/components/ui/select.tsx` — radix Select primitive; not in scope, changes cascade unpredictably
- [ ] `useInput()` call sites inside each admin/ file — binding logic untouched; only the JSX returned changes

## Scope Gates

- [ ] If any admin/ file exceeds 400 lines after edits — stop, extract first, then continue
- [ ] If `HatchAutocompleteShell` doesn't visually enclose the autocomplete trigger cleanly — stop and checkpoint rather than inventing a new wrapper
- [ ] If `autocomplete-array-input.tsx` has meaningfully different structure from `autocomplete-input.tsx` — stop and checkpoint rather than guessing

## Deviation Rules

**Auto-fix (no checkpoint needed):**
- Broken imports caused by adding new exports to HatchField.tsx
- Missing type annotations on new components you write
- Lint/format violations in files you touch
- cn() import missing in a file where you add className composition

**Checkpoint required (stop and comment on PR):**
- Any change to the binding logic (useInput, field.onChange, field.value, isRequired)
- Adding a new library or dependency
- Modifying any file in Must Not Change
- If the autocomplete inputs have internal state (open/close) that HatchAutocompleteShell interferes with
- Any change that would require modifying a `*Inputs.tsx` file to work

## Anti-Patterns

- Do not replace `FormField` with `HatchField` — they serve different purposes (binding context vs visual chrome). HatchField sits inside FormField.
- Do not copy-paste `fieldBase` string — import it from `HatchField.tsx` or define HatchSelectTrigger in the same file.
- Do not drop `FieldTitle` — it handles i18n and required-star. Replacing it with a plain string label breaks translations.
- Do not drop `FormError` — validation errors go there.
- Do not drop `InputHelperText` — helperText prop rendering goes there.
- Do not touch the SelectInput `key={select:${field.value?.toString() ?? emptyValue}}` workaround — it exists for a known radix bug (see comment in file).

## Manual Test Checklist

- [ ] **DealCreate form:** open in browser, confirm all input fields (name, description, company, contacts, category, amount, closing date, stage) have dark backgrounds and no white/grey chrome
- [ ] **DealEdit form:** open an existing deal, confirm inputs load with correct values and dark chrome, edit a field and save — value persists
- [ ] **DealCreate — date field:** click expected_closing_date, native date picker opens, select a date, value appears in field and dark chrome is maintained
- [ ] **DealCreate — select field:** open stage dropdown, options render, selection updates field. Lost Reason textarea appears when "lost" is selected.
- [ ] **ContactCreate form:** open, confirm text inputs (name, email, phone, etc.) use Hatch dark chrome throughout

## Sub-Briefs

**Wave Plan:**
| Wave | Sub-Briefs | Why this grouping |
|------|-----------|-------------------|
| 1 | SB-1 | Direct swaps, no behavioral quirks, lowest risk — ship and confirm pattern before Wave 2 |
| 2 | SB-2 | Date input has a non-trivial state machine — isolated to a single file, review before Wave 3 |
| 3 | SB-3 | Radix-based inputs + new primitive — depends on Wave 1 pattern being confirmed |

### SB-1: Text + Number Input Chrome Swap
**Wave:** 1
**Depends on:** none
**Branch:** `feat/brief-026-hatch-admin-chrome/sb-1`
**Files:**
- `src/components/admin/text-input.tsx`
- `src/components/admin/number-input.tsx`
**Scope:** Replace FormLabel(FieldTitle) → HatchField label slot; replace shadcn Input → HatchTextInput, Textarea → HatchTextareaInput in both files. Preserve all existing prop pass-through and binding logic.
**Acceptance:**
- `tsc --noEmit` passes
- TextInput and NumberInput render with dark-field backgrounds and HatchField eyebrow labels in DealCreate
**Verification:** `npx tsc --noEmit --project tsconfig.app.json && npm run lint`

### SB-2: Date Input Chrome Swap
**Wave:** 2
**Depends on:** SB-1 (confirms pattern is correct before touching the stateful input)
**Branch:** `feat/brief-026-hatch-admin-chrome/sb-2`
**Files:**
- `src/components/admin/date-input.tsx`
**Scope:** Preserve entire date state machine (inputKey, wasLastChangedByInput ref, localInputRef, handleChange/Focus/Blur). Swap shadcn `<Input type="date">` with `HatchDateInput`. Carry over the calendar picker className block via `className` prop.
**Acceptance:**
- `tsc --noEmit` passes
- DateInput renders dark chrome in DealCreate
- Selecting a date in the picker saves the value correctly
- Clearing the date field (blur with empty) works as before
**Verification:** `npx tsc --noEmit --project tsconfig.app.json && npm run lint`

### SB-3: Select + Autocomplete Chrome Swap + HatchSelectTrigger Primitive
**Wave:** 3
**Depends on:** SB-1 (confirmed label pattern)
**Branch:** `feat/brief-026-hatch-admin-chrome/sb-3`
**Files:**
- `src/components/hatch-crm/_primitives/HatchField.tsx` (add HatchSelectTrigger)
- `src/components/hatch-crm/_primitives/index.ts` (add export — additive only)
- `src/components/admin/select-input.tsx`
- `src/components/admin/autocomplete-input.tsx`
- `src/components/admin/autocomplete-array-input.tsx`
**Scope:** Add `HatchSelectTrigger` primitive that wraps radix SelectTrigger with dark-field tokens. Apply to select-input.tsx. Wrap autocomplete trigger chrome with HatchAutocompleteShell in autocomplete-input.tsx and autocomplete-array-input.tsx. Label swap in all three.
**Acceptance:**
- `tsc --noEmit` passes
- SelectInput (stage, category in DealCreate) renders dark chrome trigger, dropdown opens and selects normally
- AutocompleteInput (company_id in DealCreate) renders dark chrome, search and selection works
**Verification:** `npx tsc --noEmit --project tsconfig.app.json && npm run lint`

## Status

- [x] Spec drafted
- [x] Brief approved (Claude) — Option A locked, A2 (HatchSelectTrigger) locked
- [ ] Built (Codex)
- [ ] Reviewed (Claude)
- **Revision count:** 0
