# BRIEF: Design System Consolidation & Atomic-CRM White Eradication

**Branch:** `claude/crm-component-library-SIiXV`
**Layer:** Interface (design tokens + primitives)
**Scope:** 18 files modified, 1 file deleted, 0 new dependencies
**Risk:** Low-medium — visual/token changes only, no data model changes. Verified with `make typecheck` + `make build` (both green).

---

## Problem

The CRM "looks inconsistent" and old light/"atomic-crm" styling "keeps coming back in random places." Investigation (two audit passes) found the root cause is **not** a stray `atomic-crm` package or component regeneration — there is none. It's that the app was built on the Atomic CRM / shadcn-admin-kit lineage and **inherited that template's light defaults into its foundation**:

1. **The light theme was the `:root` default.** `index.css` defined the Obsidian dark palette only inside `.dark`; `:root` held a full white theme (`--background:#fafaf9`, `--card:#ffffff`, …). Anywhere a `.dark` scope was missed, the app silently fell back to white. **This is the "comes back in random places."**
2. **The canonical `Button` hardcoded the light primary** — `bg-[#1A1A2E] text-white` instead of the design tokens (canonical shadcn is `bg-primary text-primary-foreground`). The single most-used component bypassed the theme.
3. **Tag chips used Atomic CRM's exact pastel palette** (`#eddcd2`, `#fff1e6`…), which forced hardcoded `text-black` on 6 chip sites (pastels need dark text for contrast).
4. **Scattered light-mode leftovers** — `bg-gray-300` skeletons, `bg-zinc-100 text-black` splash/toolbar, a full light-gray image dropzone.

Ruled out as causes: no resources fall back to `Guesser`s; `scripts/generate-registry.mjs` only registers existing files; no `.old`/`-v2` duplicates. The debt is hardcoded/inherited, so fixing it is durable.

## Decisions (owner-approved)

- **Primary button:** keep today's subtle dark navy look, but drive it from a real `--primary-surface` token instead of hardcoded hex. Cyan stays reserved for accents/links/rings.
- **Light theme:** eradicate completely. Dark-only app; `Theme` type is now `"dark"`.

---

## Phase 1 — Foundation + white eradication ✅ (this PR)

### Tokens — `src/index.css`
- Merged the split `:root` (light) / `.dark` (dark) blocks into a single `:root, .dark { … }` carrying the **Obsidian dark** values. `:root` is now dark, so white can never leak even before `.dark` is applied; `.dark` is kept so Tailwind `dark:` variants still resolve.
- Removed all light semantic values, the dead `--stage-*` vars (defined but never consumed — `stageColors.ts` is the real source and its keys never matched), and added `--primary-surface` / `--primary-surface-hover` (+ matching `@theme` color tokens `--color-primary-surface*`).

### Primitive — `src/components/ui/button.tsx`
- `default` variant: `bg-[#1A1A2E] text-white hover:bg-[#252542]` → `bg-primary-surface text-foreground hover:bg-primary-surface-hover`. Identical look, now tokenized + themeable.

### Theme eradication
- `theme-context.ts`: `Theme = "dark"`.
- `theme-provider.tsx`: always applies `.dark`; `setTheme` is a no-op.
- Deleted `theme-mode-toggle.tsx`; removed its export (`admin/index.ts`), header usage (`admin/layout.tsx`), and the mobile `ThemeRow` + dead imports (`settings/SettingsPageMobile.tsx`).

### Tags — dark palette + dynamic contrast
- `tags/colors.ts`: replaced the 10 Atomic pastels with the canonical accent tints (cyan/violet/teal/amber/rose/green/sky/pink/blue/slate); added `getContrastText(bg)` (relative-luminance → dark or light text).
- Replaced hardcoded `text-black` with `getContrastText(...)` across all 6 chip sites: `TagChip`, `contacts/TagsList`, `TagsListEdit`, `BulkTagButton`, `ContactListFilter` (×2). Handles both new colors and legacy pastels still in the DB.
- Updated FakeRest demo tag colors (`providers/fakerest/dataGenerator/tags.ts`).

### Light-gray surfaces → tokens
- `simple-list/ListPlaceholder.tsx`, `SimpleListLoading.tsx`: `bg-gray-300` → `bg-muted`.
- `misc/ImageEditorField.tsx`: dropzone `bg-gray-50/100 border-gray-300 text-gray-600` → `bg-muted/30 hover:bg-muted/50 border-border text-muted-foreground`.
- `admin/ready.tsx`: `bg-zinc-100 text-black` → `bg-muted text-foreground`.
- `admin/bulk-actions-toolbar.tsx`: `bg-zinc-100 dark:bg-zinc-900` → `bg-card`.
- `integration-log/IntegrationLogList.tsx`: fallback `border-gray-400` → `border-border`.

**Result:** zero `text-black`, zero light `bg-gray/zinc` surfaces, zero Atomic pastels, zero light `:root` tokens remaining (verified by grep). The white-leak class of bug is closed.

---

## Phase 2 — Decorative hex → token migration (follow-up, not yet done)

~37 distinct hardcoded hex values remain across `src/components/hatch-crm/` (e.g. `#ECEEF5`×62, `#4DC8E8`×59, `#9AA3BE`, `#5C6784`). These are **dark-theme colors that render correctly** — this is maintainability debt, not a visual bug, so it's deferred. They map cleanly onto existing tokens:

| Hardcoded hex | Token replacement |
|---|---|
| `#ECEEF5` / `#eceef5` | `text-foreground` (`--foreground`) |
| `#4DC8E8` / `#4dc8e8` | `text-primary` / `--hatch-cyan` |
| `#9AA3BE` | `--fg-2` (secondary text) |
| `#5C6784` | `text-muted-foreground` |
| `#34D399` / `#F5B84A` / `#EF5A6F` / `#A78BFA` / `#5EEAD4` | `--good` / `--warn` / `--bad` / `--violet` / `--teal` |
| ink backgrounds `#060A16`/`#0D1424`/`#131B2E`/`#1E2842` | `bg-background` / `bg-card` / `bg-secondary`/`bg-muted` / `bg-accent` |

Worst offenders to migrate first: `deals/DealShow.tsx` (13), `companies/CompanyShow.tsx` (~8), `companies/CompanyAside.tsx` (5), `deals/DealInputs.tsx` (~4). Recommend doing this per-feature-folder to keep diffs reviewable, normalizing hex case to lowercase as you go.

**Acceptance for Phase 2:** `grep -rE '#[0-9a-fA-F]{6}' src/components/hatch-crm` returns only `colors.ts`/data-generator palette definitions; everything visual reads from a token.

## Verification

- `make typecheck` — green (pre-existing `faker`/`vitest`/`baseUrl` config warnings only, present on clean tree).
- `make build` — green, PWA bundle generated.
- Manual grep sweep confirms no remaining light-debt patterns.
