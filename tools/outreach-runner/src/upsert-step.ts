#!/usr/bin/env node

// @ts-expect-error Node types are intentionally not a package dependency.
import { readFileSync } from 'node:fs';

declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OPTIONAL_STRING_FIELDS = [
  'subject',
  'body',
  'review_status',
  'review_feedback',
  'status',
  'run_id',
] as const;

type OptionalStringField = (typeof OPTIONAL_STRING_FIELDS)[number];
type Logger = (message: string) => void;
type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

type OutreachStepPayload = {
  intake_lead_id: string;
  sequence_step: number;
  channel: 'email';
  subject?: string;
  body?: string;
  review_status?: string;
  review_feedback?: string;
  status?: string;
  run_id?: string;
};

function getFlagValue(argv: string[], flag: string) {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readPayloadJson(argv: string[], readStdin: () => string) {
  const payload = getFlagValue(argv, '--payload');
  return payload ?? readStdin();
}

function validatePayload(raw: unknown): OutreachStepPayload {
  if (!isRecord(raw)) {
    throw new Error('payload must be a JSON object');
  }

  const intakeLeadId = raw.intake_lead_id;
  if (typeof intakeLeadId !== 'string' || !intakeLeadId.trim()) {
    throw new Error('intake_lead_id is required');
  }

  if (!UUID_REGEX.test(intakeLeadId)) {
    throw new Error('intake_lead_id must be a UUID string');
  }

  const sequenceStep = raw.sequence_step;
  if (typeof sequenceStep !== 'number' || !Number.isInteger(sequenceStep)) {
    throw new Error('sequence_step must be an integer');
  }

  if (sequenceStep < 1 || sequenceStep > 7) {
    throw new Error('sequence_step must be between 1 and 7');
  }

  if (raw.channel !== 'email') {
    throw new Error('channel must be "email"');
  }

  const payload: OutreachStepPayload = {
    intake_lead_id: intakeLeadId,
    sequence_step: sequenceStep,
    channel: 'email',
  };

  for (const field of OPTIONAL_STRING_FIELDS) {
    const value = raw[field];
    if (value === undefined) {
      continue;
    }

    if (typeof value !== 'string') {
      throw new Error(`${field} must be a string`);
    }

    payload[field as OptionalStringField] = value;
  }

  return payload;
}

function getConfig(env: Record<string, string | undefined>) {
  const supabaseUrl = env.SUPABASE_URL;
  const ingestApiKey = env.INGEST_API_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required');
  }

  if (!ingestApiKey) {
    throw new Error('INGEST_API_KEY is required');
  }

  return {
    url: `${supabaseUrl.replace(/\/$/, '')}/functions/v1/upsert-outreach-step`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ingestApiKey,
    },
  };
}

async function parseResponseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function runUpsertStep(
  argv: string[],
  env: Record<string, string | undefined>,
  stdout: Logger = console.log,
  stderr: Logger = console.error,
  readStdin: () => string = () => readFileSync(0, 'utf8'),
  fetchImpl: FetchLike = fetch
) {
  try {
    const payload = validatePayload(JSON.parse(readPayloadJson(argv, readStdin)));
    const { url, headers } = getConfig(env);

    if (argv.includes('--dry-run')) {
      stdout(JSON.stringify({ url, headers, body: payload }));
      return 0;
    }

    const response = await fetchImpl(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.status !== 200) {
      const errorBody = await response.text();
      stderr(`upsert-outreach-step failed: HTTP ${response.status}${errorBody ? ` ${errorBody}` : ''}`);
      return 1;
    }

    stdout(JSON.stringify(await parseResponseJson(response)));
    return 0;
  } catch (error) {
    stderr(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1]?.endsWith('upsert-step.js') || process.argv[1]?.endsWith('upsert-step.ts')) {
  runUpsertStep(process.argv, process.env).then((code) => process.exit(code));
}
