import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import {
  exchangeCodeForGoogleTokens,
  getGoogleAccessToken,
  getGoogleUserEmail,
  storeGmailConnection,
} from "../_shared/gmailClient.ts";
import {
  gmailCorsHeaders,
  hashOAuthState,
  htmlResponse,
  jsonResponse,
} from "../_shared/gmailOAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: gmailCorsHeaders });
  }
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return htmlResponse(
      "Gmail connection failed",
      "Google did not authorize the Gmail connection.",
      false,
    );
  }

  if (!code || !state) {
    return htmlResponse(
      "Gmail connection failed",
      "The Google callback was missing required OAuth data.",
      false,
    );
  }

  try {
    const stateHash = await hashOAuthState(state);
    const { data, error } = await supabaseAdmin
      .from("gmail_oauth_states")
      .select("state_hash, user_id, expires_at, consumed_at")
      .eq("state_hash", stateHash)
      .maybeSingle();

    if (error) {
      throw new Error(`OAuth state lookup failed: ${error.message}`);
    }
    if (!data || data.consumed_at) {
      throw new Error("OAuth state is invalid");
    }
    if (new Date(data.expires_at).getTime() < Date.now()) {
      throw new Error("OAuth state expired");
    }

    const tokenData = await exchangeCodeForGoogleTokens(code);
    if (!tokenData.refresh_token) {
      throw new Error("Google did not return a refresh token");
    }

    const googleAccessToken = getGoogleAccessToken(tokenData);
    if (!googleAccessToken) {
      throw new Error("Google did not return an access token");
    }

    const googleEmail = await getGoogleUserEmail(googleAccessToken);
    await storeGmailConnection({
      userId: data.user_id,
      googleEmail,
      refreshToken: tokenData.refresh_token,
      scopes: tokenData.scope,
      expiresIn: tokenData.expires_in,
    });

    await supabaseAdmin
      .from("gmail_oauth_states")
      .update({ consumed_at: new Date().toISOString() })
      .eq("state_hash", stateHash);

    await supabaseAdmin.from("integration_log").insert({
      source: "gmail",
      action: "connect",
      entity_type: "user",
      entity_id: data.user_id,
      payload: {},
      result: { google_email: googleEmail },
    });

    return htmlResponse(
      "Gmail connected",
      "You can close this window and return to Hatch Theory Solutions.",
    );
  } catch (error) {
    console.error("Gmail OAuth callback failed:", error);
    return htmlResponse(
      "Gmail connection failed",
      error instanceof Error ? error.message : "Gmail connection failed.",
      false,
    );
  }
});
