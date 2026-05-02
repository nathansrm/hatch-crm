const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bytesToBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const base64UrlToBytes = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

const getEncryptionKey = async () => {
  const secret = Deno.env.get("GOOGLE_TOKEN_ENCRYPTION_KEY")?.trim();
  if (!secret) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY is not configured");
  }

  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(secret),
  );
  return crypto.subtle.importKey("raw", keyMaterial, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
};

export const encryptGoogleToken = async (token: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getEncryptionKey();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(token),
  );

  return `v1:${bytesToBase64Url(iv)}:${bytesToBase64Url(
    new Uint8Array(encrypted),
  )}`;
};

export const decryptGoogleToken = async (encryptedToken: string) => {
  const [version, ivValue, tokenValue] = encryptedToken.split(":");
  if (version !== "v1" || !ivValue || !tokenValue) {
    throw new Error("Unsupported encrypted token format");
  }

  const key = await getEncryptionKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(ivValue) },
    key,
    base64UrlToBytes(tokenValue),
  );

  return decoder.decode(decrypted);
};
