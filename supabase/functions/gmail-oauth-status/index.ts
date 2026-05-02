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

  const { data, error } = await supabaseAdmin
    .from("gmail_connections")
    .select(
      "google_email, scopes, status, last_error, connected_at, revoked_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  if (!data || data.status === "revoked") {
    return jsonResponse({ connected: false, status: "disconnected" });
  }

  return jsonResponse({
    connected: data.status === "connected",
    google_email: data.google_email,
    scopes: data.scopes,
    status: data.status,
    last_error: data.last_error,
    connected_at: data.connected_at,
    revoked_at: data.revoked_at,
  });
});
