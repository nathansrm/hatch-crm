# Outreach Validator Contract

This package validates cold outreach email drafts before they are upserted to the
`outreach_steps` table. Validation is deterministic and all rules run on every
call, collecting every reason instead of stopping at the first failure.

## Input

The validator accepts a draft with `subject` and `body`, plus a lead with
`business_name` and optional `city`, `owner_name`, and `trade_type`.

## Rules

1. Body word count must be 80-110 words inclusive. The count is computed with
   `body.trim().split(/\s+/).filter(Boolean).length`. If it fails, the reason is
   `word count: N (must be 80–110)`.

2. The subject and body must not contain the em dash character `—` (U+2014). If
   either field contains it, the reason is `em dash not allowed`.

3. The subject and body must not contain the en dash character `–` (U+2013). If
   either field contains it, the reason is `en dash not allowed`.

4. The combined subject and body must not contain any banned word. Matching is
   case-insensitive and uses whole-word `\b` regex boundaries. Each hit reports
   `banned word: <word>`.

```typescript
export const BANNED_WORDS: readonly string[] = [
  'leverage', 'synergy', 'optimize', 'streamline', 'revolutionize',
  'cutting-edge', 'game-changer', 'bandwidth', 'digital transformation',
  'ai-powered', 'unlock growth', 'operational excellence', 'advanced',
  'solution', 'platform', 'system', 'tool', 'software',
  'supercharge', 'empower', 'holistic', 'scalable', 'best-in-class',
  'innovative', 'disruptive', 'next-gen', 'world-class', 'turnkey'
];
```

5. The subject must match exactly `Operations audit for ${lead.business_name}`.
   The prefix is `Operations audit for ` and the suffix must equal
   `lead.business_name` verbatim, case-sensitive. If it fails, the reason is
   `subject must be exactly 'Operations audit for ${lead.business_name}'`.

6. The body must contain at least one case-insensitive substring of at least
   four characters that matches a non-null, non-undefined lead field from
   `business_name`, `city`, `owner_name`, or `trade_type`. If it fails, the
   reason is
   `personalization: body must reference business_name, city, owner_name, or trade_type`.
