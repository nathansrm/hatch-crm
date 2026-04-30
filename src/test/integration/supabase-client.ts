import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import path from "node:path";

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:54341";
const serviceRoleKey = process.env.SERVICE_ROLE_KEY!;
const LOCAL_E2E_SUPABASE_URL_PATTERN =
  /^https?:\/\/(127\.0\.0\.1|localhost):54341\b/;
const LOCAL_E2E_CONFIG_PATH = path.resolve(
  process.cwd(),
  ".supabase-e2e",
  "supabase",
  "config.toml",
);
const SAFE_SUPABASE_URL_MARKERS = [
  "localhost",
  "127.0.0.1",
  "integration",
  "staging",
  "sandbox",
  "test",
];

if (!serviceRoleKey) {
  throw new Error(
    "SERVICE_ROLE_KEY is required for integration tests. Set it in .env.e2e",
  );
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function assertSafeIntegrationTarget() {
  const isSafeTarget = SAFE_SUPABASE_URL_MARKERS.some((marker) =>
    supabaseUrl.includes(marker),
  );

  if (!isSafeTarget) {
    throw new Error(
      `Refusing integration tests against non-test Supabase URL: ${supabaseUrl}`,
    );
  }

  if (
    LOCAL_E2E_SUPABASE_URL_PATTERN.test(supabaseUrl) &&
    !existsSync(LOCAL_E2E_CONFIG_PATH) &&
    process.env.ALLOW_EXTERNAL_TEST_SUPABASE !== "1"
  ) {
    throw new Error(
      [
        `Refusing integration tests against ${supabaseUrl} because ${LOCAL_E2E_CONFIG_PATH} is missing.`,
        "Start the repo-local e2e stack first, or set ALLOW_EXTERNAL_TEST_SUPABASE=1 when intentionally targeting an external test instance.",
      ].join(" "),
    );
  }
}

// Tables in FK-safe deletion order (children before parents). Some join tables
// do not have an id column, so cleanup uses a known non-null column per table.
const CLEANUP_TABLES = [
  ["integration_log", "id"],
  ["n8n_workflow_runs", "id"],
  ["audit_reports", "id"],
  ["audit_results", "id"],
  ["deal_contacts", "deal_id"],
  ["contact_tags", "contact_id"],
  ["tasks", "id"],
  ["contact_notes", "id"],
  ["deal_notes", "id"],
  ["deals", "id"],
  ["contacts", "id"],
  ["companies", "id"],
  ["tags", "id"],
] as const;

export async function cleanupTestData() {
  assertSafeIntegrationTarget();

  for (const [table, column] of CLEANUP_TABLES) {
    const { error } = await supabase
      .from(table)
      .delete()
      .not(column, "is", null);
    if (error) {
      throw new Error(`Failed to clean ${table}: ${error.message}`);
    }
  }
}

export async function createTestUser() {
  assertSafeIntegrationTarget();

  const email = `test-${Date.now()}@integration.test`;
  const password = "test-password-123";

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw new Error(`Failed to create test user: ${error.message}`);

  // Wait for the sales trigger to fire — poll instead of fixed sleep
  let sales: { id: number } | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data: row } = await supabase
      .from("sales")
      .select("id")
      .eq("user_id", data.user.id)
      .single();
    if (row) {
      sales = row;
      break;
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  if (!sales) {
    throw new Error("Sales row not created by auth trigger after 3s");
  }

  return { userId: data.user.id, salesId: sales.id, email };
}

export async function deleteTestUser(userId: string) {
  if (!userId) return;
  // Delete the sales row first since it references user_id without ON DELETE CASCADE
  await supabase.from("sales").delete().eq("user_id", userId);
  await supabase.auth.admin.deleteUser(userId);
}
