You are on branch: feat/dashboard-redesign — do NOT switch branches or create new branches.
Repository root: C:/Users/natha/hatch-crm

## Goal
Polish the Dashboard tab (DashboardOverview) to match the same visual quality as the Sales and Delivery tabs, and clean up the DealsChart which currently looks cluttered. Two files only.

## Scope
- Edit:
  - src/components/hatch-crm/dashboard/Dashboard.tsx
  - src/components/hatch-crm/dashboard/DealsChart.tsx
- Reference only (do not edit):
  - src/components/hatch-crm/dashboard/DashboardActivityLog.tsx
  - src/components/hatch-crm/dashboard/DealsByTradeType.tsx
  - src/components/hatch-crm/dashboard/KPICards.tsx
  - src/components/hatch-crm/dashboard/TasksList.tsx
  - src/components/hatch-crm/types.ts
- Do not touch: everything else

## Requirements

### Dashboard.tsx — DashboardOverview component only
- Add a page-level header above the KPI cards (same pattern as DeliveryDashboard.tsx):
  - h1 "Dashboard" (text-2xl font-bold tracking-tight)
  - subtitle "Pipeline overview, activity, and upcoming tasks." (text-sm text-muted-foreground)
- Wrap the DealsChart Card and DealsByTradeType Card in a consistent section:
  - Section label above the row: `<p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Revenue</p>`
- Wrap the DashboardActivityLog and TasksList row in a consistent section:
  - Section label above the row: `<p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Activity</p>`
- Keep all existing grid layout (xl:grid-cols-12, col-span values) unchanged
- Do not touch SalesDashboardContent, UrgencyMetricCard, or the Dashboard export — only modify DashboardOverview

### DealsChart.tsx — visual cleanup only, preserve all data logic
Keep all existing data fetching, useMemo, multiplier map, scaledMin/scaledMax guard, and tooltip logic exactly as-is.

Change the nivo ResponsiveBar config:

1. **Remove axisTop entirely** — delete the `axisTop` prop
2. **Remove axisRight entirely** — delete the `axisRight` prop
3. **Add axisLeft** with clean currency labels:
   ```
   axisLeft={{
     tickSize: 0,
     tickPadding: 12,
     tickValues: 5,
     format: (v: any) => {
       const abs = Math.abs(v);
       if (abs >= 1000) return `${abs / 1000}k`;
       return `${abs}`;
     },
   }}
   ```
4. **Remove markers entirely** — delete the `markers` prop
5. **Update margin** to `{ top: 10, right: 10, bottom: 30, left: 55 }` (left space for the new axisLeft)
6. **Switch grid**: set `enableGridX={false}` and `enableGridY={true}`
7. **Reduce chart height** from `h-[400px]` to `h-[280px]`
8. **Replace the header** (the TrendingUp icon + h2 section) with a header that includes a color legend:
   - Keep the icon and title in a flex row
   - Add a legend row to the RIGHT of the title row (ml-auto, flex items-center gap-4):
     - Three legend items: each is `<span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COLOR }} />{LABEL}</span>`
     - Won: color `#22C55E`, label uses existing `wonLabel`
     - Pending: color `#4AC1E0`, label "Pending"
     - Lost: color `#EF4444`, label uses existing `lostLabel`
   - Wrap the whole header in `<div className="flex items-center mb-4">`

## Verification
- Run: npx tsc --noEmit
- Expect: zero type errors
- Run: npm run build
- Expect: build completes without errors
