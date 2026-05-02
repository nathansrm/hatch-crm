import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import {
  GOOGLE_OAUTH_SCOPES,
  createOAuthState,
  getCurrentUser,
  getGoogleOAuthConfig,
  gmailCorsHeaders,
  hashOAuthState,
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

  try {
    const { clientId, redirectUri } = getGoogleOAuthConfig();
    const state = createOAuthState();
    const stateHash = await hashOAuthState(state);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin.from("gmail_oauth_states").insert({
      state_hash: stateHash,
      user_id: user.id,
      expires_at: expiresAt,
    });

    if (error) {
      throw new Error(`OAuth state storage failed: ${error.message}`);
    }

    const authorizationUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", GOOGLE_OAUTH_SCOPES.join(" "));
    authorizationUrl.searchParams.set("access_type", "offline");
    authorizationUrl.searchParams.set("prompt", "consent");
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("include_granted_scopes", "true");

    return jsonResponse({ authorization_url: authorizationUrl.toString() });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Gmail OAuth failed" },
      500,
    );
  }
});
