You are on branch: feat/dashboard-redesign — do NOT switch branches or create new branches.
Repository root: C:/Users/natha/hatch-crm

## Goal
Redesign the Delivery tab's five widgets to match a richer, more polished layout. The Delivery tab already renders `<DeliveryDashboard />` which composes DeliveryKPIs, HandoffQueue, CapacityPanel, ActiveProjectsGrid, and TasksList. All functional logic (data fetching, update actions) must be preserved — this is a layout and visual polish pass only.

## Scope
- Edit:
  - src/components/hatch-crm/dashboard/DeliveryDashboard.tsx
  - src/components/hatch-crm/dashboard/widgets/DeliveryKPIs.tsx
  - src/components/hatch-crm/dashboard/widgets/HandoffQueue.tsx
  - src/components/hatch-crm/dashboard/widgets/CapacityPanel.tsx
  - src/components/hatch-crm/dashboard/widgets/ActiveProjectsGrid.tsx
- Reference only (do not edit):
  - src/components/hatch-crm/dashboard/TasksList.tsx
  - src/components/hatch-crm/types.ts
- Do not touch: everything else

## Requirements

### DeliveryDashboard.tsx
- Add a page-level header section above the widgets:
  - h1 "Delivery Dashboard" (text-2xl font-bold tracking-tight)
  - subtitle paragraph: "Handoff queue, active project load, and capacity." (text-sm text-muted-foreground)
- Keep the vertical stack order: DeliveryKPIs → HandoffQueue → CapacityPanel → ActiveProjectsGrid → TasksList
- Pass `variant="sales"` to TasksList so it renders upcoming tasks split into TODAY / OVERDUE sections

### DeliveryKPIs.tsx
- Trim from 4 cards to 3 cards in a `grid grid-cols-1 gap-4 sm:grid-cols-3` layout:
  1. **Deals Pending Handoff** — count of won deals where `project_status == null` — amber left border (`border-l-4 border-l-amber-500`)
  2. **Active Projects** — count of deals where `project_status` is one of `["on_track", "at_risk", "behind"]` — blue left border (`border-l-4 border-l-blue-400`)
  3. **Capacity Utilization** — existing `calcUtilization` result as `"{N}%"` — green if < 85%, amber if 85–100%, red if > 100% (use `border-l-emerald-500`, `border-l-amber-500`, `border-l-red-500`)
- Each card: `Card className="p-4 border-l-4 ..."`, inside: label (`text-xs font-semibold uppercase tracking-wide text-muted-foreground`), large number (`text-3xl font-bold`), a small context line below (`text-sm text-muted-foreground`)
- Context lines: Handoff → "ready for onboarding", Active → "in delivery", Utilization → "of weekly capacity"
- Keep the existing `calcUtilization` export (imported by CapacityPanel)

### HandoffQueue.tsx
- Change from a table to a card-per-deal layout
- Section wrapper: `div className="space-y-4"` with a header row: h2 "Deal Handoff Queue" (`text-xl font-semibold`) + count badge on the right + subtitle "Recently closed-won" (`text-sm text-muted-foreground`)
- Each pending deal renders as a `Card className="p-4 border-l-4 border-l-amber-500"`
- Card layout (use `flex flex-col gap-4`):
  - Top row (`flex items-start justify-between gap-4`):
    - Left: company name as `<p className="font-semibold text-base">`, deal name as `<p className="text-sm text-muted-foreground">`
    - Right: the existing "Start Onboarding" Button (keep same onClick logic — useUpdate + window.prompt)
  - Metric strip: `grid grid-cols-3 gap-3`, each box `<div className="rounded-lg bg-muted/40 p-3">`:
    - Box 1: label "Deal Value", value = formatted `deal.amount` using existing `formatCurrency`
    - Box 2: label "Won Date", value = `deal.updated_at` formatted as "MMM d" using `format` from date-fns
    - Box 3: label "Sales", value = sales person's first + last name — fetch sales using `useGetList("sales", { pagination: { page: 1, perPage: 100 } })`, look up by `deal.sales_id`
  - Label style: `text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1`
  - Value style: `text-sm font-semibold`
- Empty state: card with muted text "No deals pending handoff. All won deals are in delivery."

### CapacityPanel.tsx
- Section wrapper: `div className="space-y-4"` with header row containing:
  - `AlertTriangle` icon (lucide-react, `h-5 w-5 text-amber-500`)
  - h2 "Capacity Warning" (`text-xl font-semibold`)
  - Subtitle "Active project workload" (`text-sm text-muted-foreground`)
- Wrap the table in a `Card className="overflow-hidden p-0"`
- Table columns: Deal | Value | Status | Projected Hours
  - Deal: company name (font-medium) + deal name (text-xs text-muted-foreground below)
  - Value: formatted currency (text-right)
  - Status: badge using `deal.project_status` — on_track → emerald chip "On Track", at_risk → amber chip "At Risk", behind → red chip "Behind" — style as `text-xs font-semibold px-2 py-0.5 rounded-full` with matching bg/text colors
  - Projected Hours: `{deal.projected_hours ?? 0}h` (text-right)
- Summary row below the body rows (use a `<tr className="border-t-2">` with `<td colSpan={4}>`):
  - Content: "Total: {totalHours}h projected / {weeklyCapacity}h weekly capacity"
  - Style red (`bg-red-50 text-red-700 font-semibold`) if totalHours > weeklyCapacity, else green (`bg-emerald-50 text-emerald-700 font-semibold`)
- `weeklyCapacity` stays hardcoded at 40
- Keep the existing `calcUtilization` import from DeliveryKPIs

### ActiveProjectsGrid.tsx
- Section wrapper: `div className="space-y-4"` with header row: h2 "Active Projects" (`text-xl font-semibold`) + count badge
- Layout: `grid grid-cols-1 gap-4 md:grid-cols-2` of project cards
- Each project card: `Card className="p-4 flex flex-col gap-3"`
  - Top row (`flex items-start justify-between`):
    - Left: company name (`font-semibold text-base`), deal name below (`text-sm text-muted-foreground`)
    - Right: status badge — on_track → `bg-emerald-100 text-emerald-700`, at_risk → `bg-amber-100 text-amber-700`, behind → `bg-red-100 text-red-700` — text: "On Track" / "At Risk" / "Behind" — style `text-xs font-semibold px-2 py-0.5 rounded-full`
  - Progress bar: shadcn `<Progress value={deal.project_progress_pct ?? 0} className="h-2" />`
  - Progress meta (`flex justify-between text-xs text-muted-foreground font-medium`):
    - Left: `"{deal.project_progress_pct ?? 0}% complete"`
    - Right: started date formatted as "Started MMM d" using `deal.project_started_at` (skip if null)
- Empty state: Card with muted text "No active projects yet."

## Pattern References
- Follow existing Tailwind + shadcn/ui patterns throughout
- Use `Card` from `@/components/ui/card`, `Badge` from `@/components/ui/badge`, `Progress` from `@/components/ui/progress`
- Use `format` from `date-fns` for date formatting
- Use `lucide-react` for icons
- `calcUtilization` export lives in DeliveryKPIs.tsx — CapacityPanel already imports it

## Verification
- Run: npx tsc --noEmit
- Expect: zero type errors
- Run: npm run build
- Expect: build completes without errors
