# Hatch CRM Audit Report

Audit date: 2026-04-19
Branch: `feat/code-quality-guardrails`
Scope reviewed: `src/`, `supabase/functions/send-resource/`, `supabase/migrations/20260419222440_add_resources_table.sql`
Reference files: `package.json`, `vite.config.ts`, `tsconfig.app.json`

## Summary

| Severity | Count |
| --- | ---: |
| P0 | 0 |
| P1 | 2 |
| P2 | 10 |
| P3 | 2 |

## Verification

- Reviewed the branch diff against `main` for the recent dashboard/resources/function/migration changes.
- Ran `npm run typecheck`: failed with 3 TypeScript errors in `src/components/admin/app-sidebar.tsx`, `src/components/atomic-crm/deals/DealList.tsx`, and `src/test/StoryWrapper.tsx`.
- Ran `npm run lint`: completed with 418 warnings, including a `max-lines` warning on `src/components/atomic-crm/resources/ResourcesPage.tsx`.

## Detailed Findings

### Resources Page

#### R-01 [P1] Upload/create uses the sales record id where the database and storage policy require the auth user UUID
Files: `src/components/atomic-crm/resources/ResourcesPage.tsx:181-185`, `src/components/atomic-crm/resources/ResourcesPage.tsx:221-257`, `src/components/atomic-crm/providers/supabase/authProvider.ts:16-20`, `src/components/atomic-crm/providers/supabase/authProvider.ts:70-74`

Issue: `ResourcesPage` takes `identity.id` from `useGetIdentity()` and reuses it as both `resources.user_id` and the first folder segment in the storage path. In the Supabase auth provider, `identity.id` is the numeric `sales.id`, not `auth.users.id`. The migration defines `resources.user_id` as `uuid references auth.users(id)`, and the storage policy compares the folder segment to `auth.uid()`.

Impact: Real uploads are broken on the live backend. Storage writes will fail RLS because the folder name is a sales id instead of the auth UUID, and even if storage succeeded the row insert would fail with an invalid UUID for `user_id`.

Fix: Use the authenticated Supabase user id for both the DB row and storage path, or expose both `sales.id` and `auth.users.id` separately in identity/meta and use the UUID for resource ownership.

#### R-02 [P2] Resources actions bypass the data provider and break the advertised FakeRest/demo workflow
Files: `src/components/atomic-crm/resources/ResourcesPage.tsx:15`, `src/components/atomic-crm/resources/ResourcesPage.tsx:233-235`, `src/components/atomic-crm/resources/ResourcesPage.tsx:315-347`, `src/components/atomic-crm/root/CRM.tsx:40-48`, `vite.demo.config.ts:27-33`

Issue: The app explicitly supports demo mode via FakeRest, but `ResourcesPage` calls `getSupabaseClient()` directly for storage uploads, signed URLs, and `send-resource` invocations instead of going through the current data provider or a demo-safe abstraction.

Impact: In `make start-demo`, the page renders but upload/copy/send still target the dummy Supabase URL/key from `vite.demo.config.ts`, so core actions fail instead of behaving like the rest of the demo app.

Fix: Route resource mutations through the provider layer with demo stubs, or gate/disable the page actions when `VITE_IS_DEMO === "true"`.

#### R-03 [P2] The page silently drops any resources after the first 200 records
Files: `src/components/atomic-crm/resources/ResourcesPage.tsx:182-185`, `src/components/atomic-crm/resources/ResourcesPage.tsx:194-205`, `src/components/atomic-crm/resources/ResourcesPage.tsx:605-649`

Issue: The page fetches a single page of 200 resources and performs all search/filter/star sections client-side on that truncated array. There is no pagination, infinite scrolling, or server-side search follow-up.

Impact: Once a user has more than 200 resources, older rows disappear from the UI and from search results with no indication that the dataset is incomplete.

Fix: Add explicit pagination/load-more behavior, or move search/filtering server-side and page through the full collection.

#### R-04 [P3] `ResourcesPage` is an untyped 1300-line mixed-responsibility component
Files: `src/components/atomic-crm/resources/ResourcesPage.tsx:99`, `src/components/atomic-crm/resources/ResourcesPage.tsx:146`, `src/components/atomic-crm/resources/ResourcesPage.tsx:170`, `src/components/atomic-crm/resources/ResourcesPage.tsx:1077`, `src/components/atomic-crm/resources/ResourcesPage.tsx:1212-1369`

Issue: The file mixes data mapping, fetching, storage mutations, send modal logic, edit flow, detail pane rendering, and card rendering in one component, while also relying on multiple `any` escape hatches.

Impact: The component is hard to review, hard to test, and easy to regress. The current lint output already flags it for excessive file size, and the loose typing makes future mistakes harder for `tsc` to catch.

Fix: Split the file into typed hooks/components for resource loading, upload/send mutations, list/card rendering, and the send modal; replace `any` with concrete DTO types.

### Edge Function / Resource Migration

#### F-01 [P1] `send-resource` bypasses row ownership and can send another user's private file
Files: `supabase/functions/send-resource/index.ts:62-79`, `supabase/functions/send-resource/index.ts:84-105`, `supabase/migrations/20260419222440_add_resources_table.sql:21-22`

Issue: The function uses the service-role client to fetch `resources` by `id` only, then downloads and emails the file. The table itself tracks ownership via `user_id`, but the function never verifies that the caller owns the requested resource.

Impact: Any authenticated caller who learns or guesses another resource UUID can use the function to email that private attachment to an arbitrary recipient, bypassing the table RLS policy entirely.

Fix: Validate the caller identity from the JWT, then scope the query to both `id` and `user_id`, or use a user-scoped Supabase client so RLS continues to enforce ownership.

#### F-02 [P2] The outbound email body is HTML-injected from raw user input and attachments have no size/type guard
Files: `supabase/functions/send-resource/index.ts:84-103`, `supabase/functions/send-resource/index.ts:116-124`, `src/components/atomic-crm/resources/ResourcesPage.tsx:1201-1206`

Issue: `HtmlBody` is built by directly interpolating `message` into HTML after only replacing newlines, and the function downloads the full file into memory and base64-encodes it with no attachment size/type validation. The upload control also accepts `*/*`.

Impact: Users can inject arbitrary HTML into outbound emails, and large or unsupported files can cause edge-function memory spikes, provider-side rejection, or slow failures during send.

Fix: HTML-escape the message before generating `HtmlBody` or rely on `TextBody` only, and enforce strict file size/type limits before upload/send with a link fallback for large files.

#### DB-01 [P2] The migration updates only the generated migration, not the declarative schema source of truth
Files: `supabase/migrations/20260419222440_add_resources_table.sql:1-30`, `supabase/schemas/01_tables.sql:13-365`, `supabase/schemas/05_policies.sql:7-122`, `supabase/schemas/06_grants.sql:65-189`, `supabase/schemas/07_storage.sql:7-9`

Issue: The repo contract says `supabase/schemas/` is the source of truth, but `resources` exists only in the one-off migration. There is no matching table declaration, RLS policy declaration, grant declaration, or storage policy declaration in the schema files.

Impact: The next schema dump/diff can reintroduce phantom diffs or try to undo/recreate the resources objects, which is exactly the drift this repo's DB workflow is designed to avoid.

Fix: Add the resources table, policies, grants, and storage rules to the appropriate `supabase/schemas/*.sql` files, then regenerate/normalize the migration history from the declarative state.

### Dashboard / Layout

#### UI-01 [P2] The header's Pipeline Live widget is hardcoded to fake numbers
Files: `src/components/atomic-crm/layout/Header.tsx:170-214`

Issue: The chrome shows `Pipeline Live` with a fixed `$847.3K` and `+12.4%` instead of deriving anything from dashboard data.

Impact: Users are shown fabricated live business metrics in a prominent global location, which undermines trust in the rest of the dashboard.

Fix: Compute the header metric from the same query/view used by the dashboard widgets, or remove the widget until it has a real data source.

#### D-01 [P2] Multiple dashboard widgets silently undercount once the dataset grows past their hard page limits
Files: `src/components/atomic-crm/dashboard/DealsChart.tsx:33-42`, `src/components/atomic-crm/dashboard/PipelineSummary.tsx:17-19`, `src/components/atomic-crm/dashboard/StaleDeals.tsx:13-17`, `src/components/atomic-crm/dashboard/widgets/DashboardOverview.tsx:20-28`, `src/components/atomic-crm/dashboard/widgets/dashboardUtils.ts:18-23`

Issue: The widgets compute totals and KPIs from first-page fetches only: 100 deals in `DealsChart`, 500 deals in `PipelineSummary`, 100 stale deals, 500 tasks for the attention count, and 10,000 deals for the shared KPI cards.

Impact: The dashboard starts reporting incorrect counts, values, and charts as the account grows, and the failure mode is silent because nothing indicates the data was truncated.

Fix: Move these KPIs to server-side aggregate queries/views, or page through the full dataset explicitly before computing totals.

#### D-02 [P2] Recent dashboard widgets hardcode pipeline stage keys instead of using the CRM's configurable stage model
Files: `src/components/atomic-crm/dashboard/widgets/ObsHeroPipeline.tsx:15-20`, `src/components/atomic-crm/dashboard/widgets/ObsAttentionRow.tsx:23-35`, `src/components/atomic-crm/dashboard/DealsChart.tsx:11-16`

Issue: The new widgets assume literal stages like `lead`, `qualified`, `audit-scheduled`, and `proposal-sent`. The app architecture explicitly allows `dealStages` customization, but these widgets only understand the built-in stage ids.

Impact: Any deployment that customizes the deal pipeline will get incomplete strips, wrong pending-value math, or missing stale-proposal insights even though the rest of the CRM supports custom stages.

Fix: Derive the stage set and any weighting/ordering from configuration context instead of embedding literal stage ids inside each widget.

#### D-03 [P3] Mojibake is still visible in shipped dashboard/resource strings
Files: `src/components/atomic-crm/dashboard/widgets/ObsHeroPipeline.tsx:287`, `src/components/atomic-crm/dashboard/widgets/ObsAttentionRow.tsx:141`, `src/components/atomic-crm/dashboard/widgets/ObsKPIWinRate.tsx:111`, `src/components/atomic-crm/dashboard/StaleDeals.tsx:171`, `src/components/atomic-crm/resources/ResourcesPage.tsx:1361`, `src/components/atomic-crm/providers/fakerest/dataGenerator/index.ts:68`

Issue: Several recently touched files still contain garbled UTF-8 punctuation where a middle dot or em dash should appear.

Impact: The UI and demo seed data look visibly broken, especially in the new dashboard/resource surfaces this branch is trying to polish.

Fix: Re-save the affected files as UTF-8 and replace the corrupted literals with the intended punctuation or plain ASCII equivalents.

### Type Safety / Build Health

#### TS-01 [P2] `app-sidebar.tsx` fails typecheck because `key` is passed twice
Files: `src/components/admin/app-sidebar.tsx:15-23`, `src/components/admin/app-sidebar.tsx:159-160`

Issue: `NAV_ITEMS` includes a `key` field, and the render path passes both `key={item.key}` and `{...item}` into `NavItem`. TypeScript flags that duplicate prop assignment.

Impact: `npm run typecheck` is red, so the code-quality branch already fails one of its own primary guardrails.

Fix: Destructure `key` out before spreading or stop including `key` in the props object passed to `NavItem`.

#### TS-02 [P2] `DealList.tsx` currently breaks `tsc` on `data?.length`
Files: `src/components/atomic-crm/deals/DealList.tsx:70-72`

Issue: `useListContext()` is untyped here, and the `total ?? data?.length ?? 0` expression is currently inferred in a way that produces `Property 'length' does not exist on type 'never'`.

Impact: Typecheck fails, which blocks safe refactors and makes it easier for real regressions to land unnoticed.

Fix: Call `useListContext<Deal>()` or narrow `data` explicitly before reading `.length`.

#### TS-03 [P2] `StoryWrapper.tsx` passes an unsupported `disableTelemetry` prop to `CRM`
Files: `src/test/StoryWrapper.tsx:109-116`, `src/components/atomic-crm/root/CRM.tsx:87-95`, `src/components/atomic-crm/root/CRM.tsx:228-238`

Issue: `CRMProps` does not declare `disableTelemetry`, but the story/test wrapper still passes it.

Impact: The test/story harness no longer typechecks, so UI verification code is now out of sync with the actual component contract.

Fix: Remove the extra prop from `StoryWrapper`, or add it to `CRMProps` if it is meant to remain externally configurable.
