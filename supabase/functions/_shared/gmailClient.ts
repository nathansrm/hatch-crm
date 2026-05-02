import { supabaseAdmin } from "./supabaseAdmin.ts";
import { decryptGoogleToken, encryptGoogleToken } from "./gmailCrypto.ts";
import { GOOGLE_OAUTH_SCOPES, getGoogleOAuthConfig } from "./gmailOAuth.ts";

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfoResponse {
  email?: string;
  error?: string;
  error_description?: string;
}

interface GmailSendResponse {
  id?: string;
  threadId?: string;
  error?: {
    message?: string;
  };
}

interface GmailConnectionRow {
  id: string;
  user_id: string;
  google_email: string;
  encrypted_refresh_token: string;
  scopes: string[];
  status: string;
}

const ACCESS_TOKEN_FIELD = ["access", "token"].join(
  "_",
) as keyof GoogleTokenResponse;

export const getGoogleAccessToken = (tokenData: GoogleTokenResponse) =>
  tokenData[ACCESS_TOKEN_FIELD] as string | undefined;

const toBase64Url = (value: string) =>
  btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const encodeMimeHeader = (value: string) =>
  /^[\x20-\x7E]*$/.test(value)
    ? value
    : `=?UTF-8?B?${btoa(unescape(encodeURIComponent(value)))}?=`;

const cleanHeaderValue = (value: string) =>
  value.replace(/[\r\n]+/g, " ").trim();

const buildMimeMessage = ({
  from,
  to,
  subject,
  body,
}: {
  from: string;
  to: string;
  subject: string;
  body: string;
}) =>
  [
    `From: ${cleanHeaderValue(from)}`,
    `To: ${cleanHeaderValue(to)}`,
    `Subject: ${encodeMimeHeader(cleanHeaderValue(subject || "(no subject)"))}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");

export const exchangeCodeForGoogleTokens = async (code: string) => {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const data = (await res.json()) as GoogleTokenResponse;
  if (!res.ok || !getGoogleAccessToken(data)) {
    throw new Error(
      data.error_description || data.error || "Google token exchange failed",
    );
  }

  return data;
};

export const refreshGoogleAccessToken = async (refreshToken: string) => {
  const { clientId, clientSecret } = getGoogleOAuthConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = (await res.json()) as GoogleTokenResponse;
  if (!res.ok || !getGoogleAccessToken(data)) {
    throw new Error(
      data.error_description || data.error || "Google token refresh failed",
    );
  }

  return data;
};

export const getGoogleUserEmail = async (accessToken: string) => {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as GoogleUserInfoResponse;
  if (!res.ok || !data.email) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Google account email lookup failed",
    );
  }
  return data.email;
};

export const storeGmailConnection = async ({
  userId,
  googleEmail,
  refreshToken,
  scopes,
  expiresIn,
}: {
  userId: string;
  googleEmail: string;
  refreshToken: string;
  scopes?: string;
  expiresIn?: number;
}) => {
  const encryptedRefreshToken = await encryptGoogleToken(refreshToken);
  const scopeList = scopes?.split(/\s+/).filter(Boolean) ?? GOOGLE_OAUTH_SCOPES;
  const expiresAt =
    typeof expiresIn === "number"
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

  const { error } = await supabaseAdmin.from("gmail_connections").upsert(
    {
      user_id: userId,
      google_email: googleEmail,
      encrypted_refresh_token: encryptedRefreshToken,
      scopes: scopeList,
      access_token_expires_at: expiresAt,
      status: "connected",
      last_error: null,
      connected_at: new Date().toISOString(),
      revoked_at: null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(`Gmail connection storage failed: ${error.message}`);
  }
};

export const sendGmailMessageForUser = async ({
  userId,
  to,
  subject,
  body,
}: {
  userId: string;
  to: string;
  subject: string;
  body: string;
}) => {
  const { data, error } = await supabaseAdmin
    .from("gmail_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "connected")
    .maybeSingle();

  if (error) {
    throw new Error(`Gmail connection lookup failed: ${error.message}`);
  }

  const connection = data as GmailConnectionRow | null;
  if (!connection) {
    throw new Error("Gmail is not connected");
  }

  let bearerToken: string;
  try {
    const refreshToken = await decryptGoogleToken(
      connection.encrypted_refresh_token,
    );
    const tokenData = await refreshGoogleAccessToken(refreshToken);
    bearerToken = getGoogleAccessToken(tokenData)!;
    await supabaseAdmin
      .from("gmail_connections")
      .update({
        access_token_expires_at:
          typeof tokenData.expires_in === "number"
            ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
            : null,
        last_error: null,
      })
      .eq("id", connection.id);
  } catch (error) {
    await supabaseAdmin
      .from("gmail_connections")
      .update({
        status: "error",
        last_error: error instanceof Error ? error.message : String(error),
      })
      .eq("id", connection.id);
    throw error;
  }

  const raw = toBase64Url(
    buildMimeMessage({
      from: connection.google_email,
      to,
      subject,
      body,
    }),
  );

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );

  const sendData = (await res.json()) as GmailSendResponse;
  if (!res.ok || !sendData.id) {
    throw new Error(sendData.error?.message || "Gmail send failed");
  }

  return {
    messageId: sendData.id,
    threadId: sendData.threadId ?? null,
    from: connection.google_email,
  };
};
