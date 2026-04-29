# Codebase Map: Hatch CRM

**Generated:** 2026-04-16
**Root:** `C:/Users/natha/hatch-crm`
**Branch at generation:** `main` (commit `0d4bffc`)

---

## Stack

- **Runtime:** Node.js, React 19
- **Framework:** React Admin (ra-core / fakerest for demo mode)
- **UI:** Radix UI primitives + shadcn/ui components, Tailwind CSS v4
- **State:** React Admin's data provider pattern (`useGetList`, `useRecordContext`, `useUpdate`)
- **DnD:** `@hello-pangea/dnd` (kanban drag)
- **Backend:** Supabase (PostgreSQL + RLS + Edge Functions)
- **Build:** Vite 7, TypeScript 5.8, `tsc && vite build`
- **Test:** Vitest (unit: `vitest.config.ts`, integration: `vitest.integration.config.ts`), Playwright (E2E)
- **Demo mode:** `vite.demo.config.ts` + `VITE_IS_DEMO=true` → fakerest data provider

---

## Directory Structure

```
hatch-crm/
├── src/
│   ├── App.tsx                        — root router, resource registration
│   ├── components/
│   │   ├── admin/                     — wrappers around ra-core primitives (TextField, ReferenceField, etc.)
│   │   ├── hatch-crm/               — MAIN DOMAIN LAYER
│   │   │   ├── activity/
│   │   │   ├── companies/
│   │   │   ├── contacts/
│   │   │   ├── dashboard/             — Dashboard.tsx, KPICards, widgets
│   │   │   ├── deals/                 — DealCard, DealShow, DealList, DealInputs, stages, dealUtils
│   │   │   ├── intake/                — IntakeList, IntakeMobileList, intake forms
│   │   │   ├── layout/                — AppLayout, nav, mobile layout
│   │   │   ├── notes/
│   │   │   ├── providers/             — dataProvider, authProvider
│   │   │   ├── root/                  — ConfigurationContext (dealStages, currency, etc.)
│   │   │   ├── sales/                 — SalesList, SalesShow
│   │   │   ├── tags/, tasks/
│   │   │   ├── types.ts               — ALL shared TypeScript types (Deal, Contact, Task, IntakeLead…)
│   │   │   └── consts.ts              — shared constants
│   │   ├── supabase/                  — Supabase client init
│   │   └── ui/                        — shadcn component library (button, card, badge, dialog, tabs…)
│   ├── hooks/                         — use-mobile, use-debounce, etc.
│   ├── lib/                           — utils (cn(), etc.)
│   └── types/                         — global TS declarations
├── supabase/
│   ├── migrations/                    — all schema migrations
│   └── functions/                     — edge functions (ingest-intake-lead, upsert-outreach-step, send-outreach)
├── _briefs/                           — task briefs + this map
├── scripts/                           — seed-demo-data.mjs, supabase-remote-init.mjs
├── demo/                              — fakerest generators for demo mode
└── vite.demo.config.ts                — demo mode build config
```

---

## Patterns to Follow

### Components
- One `.tsx` per component, named after the component (PascalCase)
- Barrel export from `index.ts` in each domain folder
- Reference file: `src/components/hatch-crm/deals/DealCard.tsx`

### Data Fetching
- Use `useGetList<T>` for list queries, `useRecordContext<T>` inside Show/Edit contexts
- `useUpdate` for mutations (with `mutateAsync`)
- Demo mode uses fakerest — no real Supabase calls. Safe for layout work.
- Reference: `src/components/hatch-crm/dashboard/KPICards.tsx`

### React Admin Context Pattern
- `RecordContextProvider` wraps components that use `useRecordContext`
- `useConfigurationContext()` provides dealStages, currency, dealCategories
- Never call `useListContext` outside a `List`-based component (caused Intake crash)

### UI Components
- Cards: `<Card>`, `<CardContent>` from `@/components/ui/card`
- Badges: `<Badge>` from `@/components/ui/badge` with `variant` prop
- Tabs: `@radix-ui/react-tabs` is installed — use for dashboard switcher
- Icons: `lucide-react`
- All Tailwind — no inline styles except where dynamic (border-left color on DealCard)

### Form Inputs
- Use RA input wrappers in `src/components/admin/` — `TextInput`, `NumberInput`, `SelectInput`, `AutocompleteArrayInput`
- Form state via `react-hook-form` (`useFormContext`, `useWatch`)
- Reference: `src/components/hatch-crm/deals/DealInputs.tsx`

### Error Handling
- RA's `useNotify` for user-facing errors
- No custom AppError class — handle at boundaries with try/catch

### Types
- All shared types in `src/components/hatch-crm/types.ts` — add there, not in component files
- `Deal` type already has: `primary_bottleneck?`, `software_stack?`, `dm_present?`, `hours_wasted_per_week?`, `response_time_hours?`
- **IMPORTANT:** These fields exist in the TypeScript type but have NO database migration yet. Adding them to the DB is required before they can be persisted.

---

## Data Flow

```
Demo mode:   fakerest generators (demo/) → useGetList → components
Live mode:   Supabase (PostgreSQL + RLS) → useGetList → components
Mutations:   useUpdate → dataProvider → Supabase REST or Edge Functions
```

Deal stage flow: `Discovery → Solutions Mapping → Proposal Under Review → Won | Lost`

---

## Known Gaps (as of 2026-04-16)

- **Predictive deal fields have no migration** — `primary_bottleneck`, `software_stack`, `dm_present`, `hours_wasted_per_week` exist in TypeScript type only. Schema migration needed before going live.
- **No Delivery Dashboard** — only Pipeline view exists. Stream 3 of Agency polish spec adds it.
- **No `projected_hours`, `project_status`, `project_progress_pct`** — these delivery fields exist nowhere yet (not in type, not in DB).
- **No `agency_settings` table** — needed for `weekly_capacity_hours` config.
- **n8n workflows WF-03/WF-04 not built** — edge functions exist (`send-outreach`, `upsert-outreach-step`) but no orchestration.
- **DealShow is a Dialog** — not a page. Opened from kanban click. Max width `lg:max-w-4xl`, scrollable.
- **Mobile error states** — `DealListMobile` and `CompanyListMobile` have no error state (Backlog P1.3).

---

## Architecture Notes for Briefs

Copy-ready directives for any brief targeting this project:

- **Data fetching:** Use `useGetList<Deal>("deals", { pagination: { page: 1, perPage: 10000 } })` — same pattern as `KPICards.tsx`
- **Record access in Show context:** `useRecordContext<Deal>()` — same pattern as `DealShowContent` in `DealShow.tsx`
- **Badge rendering:** `<Badge variant="outline" className="text-xs">label</Badge>` — lucide icon + badge for status chips
- **Card layout:** `<Card className="..."><CardContent className="px-3 flex flex-col">` — same as `DealCard.tsx`
- **Tabs:** `@radix-ui/react-tabs` — already a dep, use `Tabs / TabsList / TabsTrigger / TabsContent` from `@/components/ui/tabs`
- **Mutations:** `const [update] = useUpdate()` then `update("deals", { id, data: { ... }, previousData: record })`
- **All new types** go in `src/components/hatch-crm/types.ts`, not in component files
- **Barrel exports:** Add new component exports to the `index.ts` in the relevant domain folder
- **Must not touch:** `src/components/admin/` wrappers, `src/components/ui/` shadcn library, auth/provider files, existing migrations
- **Demo data:** Extend `demo/` generators when a new field needs to render in demo mode — fakerest won't know about new fields otherwise
