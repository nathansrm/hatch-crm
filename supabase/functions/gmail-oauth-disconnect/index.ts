import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import {
  getCurrentUser,
  gmailCorsHeaders,
  jsonResponse,
} from "../_shared/gmailOAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: gmailCorsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  const user = await getCurrentUser(req);
  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { data, error: lookupError } = await supabaseAdmin
    .from("gmail_connections")
    .select("id, google_email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    return jsonResponse({ error: lookupError.message }, 500);
  }

  if (!data) {
    return jsonResponse({ success: true });
  }

  const { error } = await supabaseAdmin
    .from("gmail_connections")
    .update({
      status: "revoked",
      encrypted_refresh_token: "",
      last_error: null,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  await supabaseAdmin.from("integration_log").insert({
    source: "gmail",
    action: "disconnect",
    entity_type: "user",
    entity_id: user.id,
    payload: {},
    result: { google_email: data.google_email },
  });

  return jsonResponse({ success: true });
});
