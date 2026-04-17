# Mobile Dashboard Reference
> What was built in Waves 1–3 on desktop. Use this as the spec when implementing MobileDashboard.tsx.

## Overview
Desktop dashboard was restructured from 2 tabs (Pipeline / Delivery) into 3 tabs:
1. **Dashboard** — high-level overview
2. **Sales** — Nathan's daily ops view
3. **Delivery** — Luca's delivery operating view

Mobile should replicate these three screens as separate pages/routes or a bottom-nav structure (not tabs — tabs are too small on mobile).

---

## Tab 1: Dashboard

**Component:** `DashboardOverview` inside `Dashboard.tsx`

**Layout (desktop):** Page header → KPI cards → [Chart + Trade Type] → [Activity Log + Tasks]

**Sections and components:**
- Page header: "Dashboard" h1 + "Pipeline overview, activity, and upcoming tasks." subtitle
- `<KPICards variant="overview" />` — 4 cards: Pipeline Value, Deals Won, Win Rate, Overdue Tasks
- `<DealsChart />` wrapped in Card — bar chart of won/pending/lost revenue by month (last 6 months)
- `<DealsByTradeType />` — breakdown of deals by trade type
- `<DashboardActivityLog />` — recent CRM activity feed
- `<TasksList />` (default variant) — upcoming tasks list

**Mobile notes:**
- Drop DealsChart entirely or replace with a simple 3-number summary (Won / Pending / Lost totals)
- Stack all sections single-column
- KPI cards: 2×2 grid works on mobile

---

## Tab 2: Sales

**Component:** `SalesDashboardContent` inside `Dashboard.tsx`

**Layout (desktop):** Urgency strip (3 cards) → KPI cards → [Pipeline bars + Stale Deals] → [Tasks + Hot Contacts]

**Sections and components:**

### Urgency Strip
- 3 equal-width cards in a row, each with a colored left border
- **Stale Deals** (red if > 0, green if 0): count of active deals where `getDealDecayLevel(deal) !== "none"`
- **Overdue Tasks** (red if > 0, green if 0): count of tasks where `due_date < today` and `done_date === null` and `sales_id === identity.id`
- **Follow-ups Due** (amber if > 0, green if 0): count of tasks where `due_date === today`
- Data: `useGetList("deals", { filter: { "archived_at@is": null } })` and `useGetList("tasks", { filter: { "done_date@is": null", sales_id: identity.id } })`

### KPI Cards (sales variant)
- `<KPICards variant="sales" />` — same 4 cards as overview but with trend delta badges below each number:
  - Pipeline Value → "X active deals"
  - Deals Won → "+X won"
  - Win Rate → "X closed"
  - Overdue Tasks → "Needs attention" (if > 0) or "All clear"

### Pipeline Summary (bars variant)
- `<PipelineSummary variant="bars" />` — horizontal bar per stage, width proportional to deal count
- Each row: stage label | bar | deal count | deal value
- Colors from `stageColorMap` in `deals/stageColors.ts`

### Stale Deals
- `<StaleDeals />` — table of deals with no recent activity
- Columns: Name | Stage | Last Activity | Value | Days Stale
- "Last Activity" shows "{days}d ago"

### Tasks (sales variant)
- `<TasksList variant="sales" />` — tasks split into two sections:
  - **TODAY** (label in muted text): tasks where `due_date === today`
  - **OVERDUE** (label in destructive red): tasks where `due_date < today`
  - Filtered by `sales_id === identity.id`, only undone tasks
  - Empty state if both sections empty

### Hot Contacts
- `<HotContacts />` — list of contacts with engagement status chip
- Chip mapping: `contact.status === "hot"` → red "Hot", `"warm"` → amber "Warm", anything else → slate "Cooling"

**Mobile notes:**
- Urgency strip: stack vertically (3 rows) instead of 3 columns
- KPI cards: 2×2 grid
- Pipeline bars: works well on mobile as-is
- Stale Deals: simplify table — show Name + Days Stale only, tap to expand
- Tasks TODAY/OVERDUE: works well on mobile
- Hot Contacts: works well on mobile

---

## Tab 3: Delivery

**Component:** `DeliveryDashboard.tsx` + widgets in `dashboard/widgets/`

**Layout (desktop):** Page header → KPI cards → Handoff Queue → Capacity Panel → Active Projects → Tasks

**Sections and components:**

### Page Header
- "Delivery Dashboard" h1 + "Handoff queue, active project load, and capacity." subtitle

### Delivery KPIs
- `<DeliveryKPIs />` — 3 cards with colored left borders:
  1. **Deals Pending Handoff** (amber border): won deals where `project_status === null`
  2. **Active Projects** (blue border): deals where `project_status` in `["on_track", "at_risk", "behind"]`
  3. **Capacity Utilization** (green/amber/red based on %): total `projected_hours` / 40h weekly capacity

### Handoff Queue
- `<HandoffQueue />` — card per pending handoff deal (won, not yet started)
- Each card: company name + deal name | "Start Onboarding" button
- Metric strip: Deal Value | Won Date | Sales person name
- "Start Onboarding" → `window.prompt` for projected hours → writes `project_started_at` + `project_status` to deal

### Capacity Panel
- `<CapacityPanel />` — table of active project deals
- Columns: Deal | Value | Status | Projected Hours
- Summary row: total projected hours vs 40h capacity (red if over, green if under)
- Status badges: On Track (emerald) / At Risk (amber) / Behind (red)

### Active Projects Grid
- `<ActiveProjectsGrid />` — 2-column grid of project cards
- Each card: company name + deal name | status badge | progress bar | "X% complete" + started date

### Tasks
- `<TasksList variant="sales" />` — delivery tasks split TODAY / OVERDUE

**Mobile notes:**
- KPI cards: stack to 1-column or 3-column depending on screen width
- Handoff Queue cards: full-width, works well on mobile
- Capacity Panel: simplify table — show deal name + hours, drop value column
- Active Projects: 1-column grid on mobile
- "Start Onboarding" button: make it full-width on mobile

---

## Data Dependencies Summary

| Resource | Used by |
|----------|---------|
| `deals` | All three tabs |
| `tasks` | Sales urgency strip, Sales tasks, Delivery tasks |
| `contacts` | Hot Contacts |
| `companies` | Handoff Queue, Capacity Panel, Active Projects |
| `sales` | Handoff Queue (sales person name lookup) |
| `contact_notes` | Dashboard stepper gate |

## Key Utilities
- `getDealDecayLevel(deal)` from `deals/dealUtils.ts` — returns decay level for stale deal detection
- `stageColorMap` from `deals/stageColors.ts` — stage → `{ text, bg, border }` color classes
- `useGetIdentity()` from `ra-core` — gets current user ID for task filtering
- `calcUtilization(deals, weeklyCapacity)` exported from `widgets/DeliveryKPIs.tsx`
