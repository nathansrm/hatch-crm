# Outreach Validator

Standalone deterministic TypeScript validator for cold outreach email drafts.
It has no runtime dependencies and does not depend on React, ra-core, or
Supabase.

## Install

```bash
npm install
```

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

## CLI

```bash
node dist/cli.js --input <draft.json> --lead <lead.json>
```

The input file must contain:

```json
{ "subject": "Operations audit for Acme Plumbing", "body": "..." }
```

The lead file must contain:

```json
{ "business_name": "Acme Plumbing", "city": "Denver" }
```

The CLI prints a `ValidationResult` JSON object to stdout. It exits `0` when
`pass` is `true`, exits `1` when `pass` is `false`, and exits `2` on missing
arguments or file-read errors.
