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
- Do NOT create a `HatchBadge` component. `Badge` from `@/components/ui/badge` has no Hatch equivalent yet — leave all existing Badge usage untouched.
- No raw hex values in JSX `style={{}}` props. Use CSS variables (`var(--token-name)`) from the project's central stylesheet.
- No inline styles for `:hover`, `:focus`, or `:active` states — use CSS classes.
- Strict TypeScript throughout. No `any` types.
- Do not add any library not already in `package.json`.
- File size cap: 400 lines (excluding blanks and comments). If a migration pushes a file over 400 lines, flag as a scope gate — do not extract without a brief.

**Required Patterns (follow exactly):**
- **Button migration:** `Button` from `@/components/ui/button` → `HatchPrimaryButton` (primary/default), `HatchGhostButton` (outline/ghost/secondary), `HatchDangerButton` (destructive). Match variant semantics, not just names.
- **Tabs migration:** `Tabs/TabsList/TabsTrigger/TabsContent` from `@/components/ui/tabs` → `HatchTabs/HatchTabsList/HatchTabsTrigger/HatchTabsContent`. These are drop-in replacements — same Radix props, no prop changes needed.
- **Dialog pattern reference:** `src/components/hatch-crm/tags/TagDialog.tsx` — canonical HatchDialog usage. Direct import from barrel, `eyebrow`/`title`/`size` props.
- **Sheet pattern reference:** `src/components/hatch-crm/misc/EditSheet.tsx` and `misc/CreateSheet.tsx` — canonical HatchSheet wrappers for ra-core edit/create flows. Do NOT add another HatchSheet layer on top of these abstractions.
- **Card/Panel:** Replace card wrappers with `HatchCard` (padded, content containers) or `HatchPanel` (flush, table/list containers) as semantics dictate.
- **Field inputs:** Replace `Input` + `Label` pairs (ra-core or raw) with `HatchField` + appropriate input variant (`HatchTextInput`, `HatchTextareaInput`, `HatchDateInput`). Only within ra-core form context — see Auth scope gate below.

**Architectural Boundaries:**
- This brief is Interface layer only. Do not touch API routes, data providers, ra-core internals, or type definitions.
- `layout/FormToolbar.tsx` is OUT OF SCOPE. Do not modify it.
- `_primitives/index.ts` is OUT OF SCOPE. Do not add, remove, or rename exports.
- Auth pages (LoginPage, SignupPage) are OUT OF SCOPE for this brief entirely.
- Files already fully migrated (`NoteCreateSheet.tsx`, `TagDialog.tsx`) are OUT OF SCOPE.

**Absolute Non-Negotiables:**
- The `_primitives/index.ts` public API contract (locked 2026-04-28) must not change.
- Do not touch files outside the In Scope list for each sub-brief.
- `Badge` from `@/components/ui/badge` stays as-is wherever it appears — no substitution.

**Structural Rules:**
- New components get their own file. Do not add new components or widgets to existing multi-widget files.
- File size cap: 400 lines (excluding blanks and comments). Flag → don't extract.
- One decision, one file. Constants/types used by multiple components belong in a shared file.
</GLOBAL_MASTER_PROMPT>

## Architectural Intent

- **Problem being solved (WHY):** BRIEF-023 established the Hatch primitive layer with a locked public API. The CRM's HIGH-priority pages (deals, contacts, companies, notes, sales) still import `Button`, `Tabs`, and other raw shadcn/ui components — creating visual inconsistency and bypassing the design token system that the primitive layer enforces. This brief completes the migration to make the design system coherent across all primary CRM surfaces.
- **Constraints defining the solution space:** Migration is mechanical substitution — no new behavior, no layout changes, no feature additions. The ra-core boundary (CancelButton/SaveButton via class names) must be respected. BRIEF-023's public API is locked — no primitive additions permitted here.
- **Explicitly NOT doing:** Auth pages (LoginPage, SignupPage) — they use react-hook-form, not ra-core, and get a separate design pass with ChatGPT mockups. HatchBadge, HatchAvatar, HatchToolbar — these primitives don't exist yet; Badge usage stays as-is. Any layout restructuring beyond component substitution.

## Goal

Replace legacy `Button`, `Tabs`, `Card`, and `Input`/`Label` imports with Hatch primitives across 10 HIGH-priority CRM pages/forms, completing the design system rollout started in BRIEF-023.

## Environment

**Branch:** `feat/brief-024-primitive-migration` (already created from `main`)
**Setup:** `npm install` (no new deps — primitives already in the codebase)
**Test command:** `npx tsc --noEmit --ignoreDeprecations 6.0 && npm run build`
**When done:** Push to origin and open a PR against `main`

## Scope

### Wave Plan

| Wave | Sub-Briefs | Rationale |
|------|-----------|-----------|
| 1 | SB-1 (Create forms) | 4 create dialogs — same ra-core Create/Form pattern, no file overlap, parallelizable |
| 2 | SB-2 (Show pages) | 3 show pages — card/aside/tabs pattern, depends on nothing from Wave 1 |
| 3 | SB-3 (Edit forms + sheet) | 2 edit dialogs + 1 edit sheet — verify ra-core boundary, depends on nothing from prior waves |

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

**Wave 3 — Edit Forms + Sheet:**
- [ ] `src/components/hatch-crm/deals/DealEdit.tsx`
- [ ] `src/components/hatch-crm/sales/SalesEdit.tsx`
- [ ] `src/components/hatch-crm/notes/NoteEditSheet.tsx`

### Out of Scope

- [ ] `src/components/hatch-crm/login/LoginPage.tsx` — auth page, separate brief
- [ ] `src/components/hatch-crm/login/SignupPage.tsx` — auth page, separate brief
- [ ] `src/components/hatch-crm/notes/NoteCreateSheet.tsx` — already migrated
- [ ] `src/components/hatch-crm/tags/TagDialog.tsx` — already migrated
- [ ] `src/components/hatch-crm/_primitives/index.ts` — public API locked
- [ ] `src/components/hatch-crm/layout/FormToolbar.tsx` — ra-core boundary, intentional
- [ ] Any file not explicitly listed above

## Architecture Notes

- **The migration pattern is substitution, not refactor.** Swap imports, update component names, match props. Do not restructure JSX unless a component's required props force it (e.g., HatchDialog requires `eyebrow` + `title` props, so those must be added where missing).

- **Check for partial migration before touching a file.** Some files (e.g., `DealCreate.tsx`, `DealShow.tsx`) already import some Hatch primitives. Do not add duplicate imports — audit the existing import block first and only add what's missing.

- **DealCreate is already mostly migrated.** It uses `HatchDialog` and `HATCH_PRIMARY_BUTTON_CLASS` correctly. Verify there are no remaining legacy `Button` or raw `Input` imports, then mark done.

- **NoteEditSheet likely routes through `misc/EditSheet`.** `src/components/hatch-crm/misc/EditSheet.tsx` internally uses `HatchSheet`. The correct migration is: verify `NoteEditSheet` imports `EditSheet` (not raw HatchSheet), and that there are no legacy component imports leaking in. This is a verification pass, not a rewrite.

- **HatchDialog props:** `eyebrow` (string, uppercase label above title), `title` (string), `size?: "sm" | "md" | "lg" | "xl"`. See `tags/TagDialog.tsx` for the exact wrapping pattern.

- **HatchTabs is a drop-in.** Same Radix props as shadcn Tabs — rename imports only, no prop changes required.

- **Button variant mapping:**
  - `variant="default"` or primary intent → `HatchPrimaryButton`
  - `variant="outline"`, `variant="ghost"`, secondary/cancel intent → `HatchGhostButton`
  - `variant="destructive"` → `HatchDangerButton`

- **Post-migration grep (mandatory for each file):** After migrating a file, grep it for `from "@/components/ui/button"` and `from "@/components/ui/tabs"`. Both must return 0 results in any migrated file (unless the file intentionally keeps them — add a comment if so).

- **Badge stays:** `from "@/components/ui/badge"` imports are fine — do not touch them.

## Acceptance Criteria

- [ ] `npx tsc --noEmit --ignoreDeprecations 6.0` exits 0 with no new type errors
- [ ] `npm run build` exits 0 with no new build errors
- [ ] Grep for `from "@/components/ui/button"` in all 10 in-scope files returns 0 results
- [ ] Grep for `from "@/components/ui/tabs"` in all 10 in-scope files returns 0 results
- [ ] All 10 files import from `"../_primitives"` barrel (not individual primitive files)
- [ ] `CancelButton` and `SaveButton` in ra-core forms remain unchanged — no Hatch button variants wrapping them
- [ ] `Badge` from `@/components/ui/badge` is untouched in all files where it appears
- [ ] `_primitives/index.ts` is identical to pre-migration (no new exports added)

## Must Not Change

- [ ] `src/components/hatch-crm/_primitives/index.ts` — public API locked, any change is a breaking change
- [ ] `src/components/hatch-crm/layout/FormToolbar.tsx` — ra-core boundary with intentional className exports; changes here cascade across all forms
- [ ] `src/components/hatch-crm/notes/NoteCreateSheet.tsx` — already migrated, do not re-touch
- [ ] `src/components/hatch-crm/tags/TagDialog.tsx` — already migrated, do not re-touch
- [ ] Any `@/components/ui/badge` usage — Badge has no Hatch primitive yet; leave as-is

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
- Do not create a `HatchBadge` — it doesn't exist and is out of scope
- Do not restructure component hierarchy — substitution only
- Do not skip the post-migration grep check — Codex has blind spots on residual imports

## Manual Test Checklist

- [ ] Open Deal Create dialog — button renders with Hatch styling (dark/branded, not white atomic-crm)
- [ ] Open Contact Show page — tabs render correctly, no visual regressions in tab switching
- [ ] Open Company Show page — card layout intact, no padding/spacing regressions
- [ ] Open Deal Edit sheet — sheet opens from the right, form fields render correctly
- [ ] Open Note Edit sheet — sheet opens, form fields render, close button works

## Sub-Briefs

**Wave Plan:**
| Wave | Sub-Brief | Files | Dispatch |
|------|-----------|-------|---------|
| 1 | SB-1 | DealCreate, ContactCreate, CompanyCreate, SalesCreate | Parallel |
| 2 | SB-2 | DealShow, ContactShow, CompanyShow | After SB-1 merged |
| 3 | SB-3 | DealEdit, SalesEdit, NoteEditSheet | After SB-2 merged |

### SB-1: Create Form Migration
**Wave:** 1
**Depends on:** none
**Branch:** `feat/brief-024-primitive-migration/sb-1`
**Files:**
- `src/components/hatch-crm/deals/DealCreate.tsx`
- `src/components/hatch-crm/contacts/ContactCreate.tsx`
- `src/components/hatch-crm/companies/CompanyCreate.tsx`
- `src/components/hatch-crm/sales/SalesCreate.tsx`

**Scope:** Replace any remaining `Button` from `@/components/ui/button` with appropriate HatchButton variants. Verify HatchDialog is already in use (DealCreate); apply same pattern where missing. Verify ra-core `CancelButton`/`SaveButton` are NOT replaced — class names from FormToolbar only. Post-migration grep: 0 results for `from "@/components/ui/button"` in all 4 files.
**Acceptance:** `npx tsc --noEmit --ignoreDeprecations 6.0 && npm run build` exits 0. Zero legacy button imports in the 4 files. HatchDialog wrapping all 4 create dialogs.
**Verification:** `grep -r "from \"@/components/ui/button\"" src/components/hatch-crm/deals/DealCreate.tsx src/components/hatch-crm/contacts/ContactCreate.tsx src/components/hatch-crm/companies/CompanyCreate.tsx src/components/hatch-crm/sales/SalesCreate.tsx` → 0 results.

### SB-2: Show Page Migration
**Wave:** 2
**Depends on:** SB-1 merged
**Branch:** `feat/brief-024-primitive-migration/sb-2`
**Files:**
- `src/components/hatch-crm/deals/DealShow.tsx`
- `src/components/hatch-crm/contacts/ContactShow.tsx`
- `src/components/hatch-crm/companies/CompanyShow.tsx`

**Scope:** Replace `Button` from `@/components/ui/button` → HatchButton variants. Replace `Tabs/TabsList/TabsTrigger/TabsContent` from `@/components/ui/tabs` → HatchTabs variants (drop-in, same props). Apply `HatchAside`/`HatchAsideSection` where sidebar/section patterns exist. Leave `Badge` imports untouched. Post-migration grep: 0 results for `from "@/components/ui/button"` and `from "@/components/ui/tabs"` in all 3 files.
**Acceptance:** `npx tsc --noEmit --ignoreDeprecations 6.0 && npm run build` exits 0. Zero legacy button and tabs imports in the 3 files. Visual structure of show pages unchanged.
**Verification:** `grep -r "from \"@/components/ui/button\"\|from \"@/components/ui/tabs\"" src/components/hatch-crm/deals/DealShow.tsx src/components/hatch-crm/contacts/ContactShow.tsx src/components/hatch-crm/companies/CompanyShow.tsx` → 0 results.

### SB-3: Edit Form + Sheet Migration
**Wave:** 3
**Depends on:** SB-2 merged
**Branch:** `feat/brief-024-primitive-migration/sb-3`
**Files:**
- `src/components/hatch-crm/deals/DealEdit.tsx`
- `src/components/hatch-crm/sales/SalesEdit.tsx`
- `src/components/hatch-crm/notes/NoteEditSheet.tsx`

**Scope:** DealEdit + SalesEdit: same Button migration as SB-1. NoteEditSheet: VERIFY ONLY — confirm it imports `EditSheet` from `../misc/EditSheet` (not raw HatchSheet), and that no legacy `Button`/`Tabs` imports exist directly. If NoteEditSheet already delegates entirely to EditSheet, mark it done with a comment on the PR confirming the verification. Do NOT add HatchSheet directly to NoteEditSheet — the abstraction chain is correct by design.
**Acceptance:** `npx tsc --noEmit --ignoreDeprecations 6.0 && npm run build` exits 0. Zero legacy button imports in DealEdit and SalesEdit. NoteEditSheet verified as routing through EditSheet abstraction with no direct legacy imports.
**Verification:** `grep -r "from \"@/components/ui/button\"" src/components/hatch-crm/deals/DealEdit.tsx src/components/hatch-crm/sales/SalesEdit.tsx src/components/hatch-crm/notes/NoteEditSheet.tsx` → 0 results.

## Status

- [x] Spec drafted
- [x] Brief approved (Claude)
- [ ] Built (Codex) — SB-1
- [ ] Built (Codex) — SB-2
- [ ] Built (Codex) — SB-3
- [ ] Reviewed (Claude)
- **Revision count:** 0
