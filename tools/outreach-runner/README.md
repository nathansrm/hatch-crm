# Outreach Runner

Helper CLIs for the BRIEF-001 outreach drafting routine.

## Setup

```bash
npm install
npm run build
```

Dependencies are local to `tools/outreach-runner/`. Do not add runner dependencies to the repository root.

## fetch-leads

Fetches uncontacted intake leads that have an email address and no active outreach step.

```bash
SUPABASE_URL=https://example.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=service-role-key \
node dist/fetch-leads.js --max 10
```

Output is a JSON array:

```json
[
  {
    "id": "lead-id",
    "business_name": "Acme Plumbing",
    "email": "owner@example.com",
    "city": "Toronto",
    "owner_name": "Maria Lopez",
    "trade_type": "Plumbing"
  }
]
```

`--dry-run` is accepted for routine parity. `fetch-leads` never writes data, so dry-run uses the same read-only query path and output.

## upsert-step

Upserts a drafted outreach step through the Supabase Edge Function.

```bash
SUPABASE_URL=https://example.supabase.co \
INGEST_API_KEY=ingest-key \
node dist/upsert-step.js --payload '{"intake_lead_id":"00000000-0000-0000-0000-000000000001","sequence_step":1,"channel":"email","subject":"Operations audit for Acme","body":"test body","review_status":"passed","status":"ai_reviewed","run_id":"00000000-0000-0000-0000-000000000002"}'
```

If `--payload` is omitted, the CLI reads JSON from stdin.

Dry-run prints the request URL, headers, and body without making a network call:

```bash
SUPABASE_URL=http://localhost \
INGEST_API_KEY=test \
node dist/upsert-step.js --dry-run --payload '{"intake_lead_id":"00000000-0000-0000-0000-000000000001","sequence_step":1,"channel":"email"}'
```

## Tests

```bash
npm test
```
