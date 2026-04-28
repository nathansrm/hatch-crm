# Task Brief: Hatch Primitive Migration — HIGH Priority Files

**ID:** BRIEF-024
**Date:** 2026-04-28
**Project:** Hatch CRM
**Size:** L
**Layer:** Interface
**Depends on:** BRIEF-023 (primitive layer foundation — merged PR #56)
**Brief confidence:** High — primitives public API is locked, target files confirmed, migration pattern established by TagDialog + CreateSheet/EditSheet precedents
**Model:** gpt-5.4
**Model reason:** n/a

<GLOBAL_MASTER_PROMPT>
> MANDATORY — DO NOT SKIP OR LEAVE BLANK.
> This block is prepended verbatim to every Codex dispatch for this brief and all sub-briefs.
> Codex reads this first. It is an immutable contract. It overrides all other context if there is a conflict.

**Hard Constraints:**
- Import ALL Hatch primitives from the barrel ONLY: `import { HatchX } from "../_primitives"`. Never import directly from `../primitives/HatchX.tsx` or individual primitive files.
- Do NOT replace `CancelButton` or `SaveButton` (ra-core form controls) with `HatchPrimaryButton` or `HatchGhostButton`. These are ra-core controlled and styled via `HATCH_PRIMARY_BUTTON_CLASS` / `HATCH_GHOST_BUTTON_CLASS` from `../layout/FormToolbar`. This boundary is intentional and must not change.
- Do NOT replace admin action buttons (`EditButton`, `DeleteButton`, `SortButton`, `ShowButton`) — these are ra-core controlled and are NOT in scope for this brief.
- Do NOT replace ra-admin form inputs (`TextInput`, `DateInput`, `NumberInput`, `SelectInput`, `BooleanInput`, `ArrayInput`, `ReferenceInput`, `AutocompleteInput`, `AutocompleteArrayInput`, `FileInput`, `DateTimeInput`, `RadioButtonGroupInput`, `SimpleFormIterator`). These are NOT in scope for HatchField migration — leave all ra-admin inputs untouched. HatchField migration is deferred to BRIEF-025.
- Do NOT create a `HatchBadge` component. `Badge` from `@/components/ui/badge` has no Hatch equivalent yet — leave all existing Badge usage untouched.
- Do NOT use `HatchAutocompleteShell` — it is explicitly out of scope for this brief.
- No raw hex values in JSX `style={{}}` props (e.g., `#ffffff`, `#1a1a1a`). Existing `rgba(...)` values may be preserved — only raw hex strings are banned.
- No inline styles for `:hover`, `:focus`, or `:active` states — use CSS classes.
- Strict TypeScript throughout. No `any` types — **EXCEPT** pre-existing `any` in `SalesCreate.tsx`, `SalesEdit.tsx`, `NoteEditSheet.tsx`, and `NoteInputs.tsx` (grandfathered — do not introduce new `any`, do not be required to remove existing `any` in those files).
- Do not add any library not already in `package.json`.
- File size cap: 400 lines (excluding blanks and comments). If a migration pushes a file over 400 lines, flag as a scope gate — do not extract without a brief.

**Required Patterns (follow exactly):**
- **Button migration:** `Button` from `@/components/ui/button` → `HatchPrimaryButton` (primary/default), `HatchGhostButton` (outline/ghost/secondary), `HatchDangerButton` (destructive). Match variant semantics, not just names. `variant="link"` has no Hatch equivalent — leave `variant="link"` buttons as raw `Button` from `@/components/ui/button` and add a comment: `{/* link-variant — no Hatch primitive yet, keep as-is */}`. **Outline preservation:** when migrating `<Button variant="outline">` → `<HatchGhostButton variant="outline">`, KEEP the `variant="outline"` prop. `HatchGhostButton` defaults to `variant="ghost"` (HatchButton.tsx:27-34) — stripping the prop silently turns outline buttons into borderless ghost buttons. **asChild preservation:** `HatchPrimaryButton`/`HatchGhostButton`/`HatchDangerButton` all forward props to the underlying shadcn `Button`, including `asChild` (HatchButton.tsx:6, button.tsx:42-48). Preserve `asChild` as-is — do NOT unwrap it.
- **Tabs migration:** `Tabs/TabsList/TabsTrigger/TabsContent` from `@/components/ui/tabs` → `HatchTabs/HatchTabsList/HatchTabsTrigger/HatchTabsContent`. These are drop-in replacements — same Radix props, no prop changes needed.
- **Dialog pattern reference (ra-core form dialogs):** `src/components/hatch-crm/deals/DealCreate.tsx` — canonical HatchDialog usage within ra-core Create/Form context. Direct import from barrel, `eyebrow`/`title`/`size` props, CancelButton/SaveButton via class names from FormToolbar.
- **Dialog pattern reference (plain dialogs, non-form):** `src/components/hatch-crm/tags/TagDialog.tsx` — canonical HatchDialog usage for non-ra-core dialogs.
- **Sheet pattern reference:** `src/components/hatch-crm/misc/EditSheet.tsx` and `misc/CreateSheet.tsx` — canonical HatchSheet wrappers for ra-core edit/create flows. Do NOT add another HatchSheet layer on top of these abstractions.
- **Card/Panel:** Replace card wrappers with `HatchCard` (padded, content containers) or `HatchPanel` (flush, table/list containers) as semantics dictate.

**Architectural Boundaries:**
- This brief is Interface layer only. Do not touch API routes, data providers, ra-core internals, or type definitions.
- `layout/FormToolbar.tsx` is OUT OF SCOPE. Do not modify it.
- `_primitives/index.ts` is OUT OF SCOPE. Do not add, remove, or rename exports.
- Auth pages (LoginPage, SignupPage) are OUT OF SCOPE for this brief entirely.
- Files already fully migrated (`NoteCreateSheet.tsx`, `TagDialog.tsx`) are OUT OF SCOPE.

**Absolute Non-Negotiables:**
- The `_primitives/index.ts` public API contract (locked 2026-04-28) must not change. (Note: a comment in that file says "Adding new exports is always safe" — that comment is general guidance for other contexts. For this brief, the rule is: do not add, remove, or rename any export from `_primitives/index.ts`.)
- Do not touch files outside the In Scope list for each sub-brief.
- `Badge` from `@/components/ui/badge` stays as-is wherever it appears — no substitution.

**Structural Rules:**
- New components get their own file. Do not add new components or widgets to existing multi-widget files.
- File size cap: 400 lines (excluding blanks and comments). Flag → don't extract.
- One decision, one file. Constants/types used by multiple components belong in a shared file.
</GLOBAL_MASTER_PROMPT>

## Architectural Intent

- **Problem being solved (WHY):** BRIEF-023 established the Hatch primitive layer with a locked public API. The CRM's HIGH-priority pages (deals, contacts, companies, notes, sales) still import `Button`, `Tabs`, and other raw shadcn/ui components — creating visual inconsistency and bypassing the design token system that the primitive layer enforces. This brief completes the migration to make the design system coherent across all primary CRM surfaces.
- **Constraints defining the solution space:** Migration is mechanical substitution — no new behavior, no layout changes, no feature additions. The ra-core boundary (CancelButton/SaveButton via class names; admin action buttons) must be respected. BRIEF-023's public API is locked — no primitive additions permitted here. Ra-admin form inputs (`TextInput`, `DateInput`, etc.) are NOT in scope — they require a dedicated migration pattern (BRIEF-025).
- **Explicitly NOT doing:** Auth pages (LoginPage, SignupPage) — they use react-hook-form, not ra-core, and get a separate design pass with ChatGPT mockups. HatchField/HatchTextInput/HatchTextareaInput/HatchDateInput — ra-admin inputs aren't raw shadcn; field migration is a non-mechanical refactor deferred to BRIEF-025. HatchBadge, HatchAvatar, HatchToolbar — these primitives don't exist yet; Badge usage stays as-is. Any layout restructuring beyond component substitution.

## Goal

Replace legacy `Button`, `Tabs`, `Card`, and structural imports with Hatch primitives across 12 HIGH-priority CRM pages/forms, completing the Button/Tabs/Card design system rollout started in BRIEF-023.

## Environment

**Branch:** `feat/brief-024-primitive-migration` (already created from `main`)
**Setup:** `npm install` (no new deps — primitives already in the codebase)
**Test command:** `tsc --noEmit --project tsconfig.app.json && npm run build`
**When done:** Push to origin and open a PR against `main`

## Scope

### Wave Plan

| Wave | Sub-Briefs | Files | Rationale |
|------|-----------|-------|-----------|
| 1 | SB-1 (Create forms) | 4 | 4 create pages — same ra-core Create/Form pattern, parallelizable |
| 2 | SB-2 (Show pages) | 4 | 3 show pages + CompanyAside — card/aside/tabs pattern, depends on nothing from Wave 1 |
| 3 | SB-3 (Edit forms + sheets) | 4 | 2 edit forms + NoteEditSheet + NoteInputs — Button migration, ra-core boundary verification |

### In Scope (full list)

**Wave 1 — Create Forms:**
- [ ] `src/components/hatch-crm/deals/DealCreate.tsx`
- [ ] `src/components/hatch-crm/contacts/ContactCreate.tsx`
- [ ] `src/components/hatch-crm/companies/CompanyCreate.tsx`
- [ ] `src/components/hatch-crm/sales/SalesCreate.tsx`

**Wave 2 — Show Pages:**
- [ ] `src/components/hatch-crm/deals/DealShow.tsx`
- [ ] `src/components/hatch-crm/contacts/ContactShow.tsx`
- [ ] `src/components/hatch-crm/companies/CompanyShow.tsx`
- [ ] `src/components/hatch-crm/companies/CompanyAside.tsx`

**Wave 3 — Edit Forms + Sheets:**
- [ ] `src/components/hatch-crm/deals/DealEdit.tsx`
- [ ] `src/components/hatch-crm/sales/SalesEdit.tsx`
- [ ] `src/components/hatch-crm/notes/NoteEditSheet.tsx`
- [ ] `src/components/hatch-crm/notes/NoteInputs.tsx`

### Out of Scope

- [ ] `src/components/hatch-crm/login/LoginPage.tsx` — auth page, separate brief
- [ ] `src/components/hatch-crm/login/SignupPage.tsx` — auth page, separate brief
- [ ] `src/components/hatch-crm/notes/NoteCreateSheet.tsx` — already migrated
- [ ] `src/components/hatch-crm/tags/TagDialog.tsx` — already migrated
- [ ] `src/components/hatch-crm/_primitives/index.ts` — public API locked
- [ ] `src/components/hatch-crm/layout/FormToolbar.tsx` — ra-core boundary, intentional
- [ ] `src/components/hatch-crm/misc/EditSheet.tsx` — shared abstraction, not in scope
- [ ] `src/components/hatch-crm/misc/CreateSheet.tsx` — shared abstraction, not in scope
- [ ] `src/components/hatch-crm/notes/NoteInputsMobile.tsx` — no shadcn imports; uses local AttachButton only
- [ ] `src/components/hatch-crm/deals/DealInputs.tsx` — ra-admin inputs only, nothing to migrate in this brief
- [ ] `src/components/hatch-crm/contacts/ContactInputs.tsx` — ra-admin inputs only, nothing to migrate in this brief
- [ ] `src/components/hatch-crm/companies/CompanyInputs.tsx` — ra-admin inputs only, nothing to migrate in this brief
- [ ] `src/components/hatch-crm/sales/SalesInputs.tsx` — ra-admin inputs only, nothing to migrate in this brief
- [ ] `Separator` in `src/components/hatch-crm/contacts/ContactShow.tsx` — no Hatch separator primitive; leave `@/components/ui/separator` import untouched
- [ ] `DropdownMenu*` in `src/components/hatch-crm/notes/NoteEditSheet.tsx` — no Hatch dropdown primitive; leave `@/components/ui/dropdown-menu` imports untouched
- [ ] Any file not explicitly listed above

## Architecture Notes

- **The migration pattern is substitution, not refactor.** Swap imports, update component names, match props. Do not restructure JSX unless a component's required props force it (e.g., HatchDialog requires `eyebrow` + `title` props, so those must be added where missing).

- **Check for partial migration before touching a file.** Some files (e.g., `DealCreate.tsx`, `DealShow.tsx`) already import some Hatch primitives. Do not add duplicate imports — audit the existing import block first and only add what's missing.

- **DealCreate is already mostly migrated.** It uses `HatchDialog` and `HATCH_PRIMARY_BUTTON_CLASS` correctly. Verify there are no remaining legacy `Button` imports, then mark done.

- **ContactCreate, CompanyCreate, SalesCreate are page-level forms, NOT dialogs.** Do NOT wrap them in HatchDialog. They get HatchButton migration only. HatchDialog applies to DealCreate only (which is already dialog-shaped).

- **NoteInputs.tsx has a `variant="link"` button.** This button has no Hatch equivalent. Leave it as raw `Button` from `@/components/ui/button` — add the comment `{/* link-variant — no Hatch primitive yet, keep as-is */}`. This file will still have one remaining `@/components/ui/button` import after migration — that is correct and expected.

- **NoteEditSheet likely routes through `misc/EditSheet`.** Verify `NoteEditSheet` imports `EditSheet` from `../misc/EditSheet` (not raw HatchSheet), and that no legacy `Button`/`Tabs` imports exist directly. If it delegates entirely to EditSheet, mark done with a PR comment confirming the verification.

- **CompanyAside — outer wrapper only.** `CompanyInfo`, `ContextInfo`, `AddressInfo`, `ConstructionInfo`, `AdditionalInfo` are exported and consumed directly by mobile CompanyShow. In this brief, migrate only the outer `CompanyAside` desktop rail wrapper to `HatchAside`. Leave the existing local `AsideSection` import and every exported section component completely unchanged. Do NOT use `HatchAsideSection` anywhere in `CompanyAside.tsx` — the exported sections are shared with mobile and their styling must remain visually equivalent.

- **CompanyAside layout invariant (CRITICAL — verified against CompanyAside.tsx:34 and HatchAside.tsx:14-20).** The current outer wrapper is literally `<div className="hidden sm:block w-92 min-w-92 space-y-4">` (a `div`, not `aside`; width is `w-92 min-w-92`; vertical rhythm is `space-y-4`). `HatchAside` defaults to `hidden flex-col gap-6 sm:flex` — naively swapping changes display (`sm:block` → `sm:flex`) AND vertical spacing (`space-y-4` → `gap-6`) AND drops the explicit width classes. **Required path:** keep all four invariant classes (`hidden`, `sm:block`, `w-92`, `min-w-92`, `space-y-4`) on the migrated element. Two acceptable approaches:
  1. **Preferred:** Pass `className="hidden sm:block w-92 min-w-92 space-y-4"` to `HatchAside`. Because `HatchAside` likely applies its defaults via internal classes that win over `className` order, you may need `!` modifiers (e.g. `sm:!block !space-y-4 !gap-0`) — Codex must verify by running the dev server and checking computed styles, NOT by trusting Tailwind merge order.
  2. **Acceptable fallback:** Leave the existing `<div>` wrapper unchanged and skip the HatchAside swap on this file. Add a PR comment: "HatchAside defaults (`sm:flex`, `gap-6`, no width) don't match CompanyAside's block + `w-92` + `space-y-4` shape. Reconciliation deferred — primitive's defaults need a follow-up brief."
  - **Whichever path Codex picks**, verify against `main` on Company Show desktop: (a) aside renders at the same fixed width, (b) sections have `space-y-4` vertical gap (not `gap-6`), (c) the `link !== "edit"` delete-block top border + spacing renders unchanged at CompanyAside.tsx:53-60.
  - Codex sandbox cannot run `npm run build` (spawn EPERM on Vite/esbuild). Type-check via `tsc --noEmit --project tsconfig.app.json` inside the sandbox; full build verification happens in the main session post-harvest.

- **HatchDialog props:** `eyebrow?: React.ReactNode`, `title: React.ReactNode`, `subtitle?: React.ReactNode`, `footer?: React.ReactNode`, `headerActions?: React.ReactNode`, `showHeader?: boolean`, `className?: string`, `contentClassName?: string`, `size?: "sm" | "md" | "lg" | "xl"`, `wrap?: (node: React.ReactNode) => React.ReactNode`. See `deals/DealCreate.tsx` for the ra-core form dialog pattern and `deals/DealEdit.tsx` for `title={<DealEditTitle />}` (ReactNode title) usage.

- **HatchTabs is Radix-compatible but not always a visual drop-in.** Same Radix props, but `HatchTabsList` and `HatchTabsTrigger` add layout/padding/underline classes. In mobile `ContactShow`, preserve the existing compact grid: keep `HatchTabsList className="grid w-full grid-cols-3 h-10"` and add `className="px-2 py-1 text-sm"` to each mobile `HatchTabsTrigger` to maintain the `h-10` fit.

- **Button variant mapping:**
  - `variant="default"` or primary intent → `HatchPrimaryButton` (no variant prop needed)
  - `variant="ghost"` or secondary/cancel intent → `HatchGhostButton` (no variant prop needed — defaults to ghost)
  - `variant="outline"` → `HatchGhostButton variant="outline"` — **KEEP the `variant="outline"` prop.** `HatchGhostButton` defaults to ghost; stripping the variant turns outline buttons into borderless ghost buttons. Verified against HatchButton.tsx:27-34.
  - `variant="destructive"` → `HatchDangerButton` (no variant prop needed)
  - `variant="link"` → keep as raw `Button`, add comment `{/* link-variant — no Hatch primitive yet, keep as-is */}`, do NOT replace
  - **`asChild` preservation:** Hatch button primitives forward props (including `asChild`) to the underlying shadcn `Button` (HatchButton.tsx:6, button.tsx:42-48). Preserve `asChild` as-is on Hatch buttons — do NOT unwrap.

- **DealEdit is a HatchDialog (not a sheet).** It wraps the edit form in a dialog, not a slide-over sheet. Do not swap to HatchSheet.

- **DealEdit empty fallback.** The existing empty fallback dialog behavior (when no `id` is present) must remain unchanged.

- **DealShow ArchivedBanner inline rgba.** The `ArchivedBanner` component uses `rgba(...)` inline styles. Preserve as-is — rgba() is explicitly not banned.

- **Post-migration grep (mandatory for each file):** After migrating a file, grep it for both single and double quoted variants: `from ['"]@/components/ui/button['"]` and `from ['"]@/components/ui/tabs['"]`. Both must return 0 results — **EXCEPT** `NoteInputs.tsx` which may retain one `@/components/ui/button` import for the `variant="link"` button (expected and correct).

- **Badge stays:** `from "@/components/ui/badge"` imports are fine — do not touch them.

- **Ra-admin inputs stay:** `TextInput`, `DateInput`, `NumberInput`, `SelectInput`, `BooleanInput`, `ArrayInput`, `ReferenceInput`, `AutocompleteInput`, `FileInput`, `DateTimeInput`, `RadioButtonGroupInput` — all untouched.

- **Admin action buttons stay:** `EditButton`, `DeleteButton`, `SortButton`, `ShowButton` from ra-core are NOT in scope — do not replace them.

## Acceptance Criteria

- [ ] `tsc --noEmit --project tsconfig.app.json` exits 0 with no new type errors
- [ ] `npm run build` exits 0 with no new build errors
- [ ] Grep for `from "@/components/ui/button"` in all 12 in-scope files returns 0 results **except** `NoteInputs.tsx` (which retains one import for `variant="link"`)
- [ ] Grep for `from "@/components/ui/tabs"` in all 12 in-scope files returns 0 results
- [ ] All files that import Hatch primitives do so from `"../_primitives"` barrel (not individual primitive files)
- [ ] `CancelButton` and `SaveButton` in ra-core forms remain unchanged
- [ ] Admin action buttons (`EditButton`, `DeleteButton`, `SortButton`, `ShowButton`) remain unchanged
- [ ] Ra-admin form inputs (`TextInput`, `DateInput`, etc.) are untouched in all files
- [ ] `Badge` from `@/components/ui/badge` is untouched in all files where it appears
- [ ] `_primitives/index.ts` is identical to pre-migration (no new exports added)
- [ ] HatchDialog applied to `DealCreate.tsx` only among the 4 Create files
- [ ] `CompanyAside.tsx` exported named components (`CompanyInfo`, `ContextInfo`, `AddressInfo`, `ConstructionInfo`, `AdditionalInfo`) have unchanged prop interfaces

## Must Not Change

- [ ] `src/components/hatch-crm/_primitives/index.ts` — public API locked, any change is a breaking change
- [ ] `src/components/hatch-crm/layout/FormToolbar.tsx` — ra-core boundary with intentional className exports
- [ ] `src/components/hatch-crm/notes/NoteCreateSheet.tsx` — already migrated, do not re-touch
- [ ] `src/components/hatch-crm/tags/TagDialog.tsx` — already migrated, do not re-touch
- [ ] Any `@/components/ui/badge` usage — Badge has no Hatch primitive yet; leave as-is
- [ ] All ra-admin form inputs (`TextInput`, `DateInput`, etc.) in any in-scope file
- [ ] `DealEdit.tsx` empty-state fallback dialog (when no id present) — behavior must be unchanged
- [ ] `DealShow.tsx` ArchivedBanner `rgba(...)` inline styles — preserve as-is
- [ ] `CompanyAside.tsx` exported section component prop interfaces — mobile CompanyShow consumes these directly

## Scope Gates

- [ ] If a file's line count would exceed 400 lines after migration — STOP, comment on PR, do not extract components without a brief
- [ ] If migrating a component requires changing its public props interface (props consumed by parent files) — STOP and comment
- [ ] If `misc/EditSheet.tsx` or `misc/CreateSheet.tsx` themselves need changes — STOP and comment; those are shared abstractions not in scope

## Deviation Rules

**Auto-fix (no checkpoint needed):**
- Broken imports or missing dependencies introduced by the migration
- Missing type annotations on new props added to satisfy HatchDialog/HatchSheet
- Lint/format violations caught by the project's configured linter

**Checkpoint required (stop and comment on PR):**
- Any structural JSX change beyond import + component name substitution
- Adding a new library or dependency
- Discovering a file needs a new primitive that doesn't exist in the barrel
- Any change to files in Must Not Change
- File approaching or exceeding 400-line cap

## Anti-Patterns

- Do not import from individual primitive files (e.g., `from "../_primitives/HatchButton"`) — barrel only
- Do not wrap `CancelButton`/`SaveButton` in `HatchPrimaryButton` — they are ra-core controlled
- Do not wrap `EditButton`, `DeleteButton`, `SortButton`, `ShowButton` — ra-core controlled, not in scope
- Do not replace ra-admin inputs with HatchField — they are not raw shadcn inputs and this is not mechanical
- Do not create a `HatchBadge` — it doesn't exist and is out of scope
- Do not restructure component hierarchy — substitution only
- Do not skip the post-migration grep check — Codex has blind spots on residual imports
- Do not wrap ContactCreate, CompanyCreate, or SalesCreate in HatchDialog — they are page-level forms, not dialogs
- Do not change the prop interface of `CompanyAside.tsx` exported section components — mobile consumers break silently

## Manual Test Checklist

- [ ] Open Deal Create dialog — button renders with Hatch styling (dark/branded)
- [ ] Open Contact Show page — tabs render correctly, no visual regressions in tab switching
- [ ] Open Contact Show page on mobile viewport — mobile tabs (ContactShowContentMobile) render correctly, grid layout preserved
- [ ] Open Company Show page — card layout intact, no padding/spacing regressions in CompanyAside sections
- [ ] Open Company Show page on mobile viewport — CompanyInfo/AddressInfo/etc. sections render equivalently to before
- [ ] Open Deal Edit **dialog** — dialog opens correctly, form fields render, close button works
- [ ] Open Note Edit sheet — sheet opens from the right, form fields render, close button works
- [ ] Open Note Create/Edit and verify the "show options" toggle button still renders with link-like visual weight

## Sub-Briefs

**Wave Plan:**
| Wave | Sub-Brief | Files | Dispatch |
|------|-----------|-------|---------|
| 1 | SB-1 | DealCreate, ContactCreate, CompanyCreate, SalesCreate | Parallel |
| 2 | SB-2 | DealShow, ContactShow, CompanyShow, CompanyAside | After SB-1 merged |
| 3 | SB-3 | DealEdit, SalesEdit, NoteEditSheet, NoteInputs | After SB-2 merged |

### SB-1: Create Form Migration
**Wave:** 1
**Depends on:** none
**Branch:** `feat/brief-024-primitive-migration/sb-1`
**Files:**
- `src/components/hatch-crm/deals/DealCreate.tsx`
- `src/components/hatch-crm/contacts/ContactCreate.tsx`
- `src/components/hatch-crm/companies/CompanyCreate.tsx`
- `src/components/hatch-crm/sales/SalesCreate.tsx`

**Scope:** Replace any remaining `Button` from `@/components/ui/button` with appropriate HatchButton variants. Verify ra-core `CancelButton`/`SaveButton` are NOT replaced. `DealCreate` only gets HatchDialog verification (already dialog-shaped). `ContactCreate`, `CompanyCreate`, `SalesCreate` are page-level forms — DO NOT wrap in HatchDialog; apply HatchButton only.
**Acceptance:** `tsc --noEmit --project tsconfig.app.json && npm run build` exits 0. Zero legacy button imports in all 4 files. HatchDialog applied to DealCreate only.
**Verification:** `grep -rE "from ['\"]@/components/ui/button['\"]" src/components/hatch-crm/deals/DealCreate.tsx src/components/hatch-crm/contacts/ContactCreate.tsx src/components/hatch-crm/companies/CompanyCreate.tsx src/components/hatch-crm/sales/SalesCreate.tsx` → 0 results. (Quote-agnostic: matches both single and double quotes.)

### SB-2: Show Page Migration
**Wave:** 2
**Depends on:** SB-1 merged
**Branch:** `feat/brief-024-primitive-migration/sb-2`
**Files:**
- `src/components/hatch-crm/deals/DealShow.tsx`
- `src/components/hatch-crm/contacts/ContactShow.tsx`
- `src/components/hatch-crm/companies/CompanyShow.tsx`
- `src/components/hatch-crm/companies/CompanyAside.tsx`

**Scope:** Replace `Button` → HatchButton variants. Replace `Tabs/TabsList/TabsTrigger/TabsContent` → HatchTabs variants (drop-in). In `CompanyAside.tsx`, replace only the outer desktop rail wrapper div with `HatchAside` from the `../_primitives` barrel, preserving equivalent width/visibility/spacing via `className` as needed. Do NOT replace the local `AsideSection` usage inside exported section components with `HatchAsideSection` — those sections are shared with mobile CompanyShow and must remain visually equivalent. Do NOT change prop interfaces of exported section components (`CompanyInfo`, `ContextInfo`, `AddressInfo`, `ConstructionInfo`, `AdditionalInfo`) — mobile consumers depend on them. Leave `Badge` and `rgba()` imports untouched. Post-migration grep: 0 results for button and tabs imports in all 4 files.
**Acceptance:** `tsc --noEmit --project tsconfig.app.json && npm run build` exits 0. Zero legacy button and tabs imports in all 4 files. CompanyAside exported section components have identical prop interfaces.
**Verification:** `grep -rE "from ['\"]@/components/ui/(button|tabs)['\"]" src/components/hatch-crm/deals/DealShow.tsx src/components/hatch-crm/contacts/ContactShow.tsx src/components/hatch-crm/companies/CompanyShow.tsx src/components/hatch-crm/companies/CompanyAside.tsx` → 0 results. (Quote-agnostic: matches both single and double quotes.)

### SB-3: Edit Form + Sheet + NoteInputs Migration
**Wave:** 3
**Depends on:** SB-2 merged
**Branch:** `feat/brief-024-primitive-migration/sb-3`
**Files:**
- `src/components/hatch-crm/deals/DealEdit.tsx`
- `src/components/hatch-crm/sales/SalesEdit.tsx`
- `src/components/hatch-crm/notes/NoteEditSheet.tsx`
- `src/components/hatch-crm/notes/NoteInputs.tsx`

**Scope:**
- *DealEdit:* Same HatchButton migration. DealEdit is a HatchDialog — verify it is already using HatchDialog (not HatchSheet). Preserve the empty-state fallback dialog behavior unchanged.
- *SalesEdit:* Same HatchButton migration. Pre-existing `any` types are grandfathered.
- *NoteEditSheet:* VERIFY ONLY — confirm it imports `EditSheet` from `../misc/EditSheet` (not raw HatchSheet), and that no legacy `Button`/`Tabs` imports exist directly. If it delegates entirely to EditSheet, mark done with a PR comment confirming verification.
- *NoteInputs.tsx:* Replace non-link `Button` variants with HatchButton equivalents. Leave `variant="link"` button as raw `Button` — add comment `{/* link-variant — no Hatch primitive yet, keep as-is */}`. Pre-existing `any` types are grandfathered. Ra-admin inputs (`TextInput`, `SelectInput`, `FileInput`, `DateTimeInput`, `AutocompleteInput`, `ReferenceInput`) are untouched.

**Acceptance:** `tsc --noEmit --project tsconfig.app.json && npm run build` exits 0. Zero legacy button imports in DealEdit and SalesEdit. NoteEditSheet verified as routing through EditSheet. NoteInputs retains exactly one `@/components/ui/button` import (for the `variant="link"` button).
**Verification:** `grep -rE "from ['\"]@/components/ui/button['\"]" src/components/hatch-crm/deals/DealEdit.tsx src/components/hatch-crm/sales/SalesEdit.tsx src/components/hatch-crm/notes/NoteEditSheet.tsx` → 0 results. `grep -E "from ['\"]@/components/ui/button['\"]" src/components/hatch-crm/notes/NoteInputs.tsx` → exactly 1 result (expected). **Plus NoteInputs JSX invariant:** `grep -cE "<Button[\\s>]" src/components/hatch-crm/notes/NoteInputs.tsx` → exactly 1 result. The single remaining raw `<Button>` JSX usage must be the `variant="link"` toggle at NoteInputs.tsx:136-145 — verify by inspecting that line range. All other former `<Button>` usages must have been migrated to `<HatchPrimaryButton>`/`<HatchGhostButton>`/`<HatchDangerButton>`.

## Status

- [x] Spec drafted
- [x] Brief approved (Claude)
- [x] Plan review: Pass 4 complete — SB-1 unblocked, SB-2/SB-3 carry deferred fixes
- [x] Pass-4 fixes B1/B2/B3 applied to brief 2026-04-28 — outline preservation, CompanyAside layout invariant, quote-agnostic grep, asChild reversal, NoteInputs JSX invariant, link-variant wording harmonized
- [x] Built (Codex) — SB-1 (verified complete, zero edits — all 4 Create files already migrated by prior cleanup; tsc + npm run build exit 0)
- [ ] Built (Codex) — SB-2 (ready to dispatch)
- [ ] Built (Codex) — SB-3 (dispatch after SB-2 merged)
- [ ] Reviewed (Claude)
- **Revision count:** 3 (Pass-4 blockers resolved in-brief; further revisions deferred to per-wave dispatches if surfaced)

### Pass 4 Findings — Deferred to SB-2/SB-3 Dispatch

Plan-review pass 4 surfaced 3 blockers caused by live-primitive behavior the brief did not account for. Verified against `src/components/hatch-crm/_primitives/HatchButton.tsx` and `HatchAside.tsx`. **None of these affect SB-1** (verified by grep — no `variant="outline"` or `asChild` in the 4 Create files, no CompanyAside).

**B1 — Outline → ghost regression risk (affects SB-2 + SB-3).**
`HatchGhostButton` defaults to `variant="ghost"` (HatchButton.tsx:27-34). Removing the `variant` prop after substitution silently turns `<Button variant="outline">` into borderless ghost buttons. Affects DealShow:261, DealEdit:125, CompanyShow:260.
**Fix at SB-2 dispatch:** preserve `variant="outline"` when migrating outline buttons to `HatchGhostButton`. Update Architecture Notes "Button variant mapping" to: `variant="outline"` → `HatchGhostButton variant="outline"` (do NOT strip the variant).

**B2 — HatchAside layout drift (affects SB-2).**
Current `CompanyAside` outer wrapper is `hidden sm:block ... space-y-4` (CompanyAside.tsx:34); `HatchAside` is `hidden ... flex-col gap-6 ... sm:flex` (HatchAside.tsx:14-20). Wrapper swap changes both display and spacing.
**Fix at SB-2 dispatch:** explicitly pin invariant — either pass `className="sm:block space-y-4"` to override `HatchAside` defaults, or keep the existing `<aside>` wrapper and only adopt `HatchAside` if/when its defaults are reconciled. Codex must verify visual parity vs main on Company Show desktop.

**B3 — SB verification grep too narrow (affects all SBs).**
Global mandatory grep matches both quote variants (line 157), but SB-1/SB-2/SB-3 verification commands at lines 256, 270, 289 only match double quotes.
**Fix at each SB dispatch:** when running verification, use `grep -rE "from ['\"]@/components/ui/(button|tabs)['\"]"` instead of fixed double-quote string.

**Plus 3 high-severity items deferred to SB-2/SB-3 dispatch:**
- asChild rule wording inverted: live Hatch buttons DO support asChild via shadcn passthrough (HatchButton.tsx:6, button.tsx:42-48). Update Architecture Notes to "preserve asChild as-is."
- NoteInputs invariant (SB-3): verify exactly 1 raw `<Button>` JSX usage at NoteInputs:136-145, not just 1 import.
- Link-variant comment text: harmonize line 32 vs line 147 wording.

**Process retro captured separately.** The recurring revision cycle was driven by the brief being authored from primitive public-API surface rather than implementation. Future migration briefs must read the implementation file before writing variant mapping rules.

## Plan Review

**Original review:** 2026-04-28T18:41Z — REVISE_AND_RESUBMIT (5 blockers)
**Revision 1:** 2026-04-28 — Resolved original 5 blockers. Added *Inputs.tsx files to scope for HatchField migration.
**Review 2:** 2026-04-28T19:12Z — REVISE_AND_RESUBMIT (new blockers: ra-admin inputs not swappable with HatchField, NoteInputs any, link variant, CompanyAside mobile)
**Revision 2:** 2026-04-28 — Removed HatchField entirely. Removed DealInputs/ContactInputs/CompanyInputs/SalesInputs/NoteInputsMobile from scope. Back to 12 files, size L.
**Review 3:** 2026-04-28T19:21Z — REVISE_AND_RESUBMIT (blockers: CompanyAside contract contradiction, HatchTabs mobile sizing, HatchDialog title type; secondary: Separator/dropdown-menu unclassified, asChild/variant prop, grep too narrow)
**Revision 3:** 2026-04-28 — Fixed via Codex fix-scoping pass. See below.
**Reviewer:** codex (gpt-5.4)

### Review 3 Blockers — Resolved

- **CompanyAside contract contradiction.** Brief said "apply HatchAsideSection" but also "don't change section internals" — impossible since sections use local `AsideSection`. → **Resolved:** Scope now says outer wrapper div only → `HatchAside`. `HatchAsideSection` explicitly banned from CompanyAside.tsx. Architecture Notes rewritten.
- **HatchTabs mobile sizing conflict.** `HatchTabsTrigger` adds padding/underline that breaks ContactShow's `h-10` grid. → **Resolved:** Architecture Notes now specify exact className overrides (`grid w-full grid-cols-3 h-10` on list, `px-2 py-1 text-sm` on triggers) for mobile ContactShow.
- **HatchDialog `title` is `ReactNode`, not string.** DealEdit passes `title={<DealEditTitle />}`. → **Resolved:** Architecture Notes updated with full accurate prop signature including `React.ReactNode` types.
- **Separator/dropdown-menu unclassified.** → **Resolved:** Both added to explicit Out of Scope list.
- **`asChild` + variant prop handling.** → **Resolved:** Button mapping now states: remove `variant` prop after substitution; handle `asChild` by unwrapping if Hatch equivalent doesn't support it.
- **Verification grep too narrow.** → **Resolved:** Post-migration grep now matches both single and double quoted import strings.

### Review 2 Blockers — Resolved

- **`*Inputs.tsx` use ra-admin inputs, not raw shadcn Input/Label.** HatchField migration is not mechanical in these files — drops `useInput`, validation, error display, array nesting. → **Resolved:** HatchField migration removed from brief entirely. Deferred to BRIEF-025. DealInputs/ContactInputs/CompanyInputs/SalesInputs removed from scope (nothing to migrate). NoteInputsMobile removed (no shadcn imports). NoteInputs kept in SB-3 for Button migration only.
- **`NoteInputs.tsx` pre-existing `any` not grandfathered.** → **Resolved:** NoteInputs.tsx added to grandfathering clause alongside SalesCreate/SalesEdit/NoteEditSheet.
- **`variant="link"` in NoteInputs not in button mapping.** → **Resolved:** Explicit mapping added: keep as raw Button with comment. NoteInputs acceptance updated to expect 1 remaining import.
- **CompanyAside mobile leak risk.** Exported section components used by mobile CompanyShow — HatchAsideSection could break mobile. → **Resolved:** Architecture Notes, Anti-Patterns, Acceptance Criteria, and Must Not Change all state that exported section component prop interfaces must not change. Manual checklist adds mobile CompanyShow test.
- **HatchAutocompleteShell not scoped.** → **Resolved:** Explicitly excluded in Global Master Prompt.

### Resolution Status

- [x] Brief revised to address all blockers (Revision 2)
- [ ] Re-run plan-review after revision
- [ ] Brief Health Check before dispatch
