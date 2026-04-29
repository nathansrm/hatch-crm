You are on branch: feat/dashboard-redesign — do NOT switch branches or create new branches.
Repository root: C:/Users/natha/hatch-crm

## Goal
Restructure the CRM dashboard from two tabs (Pipeline / Delivery) into three tabs: **Dashboard**, **Sales**, and **Delivery**. Redesign the Dashboard and Sales tabs with a richer, more polished layout. Leave the Delivery tab component wiring in place but do not redesign it yet (Wave 2 handles that).

The three tabs:
1. **Dashboard** — General overview. Simpler, higher-level. Shows: 4 KPI cards (Pipeline Value, Deals Won, Win Rate, Overdue Tasks), Deal Revenue bar chart, Deals by Trade Type panel, Latest Activity feed, Upcoming Tasks list.
2. **Sales** — Nathan's daily ops view. Richer, action-oriented. Shows: 4 KPI cards with trend delta badges, a 3-column urgency alert strip at the top (Stale Deals count / Overdue Tasks count / Follow-ups Due today), Pipeline Summary as horizontal stage bars with count + value, Stale Deals table with a Last Activity text column added, Tasks panel split into TODAY and OVERDUE sections, Hot Contacts list with an engagement status chip (Hot / Warm / Cooling).
3. **Delivery** — Keep existing `<DeliveryDashboard />` component, no changes to it.

## Scope
- Edit:
  - src/components/hatch-crm/dashboard/Dashboard.tsx
  - src/components/hatch-crm/dashboard/KPICards.tsx
  - src/components/hatch-crm/dashboard/StaleDeals.tsx
  - src/components/hatch-crm/dashboard/TasksList.tsx
  - src/components/hatch-crm/dashboard/HotContacts.tsx
  - src/components/hatch-crm/dashboard/PipelineSummary.tsx
- Reference only (do not edit):
  - src/components/hatch-crm/dashboard/DealsChart.tsx
  - src/components/hatch-crm/dashboard/DealsByTradeType.tsx
  - src/components/hatch-crm/dashboard/DashboardActivityLog.tsx
  - src/components/hatch-crm/dashboard/ActionQueue.tsx
  - src/components/hatch-crm/dashboard/DeliveryDashboard.tsx
  - src/components/hatch-crm/root/ConfigurationContext.tsx
  - src/components/hatch-crm/types.ts
- Do not touch: everything else

## Requirements

### Dashboard.tsx
- Replace the two-tab structure (pipeline / delivery) with three tabs: value="dashboard", value="sales", value="delivery"
- Tab labels: "Dashboard" | "Sales" | "Delivery"
- Default tab: "dashboard"
- Update localStorage key and URL param handling to support the new "dashboard" default value
- `DashboardOverview` component renders the Dashboard tab: KPICards (pass prop variant="overview"), DealsChart (inside a Card), DealsByTradeType, DashboardActivityLog, TasksList
- `SalesDashboardContent` component renders the Sales tab: UrgencyStrip at top, KPICards (pass prop variant="sales"), PipelineSummary (pass prop variant="bars"), StaleDeals, TasksList (pass prop variant="sales"), HotContacts
- `DeliveryDashboard` renders the Delivery tab (no change to its internals)

### KPICards.tsx
- Accept an optional prop `variant?: "overview" | "sales"` (default "overview")
- In "overview" variant: render exactly as today (4 cards: Pipeline Value, Deals Won, Win Rate, Overdue Tasks)
- In "sales" variant: render the same 4 cards PLUS a small trend badge on each. Trend badges: under Pipeline Value show active deal count ("X active deals"), under Deals Won show "+X won" using the dealsWon count, under Win Rate show "X closed" using closedDeals count, under Overdue Tasks show "Needs attention" if overdueTasks > 0 else "All clear". Style the badge as a small muted text line below the main number.

### StaleDeals.tsx
- Add a "Last Activity" column to the table between the Stage and Value columns
- Display as "{days}d ago" using the existing `days` value already computed in the component
- Column order: Name | Stage | Last Activity | Value | Days Stale

### TasksList.tsx
- Accept an optional prop `variant?: "default" | "sales"` (default "default")
- In "default" variant: render exactly as today (unchanged)
- In "sales" variant: fetch tasks using useGetList from "tasks" with filter done_date null, sort by due_date ASC. Split into two groups:
  - TODAY: tasks where due_date date portion equals today's date
  - OVERDUE: tasks where due_date < today
  - Render each group under a small ALL-CAPS section label ("TODAY" in text-muted-foreground, "OVERDUE" in text-destructive)
  - Each task row: checkbox-style indicator (not interactive, just visual), task text, due date
  - If both groups empty, show a brief empty state message
  - Use useGetIdentity to get identity.id and filter by sales_id: identity?.id

### HotContacts.tsx
- Add an engagement status chip to the rightmost position of each contact row in the SimpleList
- Map contact.status to chip: "hot" → red chip ("Hot"), "warm" → amber chip ("Warm"), any other value → slate chip ("Cooling")
- Chip style: text-xs font-medium px-2 py-0.5 rounded-full inline-block
- The SimpleList renders via primaryText/secondaryText callbacks — add the chip as part of a wrapper or use the existing list item structure. If SimpleList does not support right-side content natively, render the contacts as a plain list instead of using SimpleList for the sales variant.

### PipelineSummary.tsx
- Accept an optional prop `variant?: "grid" | "bars"` (default "grid")
- In "grid" variant: render exactly as today
- In "bars" variant: render each active stage as a horizontal bar row. Layout per row:
  - Stage label on the left (text-sm font-medium), colored using stageColorMap[stage.value]?.text
  - A horizontal bar in the middle, width proportional to (stage count / total deals * 100)%, filled with stageColorMap[stage.value]?.bg, bordered with stageColorMap[stage.value]?.border, height h-2, rounded-full
  - Deal count on the right (text-sm font-semibold)
  - Amount on the far right (text-xs text-muted-foreground)
  - Sort rows by dealStages config order

### UrgencyStrip (inline in Dashboard.tsx inside SalesDashboardContent)
- A row of 3 equal-width cards using grid grid-cols-3 gap-4
- Fetch deals with filter archived_at@is null using useGetList in SalesDashboardContent
- Fetch tasks with filter done_date@is null and sales_id: identity?.id using useGetList
- Card 1 "Stale Deals": count deals where stage not in ["won","lost"] and getDealDecayLevel !== "none". Left border: border-l-4, red if count > 0 else green.
- Card 2 "Overdue Tasks": count tasks where due_date < today. Left border: red if count > 0 else green.
- Card 3 "Follow-ups Due": count tasks where due_date date portion equals today. Left border: amber if count > 0 else green.
- Each card: p-4, flex items-center gap-3, icon (AlertTriangle / Clock / Calendar from lucide-react), large bold number (text-2xl font-bold), label below (text-sm text-muted-foreground)

## Pattern References
- Follow existing Tailwind + shadcn/ui patterns throughout the dashboard components
- Use Badge from @/components/ui/badge, Card from @/components/ui/card
- Use lucide-react for icons
- stageColorMap from src/components/hatch-crm/deals/stageColors.ts
- getDealDecayLevel from src/components/hatch-crm/deals/dealUtils.ts

## Verification
- Run: npx tsc --noEmit
- Expect: zero type errors
- Run: npm run build
- Expect: build completes without errors
