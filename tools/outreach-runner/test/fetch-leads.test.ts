import assert from "node:assert/strict";
import test, { mock } from "node:test";
import type * as FetchLeadsExports from "../src/fetch-leads.ts";

type QueryResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};

type QueryCall = {
  method: string;
  args: readonly unknown[];
};

type TableCalls = Record<string, QueryCall[]>;
type FetchLeadsModule = typeof FetchLeadsExports;
type ModuleMock = {
  module?: (
    specifier: string,
    options: { namedExports: Record<string, unknown> },
  ) => unknown;
  restoreAll: () => void;
};

function makeBuilder(result: QueryResult, calls: QueryCall[]) {
  const builder = {
    select(...args: readonly unknown[]) {
      calls.push({ method: "select", args });
      return builder;
    },
    eq(...args: readonly unknown[]) {
      calls.push({ method: "eq", args });
      return builder;
    },
    not(...args: readonly unknown[]) {
      calls.push({ method: "not", args });
      return builder;
    },
    neq(...args: readonly unknown[]) {
      calls.push({ method: "neq", args });
      return builder;
    },
    in(...args: readonly unknown[]) {
      calls.push({ method: "in", args });
      return builder;
    },
    order(...args: readonly unknown[]) {
      calls.push({ method: "order", args });
      return builder;
    },
    then<TResult1 = QueryResult, TResult2 = never>(
      onfulfilled?:
        | ((value: QueryResult) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null,
    ) {
      return Promise.resolve(result).then(onfulfilled, onrejected);
    },
  };

  return builder;
}

async function runWithRows(
  leads: unknown[],
  steps: unknown[],
  max = "10",
): Promise<{
  code: number;
  stdout: string[];
  stderr: string[];
  calls: TableCalls;
}> {
  const calls: TableCalls = {};
  const createClient = () => ({
    from(table: string) {
      calls[table] = [];
      const result =
        table === "intake_leads"
          ? { data: leads, error: null }
          : { data: steps, error: null };
      return makeBuilder(result, calls[table]);
    },
  });
  const moduleMock = mock as ModuleMock;

  const mod = await import(
    `../src/fetch-leads.ts?case=${Date.now()}-${Math.random()}`
  );

  if (typeof moduleMock.module === "function") {
    moduleMock.module("@supabase/supabase-js", {
      namedExports: { createClient },
    });
  } else {
    (mod as FetchLeadsModule).setCreateClientForTest(createClient);
  }

  const stdout: string[] = [];
  const stderr: string[] = [];
  const code = await mod.runFetchLeads(
    ["node", "fetch-leads.js", "--max", max],
    {
      SUPABASE_URL: "http://localhost",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
    },
    (message: string) => stdout.push(message),
    (message: string) => stderr.push(message),
  );

  (mod as FetchLeadsModule).setCreateClientForTest(null);
  moduleMock.restoreAll();

  return { code, stdout, stderr, calls };
}

test("happy path returns flattened lead rows", async () => {
  const { code, stdout, stderr, calls } = await runWithRows(
    [
      {
        id: "lead-1",
        business_name: "Acme Plumbing",
        email: "owner@example.com",
        city: "Toronto",
        metadata: { owner_name: "Maria Lopez" },
        created_at: "2026-04-01T00:00:00Z",
        trade_types: { name: "Plumbing" },
      },
    ],
    [],
  );

  assert.equal(code, 0);
  assert.deepEqual(stderr, []);
  assert.deepEqual(JSON.parse(stdout[0]), [
    {
      id: "lead-1",
      business_name: "Acme Plumbing",
      email: "owner@example.com",
      city: "Toronto",
      owner_name: "Maria Lopez",
      trade_type: "Plumbing",
    },
  ]);
  assert.deepEqual(
    calls.intake_leads.map((call) => call.method),
    ["select", "eq", "not", "neq", "order"],
  );
  assert.deepEqual(
    calls.outreach_steps.map((call) => call.method),
    ["select", "in"],
  );
});

test("email filter excludes null and empty email values", async () => {
  const { code, stdout } = await runWithRows(
    [
      {
        id: "lead-1",
        business_name: "Null Email",
        email: null,
        city: null,
        metadata: null,
        created_at: "2026-04-01T00:00:00Z",
        trade_types: null,
      },
      {
        id: "lead-2",
        business_name: "Empty Email",
        email: "",
        city: null,
        metadata: null,
        created_at: "2026-04-02T00:00:00Z",
        trade_types: null,
      },
      {
        id: "lead-3",
        business_name: "Valid Email",
        email: "valid@example.com",
        city: null,
        metadata: null,
        created_at: "2026-04-03T00:00:00Z",
        trade_types: null,
      },
    ],
    [],
  );

  assert.equal(code, 0);
  assert.deepEqual(
    JSON.parse(stdout[0]).map((lead: { id: string }) => lead.id),
    ["lead-3"],
  );
});

test("active outreach step lead ids are excluded from output", async () => {
  const { code, stdout } = await runWithRows(
    [
      {
        id: "lead-1",
        business_name: "Active Step",
        email: "active@example.com",
        city: null,
        metadata: null,
        created_at: "2026-04-01T00:00:00Z",
        trade_types: null,
      },
      {
        id: "lead-2",
        business_name: "No Step",
        email: "open@example.com",
        city: null,
        metadata: null,
        created_at: "2026-04-02T00:00:00Z",
        trade_types: null,
      },
    ],
    [{ intake_lead_id: "lead-1" }],
  );

  assert.equal(code, 0);
  assert.deepEqual(
    JSON.parse(stdout[0]).map((lead: { id: string }) => lead.id),
    ["lead-2"],
  );
});

test("--max limits output after filtering", async () => {
  const { code, stdout } = await runWithRows(
    [
      {
        id: "lead-1",
        business_name: "First",
        email: "first@example.com",
        city: null,
        metadata: null,
        created_at: "2026-04-01T00:00:00Z",
        trade_types: null,
      },
      {
        id: "lead-2",
        business_name: "Second",
        email: "second@example.com",
        city: null,
        metadata: null,
        created_at: "2026-04-02T00:00:00Z",
        trade_types: null,
      },
      {
        id: "lead-3",
        business_name: "Third",
        email: "third@example.com",
        city: null,
        metadata: null,
        created_at: "2026-04-03T00:00:00Z",
        trade_types: null,
      },
    ],
    [],
    "1",
  );

  assert.equal(code, 0);
  assert.deepEqual(
    JSON.parse(stdout[0]).map((lead: { id: string }) => lead.id),
    ["lead-1"],
  );
});

test("empty result returns an empty JSON array", async () => {
  const { code, stdout, stderr } = await runWithRows([], []);

  assert.equal(code, 0);
  assert.deepEqual(stderr, []);
  assert.deepEqual(JSON.parse(stdout[0]), []);
});
