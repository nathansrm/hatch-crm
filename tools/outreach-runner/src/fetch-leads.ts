#!/usr/bin/env node

declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  stdout: { write(data: string): boolean };
  exit(code?: number): never;
};

const ACTIVE_OUTREACH_STATUSES = [
  "ai_reviewed",
  "approved",
  "drafting",
  "action_needed",
  "sent",
] as const;

type Logger = (message: string) => void;
type CreateClient = (supabaseUrl: string, serviceRoleKey: string) => unknown;

type QueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

interface SupabaseQueryBuilder<T> extends PromiseLike<QueryResult<T>> {
  select(columns: string): SupabaseQueryBuilder<T>;
  eq(column: string, value: unknown): SupabaseQueryBuilder<T>;
  not(
    column: string,
    operator: string,
    value: unknown,
  ): SupabaseQueryBuilder<T>;
  neq(column: string, value: unknown): SupabaseQueryBuilder<T>;
  in(column: string, values: readonly string[]): SupabaseQueryBuilder<T>;
  order(
    column: string,
    options: { ascending: boolean },
  ): SupabaseQueryBuilder<T>;
}

interface SupabaseClientLike {
  from<T>(table: string): SupabaseQueryBuilder<T>;
}

type TradeTypeJoin =
  | { name?: string | null }
  | { name?: string | null }[]
  | null;

type IntakeLeadRow = {
  id: string;
  business_name: string;
  email: string | null;
  city: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  trade_types?: TradeTypeJoin;
};

type OutreachStepRow = {
  intake_lead_id: string | null;
};

type FetchedLead = {
  id: string;
  business_name: string;
  email: string;
  city: string | null;
  owner_name: string | null;
  trade_type: string | null;
};

let createClientForTest: (() => SupabaseClientLike) | null = null;

export function setCreateClientForTest(
  factory: (() => SupabaseClientLike) | null,
) {
  createClientForTest = factory;
}

function parseMax(argv: string[]) {
  const maxIndex = argv.indexOf("--max");
  if (maxIndex === -1) {
    return 10;
  }

  const value = Number.parseInt(argv[maxIndex + 1] ?? "", 10);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error("--max must be a positive integer");
  }

  return value;
}

function getTradeTypeName(tradeTypes: TradeTypeJoin | undefined) {
  if (!tradeTypes) {
    return null;
  }

  if (Array.isArray(tradeTypes)) {
    const name = tradeTypes[0]?.name;
    return typeof name === "string" && name.trim() ? name : null;
  }

  return typeof tradeTypes.name === "string" && tradeTypes.name.trim()
    ? tradeTypes.name
    : null;
}

function getOwnerName(metadata: Record<string, unknown> | null) {
  const ownerName = metadata?.owner_name;
  return typeof ownerName === "string" && ownerName.trim() ? ownerName : null;
}

function flattenLead(row: IntakeLeadRow): FetchedLead {
  return {
    id: row.id,
    business_name: row.business_name,
    email: row.email ?? "",
    city: row.city,
    owner_name: getOwnerName(row.metadata),
    trade_type: getTradeTypeName(row.trade_types),
  };
}

async function createSupabaseClient(env: Record<string, string | undefined>) {
  if (createClientForTest) {
    return createClientForTest();
  }

  const supabaseUrl = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is required");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  const moduleName = "@supabase/supabase-js";
  const supabaseModule = (await import(moduleName)) as {
    createClient: CreateClient;
  };
  return supabaseModule.createClient(
    supabaseUrl,
    serviceRoleKey,
  ) as SupabaseClientLike;
}

export async function fetchLeads(
  env: Record<string, string | undefined>,
  max: number,
): Promise<FetchedLead[]> {
  const supabase = await createSupabaseClient(env);

  const leadsResult = (await supabase
    .from<IntakeLeadRow>("intake_leads")
    .select(
      "id, business_name, email, city, metadata, created_at, trade_types(name)",
    )
    .eq("status", "uncontacted")
    .not("email", "is", null)
    .neq("email", "")
    .order("created_at", { ascending: true })) as QueryResult<IntakeLeadRow>;

  if (leadsResult.error) {
    throw new Error(`intake_leads query failed: ${leadsResult.error.message}`);
  }

  const stepsResult = (await supabase
    .from<OutreachStepRow>("outreach_steps")
    .select("intake_lead_id")
    .in("status", ACTIVE_OUTREACH_STATUSES)) as QueryResult<OutreachStepRow>;

  if (stepsResult.error) {
    throw new Error(
      `outreach_steps query failed: ${stepsResult.error.message}`,
    );
  }

  const activeLeadIds = new Set(
    (stepsResult.data ?? [])
      .map((step) => step.intake_lead_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0),
  );

  return (leadsResult.data ?? [])
    .filter(
      (lead) => typeof lead.email === "string" && lead.email.trim().length > 0,
    )
    .filter((lead) => !activeLeadIds.has(lead.id))
    .sort((left, right) => left.created_at.localeCompare(right.created_at))
    .slice(0, max)
    .map(flattenLead);
}

export async function runFetchLeads(
  argv: string[],
  env: Record<string, string | undefined>,
  stdout: Logger = (message) => process.stdout.write(`${message}\n`),
  stderr: Logger = console.error,
) {
  try {
    const max = parseMax(argv);
    const leads = await fetchLeads(env, max);
    stdout(JSON.stringify(leads));
    return 0;
  } catch (error) {
    stderr(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (
  process.argv[1]?.endsWith("fetch-leads.js") ||
  process.argv[1]?.endsWith("fetch-leads.ts")
) {
  runFetchLeads(process.argv, process.env).then((code) => process.exit(code));
}
