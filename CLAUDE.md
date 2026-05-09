# Hatch CRM

Internal CRM for Hatch Theory Solutions — contacts, deals (Kanban), tasks, notes, companies, and Gmail outreach. Production-deployed on Vercel + Supabase.

## Stack

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4
- Application logic: ra-core (react-admin headless) + shadcn-admin-kit
- UI: Shadcn UI + Radix UI (both are **mutable dependencies** — edit directly in `src/components/ui/` and `src/components/admin/`)
- Backend: Supabase (Postgres + Auth + Storage + Edge Functions)
- Testing: Vitest (unit) + Playwright (e2e)

## Dev commands

```bash
make start          # full stack: Supabase local + Vite dev (http://localhost:5173)
make start-demo     # FakeRest provider — no Supabase required
make test           # vitest unit
make typecheck      # tsc --noEmit
make build          # tsc + vite build
```

Local services: Supabase dashboard `localhost:54323` · REST `127.0.0.1:54321` · Email `localhost:54324`

## DB conventions

Schema source of truth: `supabase/schemas/` — edit here, never migrations directly.
Generate + apply: `npx supabase db diff --local -f <name>` → `npx supabase migration up --local`
Function defs in `02_functions.sql` must match exact `pg_dump` format — phantom diffs otherwise.
Column renames: replace DROP+CREATE with ALTER TABLE RENAME in the generated migration.

## Key patterns

- All CRM app code lives in `src/components/hatch-crm/` (~15k LOC). Keep feature work there.
- Path alias `@/` → `src/`. Use it everywhere.
- Filters use `ra-data-postgrest` convention: `field_name@operator` (e.g. `first_name@eq`).
- Pre-commit hook auto-runs `make registry-gen` — don't skip it.
- FakeRest views are emulated in frontend; Supabase views handle the real queries.
- Design system: Obsidian dark chrome is canonical. `atomic-crm` white = legacy debt — don't propagate it.

## Off-limits

- `supabase/migrations/` — auto-generated; only hand-edit for renames/edge cases
- `src/components/ui/` and `src/components/admin/` — edit directly, don't treat as locked deps
- No user deletion (account disable only — triggers in `04_triggers.sql`)

## Active focus (as of 2026-05-09)

BRIEF-026 (HatchField admin chrome migration) merged PR #63. BRIEF-025-Q microinteractions polish patch is next. Mobile retrofit (PWA + bottom nav + Vaul sheets) is scoped — brief pending.

## Briefs

Live in `_briefs/`. Naming: `BRIEF-NNN-slug.md`. Current queue in vault → `01 - PROJECTS/Active/Hatch CRM/`.

## Broader context

Query vault-rag: "Hatch CRM active brief" · "CRM mobile PWA retrofit" · "BRIEF-025 microinteractions" · "design system Obsidian dark chrome"
