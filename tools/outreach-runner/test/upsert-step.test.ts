import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { runUpsertStep } from '../src/upsert-step.ts';

const env = {
  SUPABASE_URL: 'http://localhost',
  INGEST_API_KEY: 'ingest-key',
};

const validPayload = {
  intake_lead_id: '00000000-0000-0000-0000-000000000001',
  sequence_step: 1,
  channel: 'email',
  subject: 'Operations audit for Acme',
  body: 'test body',
  status: 'ai_reviewed',
  review_status: 'passed',
};

function payloadArg(payload: Record<string, unknown>) {
  return ['node', 'upsert-step.js', '--payload', JSON.stringify(payload)];
}

test('valid payload posts to edge function with api key header', async (t) => {
  t.after(() => mock.restoreAll());
  const requests: { url: string; init: RequestInit }[] = [];
  mock.method(globalThis, 'fetch', async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ id: 'step-1', status: 'ai_reviewed' }), { status: 200 });
  });
  const stdout: string[] = [];
  const stderr: string[] = [];

  const code = await runUpsertStep(
    payloadArg(validPayload),
    env,
    (message) => stdout.push(message),
    (message) => stderr.push(message),
    () => ''
  );

  assert.equal(code, 0);
  assert.deepEqual(stderr, []);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'http://localhost/functions/v1/upsert-outreach-step');
  assert.equal(requests[0].init.method, 'POST');
  assert.deepEqual(requests[0].init.headers, {
    'Content-Type': 'application/json',
    'x-api-key': 'ingest-key',
  });
  assert.deepEqual(JSON.parse(String(requests[0].init.body)), validPayload);
  assert.deepEqual(JSON.parse(stdout[0]), { id: 'step-1', status: 'ai_reviewed' });
});

test('--dry-run prints request JSON and does not call fetch', async (t) => {
  t.after(() => mock.restoreAll());
  let fetchCalled = false;
  mock.method(globalThis, 'fetch', async () => {
    fetchCalled = true;
    return new Response('{}', { status: 200 });
  });
  const stdout: string[] = [];
  const stderr: string[] = [];

  const code = await runUpsertStep(
    ['node', 'upsert-step.js', '--dry-run', '--payload', JSON.stringify(validPayload)],
    env,
    (message) => stdout.push(message),
    (message) => stderr.push(message),
    () => ''
  );

  assert.equal(code, 0);
  assert.equal(fetchCalled, false);
  assert.deepEqual(stderr, []);
  assert.deepEqual(JSON.parse(stdout[0]), {
    url: 'http://localhost/functions/v1/upsert-outreach-step',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'ingest-key',
    },
    body: validPayload,
  });
});

test('missing intake_lead_id exits 1 before making any network call', async (t) => {
  t.after(() => mock.restoreAll());
  let fetchCalled = false;
  mock.method(globalThis, 'fetch', async () => {
    fetchCalled = true;
    return new Response('{}', { status: 200 });
  });
  const stdout: string[] = [];
  const stderr: string[] = [];

  const code = await runUpsertStep(
    payloadArg({ sequence_step: 1, channel: 'email' }),
    env,
    (message) => stdout.push(message),
    (message) => stderr.push(message),
    () => ''
  );

  assert.equal(code, 1);
  assert.equal(fetchCalled, false);
  assert.deepEqual(stdout, []);
  assert.match(stderr[0], /intake_lead_id is required/);
});

test('run_id is present in the POST body when provided', async (t) => {
  t.after(() => mock.restoreAll());
  const requestBodies: unknown[] = [];
  mock.method(globalThis, 'fetch', async (_url: string | URL | Request, init?: RequestInit) => {
    requestBodies.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
  const payload = {
    ...validPayload,
    run_id: '00000000-0000-0000-0000-000000000002',
  };

  const code = await runUpsertStep(
    payloadArg(payload),
    env,
    () => undefined,
    () => undefined,
    () => ''
  );

  assert.equal(code, 0);
  assert.deepEqual(requestBodies, [payload]);
});
