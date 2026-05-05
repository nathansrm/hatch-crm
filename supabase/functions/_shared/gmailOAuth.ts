import { createClient, type User } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

const encoder = new TextEncoder();

export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
export const GOOGLE_OAUTH_SCOPES = ["openid", "email", GMAIL_SEND_SCOPE];

export const gmailCorsHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...gmailCorsHeaders,
    },
  });

export const getGoogleOAuthConfig = () => {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")?.trim();
  const redirectUri =
    Deno.env.get("GOOGLE_REDIRECT_URI")?.trim() ||
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/gmail-oauth-callback`;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth is not configured");
  }

  return { clientId, clientSecret, redirectUri };
};

export const getCurrentUser = async (req: Request): Promise<User | null> => {
  const authHeader =
    req.headers.get("Authorization") ?? req.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("SB_PUBLISHABLE_KEY") ??
      "",
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    },
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user;
};

const bytesToBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

export const createOAuthState = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64Url(bytes);
};

export const hashOAuthState = async (state: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(state));
  return bytesToBase64Url(new Uint8Array(digest));
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const htmlResponse = (title: string, message: string, ok = true) => {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle}</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Inter, system-ui, sans-serif;
        background: #101820;
        color: #f7fbff;
      }
      main {
        max-width: 440px;
        padding: 32px;
        text-align: center;
      }
      h1 { font-size: 22px; margin: 0 0 10px; }
      p { color: #b7c3cc; line-height: 1.5; margin: 0; }
    </style>
  </head>
  <body>
    <main>
      <h1>${ok ? "Gmail connected" : "Gmail connection failed"}</h1>
      <p>${safeMessage}</p>
    </main>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: "hatch:gmail-oauth-complete", ok: ${ok} }, "*");
        window.close();
      }
    </script>
  </body>
</html>`,
    {
      status: ok ? 200 : 400,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...gmailCorsHeaders,
      },
    },
  );
};
