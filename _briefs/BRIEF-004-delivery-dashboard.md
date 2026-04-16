# Task Brief: Dashboard Switcher + Delivery Dashboard

**ID:** BRIEF-004
**Date:** 2026-04-16
**Project:** Hatch CRM
**Size:** L
**Depends on:** none (parallel to BRIEF-002/003, no shared files)

## Goal

Add a second dashboard view ("Delivery") alongside the existing Pipeline view, switchable via tabs. The Delivery dashboard tracks active projects, capacity utilization, and deals pending handoff — giving Nathan and Luca a live picture of delivery health.

## Environment

**Branch:** `feat/delivery-dashboard` (create from `main`)
**Setup:** `npm install`, `npm run dev:demo`
**Test command:** `npm run test:unit:app`
**When done:** Push to origin and open a PR against `main`

## Scope

### In Scope
- [ ] `supabase/migrations/{timestamp}_add_delivery_fields.sql` — adds delivery columns to deals + creates agency_settings table
- [ ] `src/components/atomic-crm/types.ts` — extend `Deal` type with 4 new delivery fields
- [ ] `src/components/atomic-crm/dashboard/Dashboard.tsx` — add tab switcher (Pipeline / Delivery)
- [ ] `src/components/atomic-crm/dashboard/DeliveryDashboard.tsx` — new top-level delivery view
- [ ] `src/components/atomic-crm/dashboard/widgets/DeliveryKPIs.tsx` — 4 KPI cards
- [ ] `src/components/atomic-crm/dashboard/widgets/HandoffQueue.tsx` — Won deals awaiting project kickoff
- [ ] `src/components/atomic-crm/dashboard/widgets/CapacityPanel.tsx` — utilization warning
- [ ] `src/components/atomic-crm/dashboard/widgets/ActiveProjectsGrid.tsx` — project cards with progress
- [ ] `demo/` — extend deal generator so some Won deals have delivery fields set (project_status, progress, projected_hours)

### Out of Scope
- [ ] `DealCard.tsx` (BRIEF-002), `DealShow.tsx` (BRIEF-003) — different branch, no overlap
- [ ] Upcoming Tasks widget — existing `TasksList.tsx` can be reused as-is; no modifications
- [ ] Any file in `src/components/admin/`, `src/components/ui/`, providers, auth
- [ ] Mobile-specific dashboard layout (existing `MobileDashboard.tsx` stays untouched)

## Architecture Notes

**Migration:**
```sql
-- Delivery fields on deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS projected_hours numeric;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS project_status text
  CHECK (project_status IN ('on_track','at_risk','behind','complete') OR project_status IS NULL);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS project_progress_pct integer
  CHECK (project_progress_pct >= 0 AND project_progress_pct <= 100);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS project_started_at timestamptz;

-- Settings table (single row, id always = 1)
CREATE TABLE IF NOT EXISTS agency_settings (
  id integer PRIMARY KEY DEFAULT 1,
  weekly_capacity_hours integer NOT NULL DEFAULT 40,
  updated_at timestamptz DEFAULT now(),
  CHECK (id = 1)
);
INSERT INTO agency_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
```

**Types.ts additions** — add to `Deal` type:
```ts
projected_hours?: number;
project_status?: "on_track" | "at_risk" | "behind" | "complete";
project_progress_pct?: number;
project_started_at?: string;
```

**Tab switcher in Dashboard.tsx:**
- Import `Tabs, TabsList, TabsTrigger, TabsContent` from `@/components/ui/tabs` (Radix, already installed)
- URL state: use `useSearchParams` from `react-router` — `?view=pipeline` (default) vs `?view=delivery`
- Remember last tab in `localStorage` as `crm_dashboard_view` — read on mount, write on change
- Tabs sit above the existing Dashboard content; the `DashboardStepper` check stays — only show tabs after the stepper is done (i.e., when the stepper would normally show the full dashboard)

```tsx
// Dashboard.tsx tab pattern
<Tabs value={activeTab} onValueChange={handleTabChange}>
  <TabsList className="mb-4">
    <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
    <TabsTrigger value="delivery">Delivery</TabsTrigger>
  </TabsList>
  <TabsContent value="pipeline">
    {/* existing Dashboard content */}
  </TabsContent>
  <TabsContent value="delivery">
    <DeliveryDashboard />
  </TabsContent>
</Tabs>
```

**DeliveryKPIs.tsx** — 4 cards, follow `KPICards.tsx` pattern exactly (same `useGetList<Deal>`, same card structure):
1. **Deals Pending Handoff** — `deals.filter(d => d.stage === 'won' && !d.project_status).length`
2. **Active Projects** — `deals.filter(d => ['on_track','at_risk','behind'].includes(d.project_status ?? '')).length`
3. **Capacity Utilization** — `Math.round(activeProjects.reduce((s, d) => s + (d.projected_hours ?? 0), 0) / weeklyCapacity * 100)` — fetch `weekly_capacity_hours` from `agency_settings` (single GET). Show as `{N}%` with color: green < 80, amber 80-95, red > 95.
4. **Pending Handoff Value** — sum of amount on Won deals without project_status (motivates moving them through)

For demo mode: `agency_settings` won't exist in fakerest — hardcode `weeklyCapacity = 40` as a fallback with a comment.

**HandoffQueue.tsx** — list of Won deals without `project_status`. Each row:
```
[Company name] · [Deal name]            [Amount]    [N days since won]    [Start Onboarding →]
```
"Start Onboarding" button calls `useUpdate` to set `project_status: 'on_track'` and `project_started_at: new Date().toISOString()`. Show a `<NumberInput>` prompt for `projected_hours` in a simple inline form before confirming. If list is empty, show: "No deals pending handoff. All won deals are in delivery."

**CapacityPanel.tsx** — only renders when utilization > 85%. Shows a warning card listing active projects sorted by `projected_hours` descending with total hours vs capacity. Copy: "You're at {N}% capacity. Consider before taking on new work."

**ActiveProjectsGrid.tsx** — one card per deal where `project_status IN ('on_track', 'at_risk', 'behind')`:
```
[Company name]          [Status badge: On Track / At Risk / Behind]
[Deal name]
[Progress bar: project_progress_pct%]          [{projected_hours}h projected]
```
Status badge colors: `on_track → emerald`, `at_risk → amber`, `behind → red`. Use `<Badge>` component.
Progress bar: use `@radix-ui/react-progress` (already installed, check `@/components/ui/progress` or import directly).
If no active projects: "No active projects. Won deals pending handoff will appear here once started."

**Demo generator extension** — make ~3-4 Won deals have delivery fields set:
- `project_status: 'on_track'` or `'at_risk'`
- `project_progress_pct: 30-80`
- `projected_hours: 20-80`
- `project_started_at`: a date 2-6 weeks ago

## Acceptance Criteria

- [ ] `npm run test:unit:app` passes with 0 failures
- [ ] Pipeline tab renders existing dashboard unchanged
- [ ] Delivery tab renders `DeliveryKPIs`, `HandoffQueue`, `CapacityPanel` (if util > 85%), `ActiveProjectsGrid`, and reuses `TasksList`
- [ ] Tab state persists in URL (`?view=delivery`) and localStorage on refresh
- [ ] "Start Onboarding" button on HandoffQueue updates the deal and moves it to ActiveProjectsGrid without page reload
- [ ] `CapacityPanel` only renders when utilization is > 85%
- [ ] Empty states render for HandoffQueue and ActiveProjectsGrid when no data
- [ ] Migration file is present with valid SQL
- [ ] Deal type in `types.ts` includes the 4 new delivery fields

## Behavioral Contract

| Test Description | Pre-implementation (FAIL) | Post-implementation (PASS) |
|---|---|---|
| Tab URL state | `?view=delivery` has no effect — Pipeline always shows | `?view=delivery` renders DeliveryDashboard component |
| Capacity calc | Function does not exist | `calcUtilization([{projected_hours: 20}, {projected_hours: 60}], 40)` → `200` (% = 200, over 100 is valid) |
| Handoff queue filter | No filter exists | Only Won deals with `project_status === null/undefined` appear in HandoffQueue |

## Must Not Change

- [ ] `src/components/atomic-crm/dashboard/MobileDashboard.tsx` — mobile dashboard is separate, do not touch
- [ ] `src/components/atomic-crm/dashboard/DashboardStepper.tsx` — onboarding stepper, leave as-is
- [ ] `src/components/atomic-crm/dashboard/KPICards.tsx` — existing pipeline KPIs, do not modify
- [ ] `src/components/atomic-crm/dashboard/TasksList.tsx` — reuse it, don't modify it
- [ ] All existing dashboard widgets (ActionQueue, StaleDeals, HotContacts, etc.) — Pipeline tab must render them identically to current behavior
- [ ] Any existing migration file

## Scope Gates

- [ ] If `@/components/ui/tabs` doesn't exist as a shadcn component — STOP and comment. It may need to be added via `npx shadcn add tabs`.
- [ ] If `agency_settings` table causes RLS errors in live mode — that's expected (no policy written). Note it in PR, don't attempt to add RLS policy.
- [ ] If the HandoffQueue "projected hours" prompt requires a full modal — implement as a simple `window.prompt()` for now and note it as a polish item in the PR.

## Deviation Rules

**Auto-fix (no checkpoint needed):**
- Missing imports
- Null/undefined guards on new deal fields
- Lint/format violations
- Missing loading skeletons (match the `animate-pulse` pattern from `KPICards.tsx`)

**Checkpoint required:**
- Modifying any existing widget (ActionQueue, StaleDeals, HotContacts, etc.)
- Adding a new npm dependency beyond what's installed
- Changing Pipeline tab behavior in any way
- Any change to `MobileDashboard.tsx`

## Anti-Patterns

- Do not add new data fetching inside widget components — fetch at the `DeliveryDashboard` level and pass data down as props, OR use `useGetList` per widget (both patterns exist in codebase — be consistent with `KPICards.tsx` pattern which fetches its own data)
- Do not hardcode `weekly_capacity_hours = 40` without a comment and a TODO for the live `agency_settings` fetch
- Do not create a new state management layer — use React local state and RA's data hooks only

## Manual Test Checklist

- [ ] In demo mode, click "Delivery" tab — full dashboard renders without crash, all 4 KPI cards show
- [ ] Refresh the page with `?view=delivery` in URL — Delivery tab is active on load
- [ ] Click "Start Onboarding" on a HandoffQueue item — deal disappears from queue and appears in ActiveProjectsGrid
- [ ] Verify Pipeline tab is completely unchanged after switching back from Delivery
- [ ] On mobile viewport (375px) — tabs are visible and tappable; dashboard stacks vertically

## Status

- [x] Spec drafted
- [x] Brief approved (Claude)
- [ ] Built (Codex)
- [ ] Reviewed (Claude)
- **Revision count:** 0
